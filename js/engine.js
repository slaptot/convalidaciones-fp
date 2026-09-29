/*
 * Motor de reglas de convalidación.
 *
 * evaluar(ciclo, normativa, aportaciones, ambito)
 *   ciclo        -> window.CICLOS[id] (generado por tools/build_data.py)
 *   normativa    -> window.NORMATIVA
 *   aportaciones -> lo que aporta el alumno:
 *     {tipo:'modulo_loe',   codigo, nombre, titulo, docs}
 *     {tipo:'modulo_logse', titulo, modulo, docs}
 *     {tipo:'uc',           codigo, via, docs}
 *     {tipo:'universidad',  titulacion, asignaturas, docs}
 *     {tipo:'experiencia',  meses, relacionada, docs}
 *     {tipo:'certificado',  clave, docs}
 *   ambito       -> 'aragon' | 'mefp' (plan de estudios / horas)
 *
 * Devuelve una fila por módulo del plan con el mejor resultado, alternativas
 * y la documentación que falta.
 */
(function () {
  const PRIORIDAD = { superado: 0, convalidable: 1, exento: 2, ministerio: 3, revisar: 4 };
  const norm = (s) => (s || '').toString().trim().toUpperCase().replace(/^ECP/, 'UC');
  const GENERAL_LOGSE = 'Cualquier ciclo LOGSE';

  // Pseudo-módulo: desde la LO 3/2022 la formación en empresa no es un módulo con código
  const FORMACION_EMPRESA = {
    codigo: 'FE', nombre: 'Periodo de formación en empresa', tipo: 'empresa', comun: 'empresa',
    horas: {}, curso: {}, nota: 'Integrado en los módulos (RD 659/2023, título IV). Solo admite exención.',
  };

  // Índice de los certificados de profesionalidad: MF -> UC, UF -> MF
  function indiceCertificados(cat) {
    const mf = {}, uf = {};
    for (const c of (cat && cat.certificados) || []) {
      for (const m of c.mf || []) {
        if (!m.uc) continue; // los módulos de prácticas (MP) no acreditan UC
        mf[m.codigo] = {
          ...m, certificado: c.codigo, certificado_nombre: c.nombre,
          ucs: (m.uc_vigente && m.uc_vigente.length ? m.uc_vigente : [m.uc]),
        };
        for (const u of m.uf || []) uf[u.codigo] = { ...u, mf: m.codigo };
      }
    }
    return { mf, uf };
  }

  /* Traduce lo aportado del certificado (MF y UF) a UC acreditadas.
     Un MF superado acredita su UC (acreditación parcial acumulable, RD 34/2008 art. 16.2).
     Todas las UF de un MF equivalen al MF (art. 6.2); una UF suelta no acredita nada. */
  function derivarDeCertificados(aportaciones, idx) {
    const pares = [], avisos = [];
    const mfDirectos = aportaciones.filter((a) => a.tipo === 'mf');
    const ufs = aportaciones.filter((a) => a.tipo === 'uf');

    for (const a of mfDirectos) {
      const m = idx.mf[a.codigo];
      if (m) m.ucs.forEach((u) => pares.push({ codigo: u, aporte: a, origen: m }));
    }
    // Agrupa UF por su MF
    const porMf = {};
    for (const a of ufs) {
      const u = idx.uf[a.codigo];
      if (u) (porMf[u.mf] ||= []).push(a);
    }
    for (const [cod, lista] of Object.entries(porMf)) {
      const m = idx.mf[cod];
      const faltan = (m.uf || []).map((u) => u.codigo).filter((c) => !lista.some((a) => a.codigo === c));
      if (mfDirectos.some((a) => a.codigo === cod)) continue; // el MF ya se aportó entero
      if (faltan.length) {
        avisos.push(`${lista.map((a) => a.codigo).join(', ')}: las unidades formativas sueltas no acreditan ninguna UC (RD 34/2008 art. 6.2). Para completar ${cod} falta ${faltan.join(', ')}.`);
      } else {
        m.ucs.forEach((u) => pares.push({ codigo: u, aporte: lista[0], origen: m, via_uf: lista }));
        avisos.push(`${cod} se da por superado con todas sus unidades formativas; el RD 34/2008 art. 6.2 exige además haber cursado al menos una UF por año de forma consecutiva.`);
      }
    }
    if (pares.length) {
      avisos.push('La certificación de módulos formativos debe estar expedida por la Administración laboral (acreditación parcial acumulable); un diploma del centro que impartió el curso no sirve.');
    }
    return { pares, avisos };
  }

  /* Un título completo aportado se traduce a lo que ya sabe evaluar el motor:
     la fila "Ciclo completo" de las tablas, las reglas de ciclo completo
     (Emergencias, Comercio/Administración, PRL) y, si es un título cargado,
     sus módulos uno a uno. */
  function expandirTitulos(aportaciones, ciclos) {
    const extra = [], avisos = [];
    for (const a of aportaciones.filter((x) => x.tipo === 'titulo')) {
      if (a.gb) {
        avisos.push('Los títulos de Grado Básico convalidan ámbitos de Grado Básico (RD 1085/2020 art. 2.2); no dan convalidación directa en un ciclo de grado medio o superior.');
        continue;
      }
      if (a.clave) extra.push({ tipo: 'certificado', clave: a.clave, docs: a.docs });
      if (a.titulo) extra.push({ tipo: 'modulo_logse', titulo: a.titulo, modulo: 'Ciclo completo', docs: a.docs });
      const c = a.ciclo && ciclos[a.ciclo];
      if (c) {
        for (const m of c.modulos) {
          if (m.tipo === 'optativo') continue;
          extra.push(c.ciclo.plan === 'LOGSE'
            ? { tipo: 'modulo_logse', titulo: c.ciclo.nombre, modulo: m.nombre, docs: a.docs }
            : { tipo: 'modulo_loe', codigo: m.codigo, nombre: m.nombre, titulo: c.ciclo.nombre, docs: a.docs });
        }
      }
    }
    return { extra, avisos };
  }

  function planDeEstudios(ciclo, ambito) {
    const mods = ciclo.modulos.filter((m) => m.horas?.[ambito] != null || m.tipo === 'optativo');
    // En LOGSE la FCT es un módulo propio del título
    return ciclo.ciclo.plan === 'LOGSE' ? mods : [...mods, FORMACION_EMPRESA];
  }

  function faltanDocs(normativa, r) {
    const faltan = new Set(r.faltan_extra || []);
    for (const a of r.aportes) {
      const tiene = new Set(a.docs || []);
      normativa.requeridos(a).forEach((d) => { if (!tiene.has(d)) faltan.add(d); });
    }
    return [...faltan];
  }

  function evaluar(ciclo, normativa, aportadas, ambito = 'aragon') {
    const titulos = expandirTitulos(aportadas, window.CICLOS || {});
    const aportaciones = [...aportadas, ...titulos.extra];
    const modulos = planDeEstudios(ciclo, ambito);
    const enPlan = new Set(modulos.map((m) => m.codigo));
    const candidatos = {};
    const add = (cod, r) => { if (enPlan.has(cod)) (candidatos[cod] ||= []).push(r); };
    const cal = (k) => normativa.calificacion[k];

    const por = (t) => aportaciones.filter((a) => a.tipo === t);
    const loe = por('modulo_loe'), logse = por('modulo_logse'), ucs = por('uc');
    const univ = por('universidad'), exp = por('experiencia'), certs = por('certificado');

    // MF y UF del certificado de profesionalidad -> UC acreditadas
    const idx = indiceCertificados(window.CERTIFICADOS);
    const derivado = derivarDeCertificados(aportaciones, idx);
    const ucPares = [
      ...ucs.map((a) => ({ codigo: a.codigo, aporte: a })),
      ...derivado.pares,
    ];

    // UC acreditadas, incluyendo las equivalentes a UC suprimidas (RD 532/2025)
    const ucSet = new Set(ucPares.map((p) => norm(p.codigo)));
    const equiv = ciclo.uc_equivalencias || {};
    for (const [ant, nuevas] of Object.entries(equiv)) {
      // Código suprimido acreditado -> vale el vigente, y al revés si se tienen todos los vigentes
      if (ucSet.has(norm(ant))) nuevas.forEach((n) => ucSet.add(norm(n)));
      if (nuevas.every((n) => ucSet.has(norm(n)))) ucSet.add(norm(ant));
    }
    const aportaUc = (p, req) => {
      const c = norm(p.codigo);
      if (req.includes(c)) return true;
      const nuevas = (equiv[c] || []).map(norm);
      if (nuevas.some((n) => req.includes(n))) return true;
      return Object.entries(equiv).some(([ant, ns]) => req.includes(norm(ant)) && ns.map(norm).includes(c));
    };

    // 1. Mismo código: módulo idéntico, se traslada la nota
    for (const m of modulos) {
      if (m.tipo === 'optativo') continue; // "OPT" no es un código estatal: se convalida por la regla C24
      const hit = loe.find((a) => norm(a.codigo) === norm(m.codigo));
      if (!hit) continue;
      add(m.codigo, {
        estado: 'superado', resuelve: 'Secretaría (traslado de nota en la matrícula)', calificacion: cal('superado'),
        motivo: `Módulo ${m.codigo} superado en ${hit.titulo || 'otro ciclo'}`,
        fundamento: normativa.fundamentos.mismo_codigo, aportes: [hit],
        aviso: ['digitalizacion', 'sostenibilidad'].includes(m.comun)
          ? 'RD 659/2023 art. 126.3: exige misma familia profesional y mismo grado; comprobar.' : undefined,
      });
    }

    // 1b. LOGSE: mismo módulo del mismo título superado en otro centro/matrícula
    if (ciclo.ciclo.plan === 'LOGSE') {
      for (const m of modulos) {
        const hit = logse.find((a) => a.titulo === ciclo.ciclo.nombre && norm(a.modulo) === norm(m.nombre));
        if (hit) add(m.codigo, {
          estado: 'superado', resuelve: 'Secretaría (traslado de nota)', calificacion: cal('superado'),
          motivo: `Módulo superado del mismo título (${ciclo.ciclo.nombre})`,
          fundamento: normativa.fundamentos.mismo_codigo, aportes: [hit],
        });
      }
    }

    // 2. Tabla del título: módulos de títulos anteriores (LOGSE)
    for (const fila of ciclo.convalidaciones_titulos_anteriores || []) {
      const usados = fila.origen_modulo.map((om) =>
        logse.find((a) => norm(a.modulo) === norm(om) && (a.titulo === GENERAL_LOGSE || norm(a.titulo) === norm(fila.origen_titulo))));
      if (!usados.every(Boolean)) continue;
      fila.destino_modulos.forEach((d) => add(d, {
        estado: 'convalidable', resuelve: 'Dirección del centro', calificacion: cal('tabla'),
        motivo: `${fila.origen_modulo.join(' + ')} (${fila.origen_titulo})`,
        fundamento: fila.fuente, aportes: usados,
      }));
    }

    // 3. Tabla del título: módulos LOE de otros ciclos
    for (const fila of ciclo.convalidaciones_loe || []) {
      const usados = fila.origen_codigos.map((c) => loe.find((a) => norm(a.codigo) === norm(c)));
      if (!usados.every(Boolean)) continue;
      fila.destino_modulos.forEach((d) => add(d, {
        estado: 'convalidable', resuelve: 'Dirección del centro', calificacion: cal('tabla'),
        motivo: `${fila.origen_codigos.join(' + ')} ${fila.origen_nombre} (LOE)`,
        fundamento: fila.fuente, aportes: usados,
      }));
    }

    // 4. Unidades de competencia acreditadas
    for (const fila of ciclo.uc_a_modulos || []) {
      const req = fila.uc.map(norm);
      if (!req.every((u) => ucSet.has(u))) continue;
      const usados = [...new Set(ucPares.filter((p) => aportaUc(p, req)).map((p) => p.aporte))];
      const viaCert = usados.filter((a) => a.tipo === 'mf' || a.tipo === 'uf');
      fila.modulos.forEach((d) => add(d, {
        estado: 'convalidable', resuelve: 'Dirección del centro', calificacion: cal('uc'),
        motivo: `Acredita ${fila.uc.join(' + ')}${fila.nota ? ` (${fila.nota})` : ''}`
          + (viaCert.length ? ` · vía ${viaCert.map((a) => a.codigo).join(', ')} del certificado` : ''),
        fundamento: `${fila.fuente}; ${normativa.fundamentos.uc}`, aportes: usados,
      }));
    }

    // 5. Reglas generales (módulos comunes, formación en empresa, inglés…)
    const ctx = { loe, logse, ucs, univ, exp, certs, ciclo, normativa };
    for (const regla of normativa.reglas_generales) {
      const destinos = modulos.filter((m) => regla.aplica_a.includes(m.comun));
      if (!destinos.length) continue;
      const res = regla.evaluar(ctx);
      if (!res) continue;
      destinos.forEach((m) => add(m.codigo, {
        estado: res.estado || regla.estado, resuelve: regla.resuelve, calificacion: cal(regla.calificacion),
        motivo: res.motivo, fundamento: regla.fundamento, aportes: res.aportes || [],
        faltan_extra: res.faltan_extra, aviso: regla.aviso,
      }));
    }

    // 6. Estudios universitarios: Ministerio, solo grado superior
    if (univ.length && ciclo.ciclo.grado === 'superior') {
      for (const m of modulos) {
        if (['empresa', 'proyecto'].includes(m.tipo)) continue;
        add(m.codigo, {
          estado: 'ministerio', resuelve: normativa.universidad.resuelve, calificacion: cal('sin_nota'),
          motivo: `Estudios universitarios: ${univ.map((u) => u.titulacion).join(', ')}. Requiere estudio de contenidos.`,
          fundamento: normativa.universidad.fundamento, aportes: univ, aviso: normativa.universidad.aviso,
        });
      }
    }

    // 7. Ciclo LOGSE de destino: módulos LOE aportados (salvo FOL) los resuelve el Ministerio
    const esFol = (a) => /formaci[oó]n\s+y\s+orientaci[oó]n\s+laboral/i.test(a.nombre || '');
    const loeMin = ciclo.ciclo.plan === 'LOGSE' ? loe.filter((a) => !esFol(a)) : [];
    if (loeMin.length) {
      for (const m of modulos) {
        if (m.tipo === 'empresa') continue;
        add(m.codigo, {
          estado: 'ministerio', resuelve: 'Ministerio (SG Ordenación e Innovación FP), tramitado por el centro',
          calificacion: cal('loe_logse'),
          motivo: `Módulos LOE aportados a un ciclo LOGSE (${loeMin.map((a) => a.codigo).join(', ')}): estudio individual`,
          fundamento: 'RD 1085/2020 art. 9.c; RD 659/2023 art. 127.b.4º', aportes: loeMin,
        });
      }
    }

    const avisosGlobales = [
      ...titulos.avisos,
      ...derivado.avisos,
      ...(normativa.avisos_generales || []).map((f) => f(ctx)).filter(Boolean),
    ];
    if (ucs.length && !(ciclo.uc_a_modulos || []).length) {
      avisosGlobales.push('Este título no tiene tabla de convalidación por unidades de competencia: las UC acreditadas no convalidan módulos.');
    }
    if (univ.length && ciclo.ciclo.grado !== 'superior') {
      avisosGlobales.push('Los estudios universitarios no permiten convalidar módulos de grado medio (RD 1618/2011; RD 1085/2020 art. 2.1.d).');
    }

    const filas = modulos.map((m) => {
      const lista = (candidatos[m.codigo] || []).map((r) => ({ ...r, faltan: faltanDocs(normativa, r) }));
      lista.sort((a, b) => PRIORIDAD[a.estado] - PRIORIDAD[b.estado] || a.faltan.length - b.faltan.length);
      const bloqueo = m.tipo === 'proyecto'
        ? `No convalidable ni exento (${normativa.fundamentos.proyecto})` : null;
      return { modulo: m, mejor: bloqueo ? null : lista[0] || null, alternativas: bloqueo ? [] : lista.slice(1), bloqueo };
    });
    return { filas, avisos: avisosGlobales };
  }

  window.Motor = { evaluar, PRIORIDAD, GENERAL_LOGSE };
})();
