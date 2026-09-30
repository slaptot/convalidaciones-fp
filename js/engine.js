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

  /* Las tablas escriben el título con su norma entre paréntesis
     ("Técnico Superior en … (LOE, RD 1629/2009, de 30 de octubre)"),
     mientras que el catálogo usa solo el nombre. Se comparan sin ese añadido. */
  const tituloBase = (t) => norm(t).split(' (')[0].replace(/\s+/g, ' ').trim();
  const mismoTitulo = (a, b) => {
    const x = tituloBase(a), y = tituloBase(b);
    return x === y || x.startsWith(y) || y.startsWith(x);
  };

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
    const mods = ciclo.modulos.filter((m) => m.horas?.[ambito] != null
      || (m.tipo === 'optativo' && ambito !== 'loe'));
    // Solo se añade el pseudo-módulo si el plan no tiene ya FCT (LOGSE y LOE a extinguir sí la tienen)
    // Hay cursos de especialización sin periodo de formación en empresa
    if (ciclo.ciclo.sin_formacion_empresa) return mods;
    return mods.some((m) => m.tipo === 'empresa') ? mods : [...mods, FORMACION_EMPRESA];
  }

  /* Calificación concreta con la que se convalida (Anexo VIII, aps. 15-24):
     - CV-n con la nota de lo aportado (media redondeada si son varios módulos)
     - CV-5 con unidades de competencia o certificado de profesionalidad
     - CV sin nota cuando no computa en la media */
  function calificacionSugerida(r, clave) {
    const notas = (r.aportes || []).map((a) => Number(a.nota)).filter((n) => n > 0);
    const media = notas.length ? Math.round(notas.reduce((s, n) => s + n, 0) / notas.length) : null;
    switch (clave) {
      case 'uc': return 'CV-5';
      case 'sin_nota': return 'CV';
      case 'exento': return 'Exento';
      case 'superado': return media ? String(media) : 'Nota trasladada';
      default: return media ? `CV-${media}` : 'CV-nota';
    }
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
    // Cada candidato guarda además la clave, para poder calcular la calificación concreta
    const conValor = (r, clave) => ({ ...r, calificacion: cal(clave), clave, valor: calificacionSugerida(r, clave) });

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
      add(m.codigo, conValor({
        estado: 'superado', resuelve: 'Secretaría (traslado de nota en la matrícula)',
        motivo: `Módulo ${m.codigo} superado en ${hit.titulo || 'otro ciclo'}`,
        fundamento: normativa.fundamentos.mismo_codigo, aportes: [hit],
        aviso: ['digitalizacion', 'sostenibilidad'].includes(m.comun)
          ? 'RD 659/2023 art. 126.3: exige misma familia profesional y mismo grado; comprobar.'
          : m.comun === 'tutoria'
            ? 'Módulo propio de Aragón: lo resuelve la Administración educativa autonómica (RD 1085/2020 art. 8.2).' : undefined,
      }, 'superado'));
    }

    // 1b. LOGSE: mismo módulo del mismo título superado en otro centro/matrícula
    if (ciclo.ciclo.plan === 'LOGSE') {
      for (const m of modulos) {
        const hit = logse.find((a) => a.titulo === ciclo.ciclo.nombre && norm(a.modulo) === norm(m.nombre));
        if (hit) add(m.codigo, conValor({
          estado: 'superado', resuelve: 'Secretaría (traslado de nota)',
          motivo: `Módulo superado del mismo título (${ciclo.ciclo.nombre})`,
          fundamento: normativa.fundamentos.mismo_codigo, aportes: [hit],
        }, 'superado'));
      }
    }

    // 2. Tabla del título: módulos de títulos anteriores (LOGSE)
    for (const fila of ciclo.convalidaciones_titulos_anteriores || []) {
      const usados = fila.origen_modulo.map((om) =>
        logse.find((a) => norm(a.modulo) === norm(om)
          && (a.titulo === GENERAL_LOGSE || mismoTitulo(a.titulo, fila.origen_titulo))));
      if (!usados.every(Boolean)) continue;
      fila.destino_modulos.forEach((d) => add(d, conValor({
        estado: 'convalidable', resuelve: 'Dirección del centro',
        motivo: `${fila.origen_modulo.join(' + ')} (${fila.origen_titulo})`,
        fundamento: fila.fuente, aportes: usados,
      }, 'tabla')));
    }

    // 3. Tabla del título: módulos LOE de otros ciclos
    for (const fila of ciclo.convalidaciones_loe || []) {
      const usados = fila.origen_codigos.map((c) => loe.find((a) => norm(a.codigo) === norm(c)));
      if (!usados.every(Boolean)) continue;
      fila.destino_modulos.forEach((d) => add(d, conValor({
        estado: 'convalidable', resuelve: 'Dirección del centro',
        motivo: `${fila.origen_codigos.join(' + ')} ${fila.origen_nombre} (LOE)`,
        fundamento: fila.fuente, aportes: usados,
      }, 'tabla')));
    }

    // 4. Unidades de competencia acreditadas
    for (const fila of ciclo.uc_a_modulos || []) {
      const req = fila.uc.map(norm);
      if (!req.every((u) => ucSet.has(u))) continue;
      const usados = [...new Set(ucPares.filter((p) => aportaUc(p, req)).map((p) => p.aporte))];
      const viaCert = usados.filter((a) => a.tipo === 'mf' || a.tipo === 'uf');
      fila.modulos.forEach((d) => add(d, conValor({
        estado: 'convalidable', resuelve: 'Dirección del centro',
        motivo: `Acredita ${fila.uc.join(' + ')}${fila.nota ? ` (${fila.nota})` : ''}`
          + (viaCert.length ? ` · vía ${viaCert.map((a) => a.codigo).join(', ')} del certificado` : ''),
        fundamento: `${fila.fuente}; ${normativa.fundamentos.uc}`, aportes: usados,
      }, 'uc')));
    }

    // 5. Reglas generales (módulos comunes, formación en empresa, inglés…)
    const ctx = { loe, logse, ucs, univ, exp, certs, ciclo, normativa };
    for (const regla of normativa.reglas_generales) {
      const destinos = modulos.filter((m) => regla.aplica_a.includes(m.comun));
      if (!destinos.length) continue;
      const res = regla.evaluar(ctx);
      if (!res) continue;
      destinos.forEach((m) => add(m.codigo, conValor({
        estado: res.estado || regla.estado, resuelve: regla.resuelve,
        motivo: res.motivo, fundamento: regla.fundamento, aportes: res.aportes || [],
        faltan_extra: res.faltan_extra, aviso: regla.aviso,
      }, regla.calificacion)));
    }

    // 6. Estudios universitarios: Ministerio, solo grado superior
    const esCurso = !!ciclo.ciclo.curso_especializacion;
    if (univ.length && ciclo.ciclo.grado === 'superior' && !esCurso) {
      for (const m of modulos) {
        if (['empresa', 'proyecto'].includes(m.tipo)) continue;
        add(m.codigo, conValor({
          estado: 'ministerio', resuelve: normativa.universidad.resuelve,
          motivo: `Estudios universitarios: ${univ.map((u) => u.titulacion).join(', ')}. Requiere estudio de contenidos.`,
          fundamento: normativa.universidad.fundamento, aportes: univ, aviso: normativa.universidad.aviso,
        }, 'sin_nota'));
      }
    }

    // 7. Ciclo LOGSE de destino: módulos LOE aportados (salvo FOL) los resuelve el Ministerio
    const esFol = (a) => /formaci[oó]n\s+y\s+orientaci[oó]n\s+laboral/i.test(a.nombre || '');
    const loeMin = ciclo.ciclo.plan === 'LOGSE' ? loe.filter((a) => !esFol(a)) : [];
    if (loeMin.length) {
      for (const m of modulos) {
        if (m.tipo === 'empresa') continue;
        add(m.codigo, conValor({
          estado: 'ministerio', resuelve: 'Ministerio (SG Ordenación e Innovación FP), tramitado por el centro',
          motivo: `Módulos LOE aportados a un ciclo LOGSE (${loeMin.map((a) => a.codigo).join(', ')}): estudio individual`,
          fundamento: 'RD 1085/2020 art. 9.c; RD 659/2023 art. 127.b.4º', aportes: loeMin,
        }, 'loe_logse'));
      }
    }

    const avisosGlobales = [
      ...(ciclo.ciclo.parcial
        ? [ciclo.ciclo.competencias_catedu
            ? 'Ciclo del catálogo de Aragón: las correspondencias con estándares de competencia proceden de la herramienta de CATEDU y no se han contrastado con el anexo V del RD del título. Falta además el anexo de convalidaciones con títulos anteriores.'
            : 'Ciclo del catálogo de Aragón: solo se aplican las reglas generales (módulos con el mismo código, FOL, EIE, inglés, exención). Faltan el anexo de convalidaciones del título y la correspondencia con unidades de competencia.']
        : []),
      ...(modulos.length <= 1 ? ['No hay datos de este plan de estudios para el ciclo seleccionado.'] : []),
      ...titulos.avisos,
      ...derivado.avisos,
      ...(normativa.avisos_generales || []).map((f) => f(ctx)).filter(Boolean),
    ];
    if (ucs.length && !(ciclo.uc_a_modulos || []).length) {
      avisosGlobales.push('Este título no tiene tabla de convalidación por unidades de competencia: las UC acreditadas no convalidan módulos.');
    }
    if (esCurso) {
      avisosGlobales.push('Curso de especialización (Grado E): no hay tablas de convalidación entre módulos (el RD 1085/2020 no los recoge). Solo cabe el módulo idéntico con el mismo código y, si el real decreto del curso la trae, la correspondencia con estándares de competencia.');
      if (ciclo.ciclo.sin_formacion_empresa) avisosGlobales.push('Este curso de especialización no tiene periodo de formación en empresa: no procede la exención.');
      else avisosGlobales.push('Exención de la formación en empresa en Grado E: bastan seis meses de experiencia relacionada (RD 659/2023 arts. 131.2 y 161.1). Comprobar en el real decreto del curso que tiene periodo de formación en empresa.');
      if (univ.length) avisosGlobales.push('Los estudios universitarios no permiten convalidar módulos de un curso de especialización: la LO 3/2022 art. 54.3 está pendiente de desarrollo y el RD 1085/2020 solo contempla títulos de Técnico Superior.');
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
