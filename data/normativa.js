/*
 * Normativa general de convalidaciones (Estado + Aragón).
 * Fuente del análisis: research/normativa-general.md (consulta 18/09/2026).
 * Cada regla cita su artículo; lo no verificado lleva "aviso".
 */
(function () {
  const RE = {
    fol: /formaci[oó]n\s+y\s+orientaci[oó]n\s+laboral/i,
    eie: /empresa\s+e\s+iniciativa\s+emprendedora/i,
  };
  const certs = (ctx, ...claves) => ctx.certs.filter((c) => claves.includes(c.clave));
  const logse = (ctx, ...mods) => ctx.logse.filter((a) => mods.includes(a.modulo));

  window.NORMATIVA = {
    documentos: {
      cert_academica: 'Certificación académica oficial con calificaciones',
      cert_uc: 'Certificación oficial de acreditación de UC (Administración competente)',
      cert_profesionalidad: 'Certificado de profesionalidad / certificado profesional',
      programas_univ: 'Programas de las asignaturas sellados por la universidad',
      cert_univ_programas: 'Certificación de la universidad de que los programas son los cursados',
      prl_basico: 'Certificado de PRL nivel básico (RD 39/1997) con horas y contenidos',
      vida_laboral: 'Certificado TGSS / ISM / mutualidad (empresa, grupo de cotización, periodo)',
      contrato_empresa: 'Contrato o certificado de empresa (duración, actividad y periodo)',
      cert_eoi: 'Certificado de la Escuela Oficial de Idiomas',
      titulo_univ: 'Certificación académica / título universitario',
      acreditacion_parcial: 'Certificación de módulos formativos superados (acreditación parcial acumulable) de la Administración laboral',
    },

    // Documentación que debe acompañar a cada aportación (se muestra como checklist)
    documentos_por_via: {
      modulo_loe: ['cert_academica'],
      modulo_logse: ['cert_academica'],
      uc: ['cert_uc', 'cert_profesionalidad'],
      titulo: ['cert_academica'],
      mf: ['cert_profesionalidad', 'acreditacion_parcial'],
      uf: ['cert_profesionalidad', 'acreditacion_parcial'],
      universidad: ['cert_academica', 'programas_univ', 'cert_univ_programas'],
      experiencia: ['vida_laboral', 'contrato_empresa'],
      certificado: ['cert_academica', 'cert_eoi', 'prl_basico', 'titulo_univ'],
    },

    // Qué documentos son exigibles para una aportación concreta
    requeridos(a) {
      switch (a.tipo) {
        case 'modulo_loe':
        case 'modulo_logse':
        case 'titulo': return ['cert_academica'];
        case 'uc': return [a.via === 'Certificado de profesionalidad' ? 'cert_profesionalidad' : 'cert_uc'];
        case 'mf':
        case 'uf': return (a.docs || []).includes('cert_profesionalidad') ? [] : ['acreditacion_parcial'];
        case 'universidad': return ['cert_academica', 'programas_univ', 'cert_univ_programas'];
        case 'experiencia': return ['vida_laboral', 'contrato_empresa'];
        case 'certificado': return [window.NORMATIVA.certificados_docs[a.clave]].filter(Boolean);
      }
      return [];
    },

    certificados: {
      prl_basico: 'Certificado de PRL nivel básico (RD 39/1997)',
      eoi_b1: 'EOI inglés: Nivel Intermedio B1 o Ciclo Elemental',
      eoi_b2: 'EOI inglés: Nivel Avanzado B2 o superior / Certificado de Aptitud',
      filologia_inglesa: 'Grado/Licenciatura en Filología Inglesa o Traducción e Interpretación (inglés)',
      ciclo_emergencias: 'Título de Técnico en Emergencias Sanitarias (ciclo completo)',
      ciclo_comercio_admin: 'Ciclo completo (GM o GS) de Comercio y Marketing o Administración y Gestión',
      ciclo_prl_logse: 'Título de TS en Prevención de Riesgos Profesionales (LOGSE)',
      optativo_otro_ciclo: 'Módulo optativo superado en otro ciclo del mismo grado',
    },
    certificados_docs: {
      prl_basico: 'prl_basico', eoi_b1: 'cert_eoi', eoi_b2: 'cert_eoi', filologia_inglesa: 'titulo_univ',
      ciclo_emergencias: 'cert_academica', ciclo_comercio_admin: 'cert_academica',
      ciclo_prl_logse: 'cert_academica', optativo_otro_ciclo: 'cert_academica',
    },

    // Títulos completos que convalidan por sí mismos (reglas generales)
    titulos_generales: [
      { clave: 'ciclo_emergencias', label: 'Técnico en Emergencias Sanitarias (LOE) — título completo' },
      { clave: 'ciclo_comercio_admin', label: 'Título completo (GM o GS) de Comercio y Marketing o Administración y Gestión' },
      { clave: 'ciclo_prl_logse', label: 'Técnico Superior en Prevención de Riesgos Profesionales (LOGSE)' },
    ],

    // Módulos LOGSE aportables desde cualquier ciclo (RD 1085/2020, Anexo II)
    modulos_logse_generales: [
      'Formación y orientación laboral',
      'Administración, gestión y comercialización en la pequeña empresa',
      'Administración y gestión de un pequeño establecimiento comercial',
      'Lengua extranjera (inglés) de grado medio',
      'Lengua extranjera (inglés) de grado superior',
    ],

    // Módulos LOE frecuentes para autocompletar (además de los de los ciclos cargados)
    modulos_comunes: [
      { codigo: '0218', nombre: 'Formación y orientación laboral', titulo: 'Técnico en APSD (LOE)' },
      { codigo: '0219', nombre: 'Empresa e iniciativa emprendedora', titulo: 'Técnico en APSD (LOE)' },
      { codigo: '1648', nombre: 'Formación y orientación laboral', titulo: 'TS en Termalismo y bienestar (LOE)' },
      { codigo: '1649', nombre: 'Empresa e iniciativa emprendedora', titulo: 'TS en Termalismo y bienestar (LOE)' },
      { codigo: '0229', nombre: 'Formación y orientación laboral', titulo: 'Técnico en SMR (LOE)' },
      { codigo: '0230', nombre: 'Empresa e iniciativa emprendedora', titulo: 'Técnico en SMR (LOE)' },
      { codigo: '0644', nombre: 'Formación y orientación laboral', titulo: 'Técnico en Estética y Belleza (LOE)' },
      { codigo: '0645', nombre: 'Empresa e iniciativa emprendedora', titulo: 'Técnico en Estética y Belleza (LOE)' },
      { codigo: '0017', nombre: 'Habilidades sociales', titulo: 'Ciclos LOE de SSC (Ed. Infantil, Integración Social…)' },
      { codigo: '0343', nombre: 'Sistemas aumentativos y alternativos de comunicación', titulo: 'TS Integración Social / Mediación Comunicativa' },
      { codigo: '1124', nombre: 'Dinamización grupal', titulo: 'TS Animación Sociocultural y Turística / Termalismo' },
      { codigo: '1227', nombre: 'Gestión de un pequeño comercio', titulo: 'Técnico en Actividades Comerciales' },
      { codigo: '0179', nombre: 'Inglés profesional (GS)', titulo: 'Cualquier ciclo de grado superior' },
      { codigo: '0156', nombre: 'Inglés profesional (GM)', titulo: 'Cualquier ciclo de grado medio' },
    ],

    fundamentos: {
      mismo_codigo: 'RD 1085/2020 art. 3.2; Aragón Decreto 91/2024 Anexo VIII ap. 3',
      tabla_titulo: 'RD 659/2023 art. 127; RD 1085/2020 art. 8.1',
      uc: 'RD 659/2023 art. 128.1; art. 15 del RD del título',
      proyecto: 'RD 659/2023 art. 126.4.b; RD 1085/2020 art. 3.5',
    },

    calificacion: {
      superado: 'Traslado de nota',
      tabla: 'CV-nota (nota del módulo aportado; media si son varios)',
      uc: 'CV-5 (computa como 5)',
      sin_nota: 'CV (sin nota, no computa en la media)',
      ipe: 'Nota del expediente anterior o CV-5',
      exento: 'Exento (no afecta a la nota)',
      loe_logse: 'CV-nota (Aragón, Anexo VIII ap. 21)',
    },

    universidad: {
      resuelve: 'Ministerio (SG Ordenación e Innovación FP), tramitado por el centro',
      fundamento: 'RD 1085/2020 arts. 3.10, 6.2 y 9.a; RD 1618/2011',
      aviso: 'Solo grado superior; máx. 60 % de los ECTS del título. Estudio caso a caso de contenidos.',
    },

    // Reglas generales. aplica_a = valores de "comun" de los módulos del ciclo.
    reglas_generales: [
      {
        id: 'C2', aplica_a: ['ipe1', 'fol_loe'], estado: 'convalidable', resuelve: 'Dirección del centro (automática)',
        calificacion: 'ipe', fundamento: 'RD 659/2023 arts. 126.5 y 127.b.5º; RD 1085/2020 DA 6ª',
        evaluar(ctx) {
          const fol = ctx.loe.filter((a) => RE.fol.test(a.nombre || ''));
          if (fol.length) return { motivo: 'FOL (LOE) superado en otro ciclo', aportes: fol };
        },
      },
      {
        id: 'C4', aplica_a: ['ipe1', 'fol_loe'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'ipe', fundamento: 'RD 1085/2020 Anexo II y DA 3ª; Aragón Anexo VIII ap. 6.5',
        aviso: 'El art. 127.b.5º RD 659/2023 no exige PRL; todofp y Aragón sí lo piden para FOL LOGSE.',
        evaluar(ctx) {
          const fol = logse(ctx, 'Formación y orientación laboral');
          if (!fol.length) return;
          const prl = certs(ctx, 'prl_basico');
          return {
            motivo: 'FOL (LOGSE) + certificado de PRL nivel básico',
            aportes: [...fol, ...prl],
            faltan_extra: prl.length ? [] : ['prl_basico'],
          };
        },
      },
      {
        id: 'C5', aplica_a: ['ipe1', 'fol_loe'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 DA 2ª, Anexo II y DA 6ª',
        evaluar(ctx) {
          const c = certs(ctx, 'ciclo_prl_logse');
          if (c.length) return { motivo: 'Título de TS en Prevención de Riesgos Profesionales (LOGSE)', aportes: c };
        },
      },
      {
        id: 'C3', aplica_a: ['ipe2', 'eie_loe'], estado: 'convalidable', resuelve: 'Dirección del centro (automática)',
        calificacion: 'ipe', fundamento: 'RD 659/2023 arts. 126.5 y 127.b.5º; RD 1085/2020 DA 6ª',
        evaluar(ctx) {
          const eie = ctx.loe.filter((a) => RE.eie.test(a.nombre || ''));
          if (eie.length) return { motivo: `${eie.map((a) => a.nombre || a.codigo).join(', ')} (LOE) superado en otro ciclo`, aportes: eie };
        },
      },
      {
        id: 'C6', aplica_a: ['ipe2', 'eie_loe'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 Anexo II (cuadro EIE) y DA 6ª',
        evaluar(ctx) {
          const m = logse(ctx, 'Administración, gestión y comercialización en la pequeña empresa',
            'Administración y gestión de un pequeño establecimiento comercial');
          if (m.length) return { motivo: `${m[0].modulo} (LOGSE)`, aportes: m };
        },
      },
      {
        id: 'C7', aplica_a: ['ipe2', 'eie_loe'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 Anexo III (redacción RD 500/2024) y DA 6ª',
        evaluar(ctx) {
          const c = certs(ctx, 'ciclo_comercio_admin');
          if (c.length) return { motivo: 'Ciclo completo de Comercio y Marketing o Administración', aportes: c };
        },
      },
      {
        id: 'C9', aplica_a: ['fol_logse'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 DT 2ª.1 (FOL LOE → FOL LOGSE de grado medio)',
        evaluar(ctx) {
          if (ctx.ciclo.ciclo.grado !== 'medio') return;
          const fol = ctx.loe.filter((a) => RE.fol.test(a.nombre || ''));
          if (fol.length) return { motivo: 'FOL (LOE) superado → FOL (LOGSE)', aportes: fol };
        },
      },
      {
        id: 'A-6.15', aplica_a: ['fol_logse', 'fol_loe'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla',
        fundamento: 'Aragón, Decreto 91/2024 Anexo VIII ap. 6.15 (redacción de la Resolución de 3/12/2025, BOA 16/12/2025)',
        aviso: 'Regla autonómica de Aragón: en FOL LOGSE solo cabe en grado medio.',
        evaluar(ctx) {
          if (ctx.ciclo.ciclo.grado !== 'medio') return;
          const ipe = ctx.loe.filter((a) => a.codigo === '1709');
          if (ipe.length) return { motivo: '1709 IPE I superado → FOL', aportes: ipe };
        },
      },
      {
        id: 'A-6.17', aplica_a: ['digitalizacion'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla',
        fundamento: 'Aragón, Decreto 91/2024 Anexo VIII ap. 6.17 (redacción de la Resolución de 3/12/2025)',
        aviso: 'El art. 126.3.b del RD 659/2023 exige misma familia profesional; el ap. 6.17 aragonés no. Comprobar.',
        evaluar(ctx) {
          if (ctx.ciclo.ciclo.grado !== 'medio') return;
          const d = ctx.loe.filter((a) => a.codigo === '1665');
          if (d.length) return { motivo: '1665 Digitalización (GS) → 1664 (GM)', aportes: d };
        },
      },
      {
        id: 'C12', aplica_a: ['ingles'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla',
        fundamento: 'RD 1085/2020 Anexo III; Aragón Anexo VIII ap. 5 y 6.8 (corrección de errores BOA 16/01/2026)',
        evaluar(ctx) {
          if (ctx.ciclo.ciclo.grado !== 'medio') return;
          const m = ctx.loe.filter((a) => a.codigo === '0179');
          if (m.length) return { motivo: '0179 Inglés profesional (GS) → 0156 (GM)', aportes: m };
        },
      },
      {
        id: 'C13', aplica_a: ['ingles'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'sin_nota', fundamento: 'RD 1085/2020 art. 3.7 y Anexo III; Aragón Anexo VIII ap. 20',
        evaluar(ctx) {
          const grado = ctx.ciclo.ciclo.grado;
          const c = certs(ctx, ...(grado === 'medio' ? ['eoi_b1', 'eoi_b2'] : ['eoi_b2']));
          if (c.length) return { motivo: `${ctx.normativa.certificados[c[0].clave]} → Inglés profesional`, aportes: c };
        },
      },
      {
        id: 'C15', aplica_a: ['ingles'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'sin_nota', fundamento: 'RD 1085/2020 arts. 3.7 y 9.a; Anexo III',
        aviso: 'Calificación "CV" inferida del art. 3.10 (no verificado).',
        evaluar(ctx) {
          const c = certs(ctx, 'filologia_inglesa');
          if (c.length) return { motivo: 'Filología Inglesa / Traducción (inglés) → Inglés profesional', aportes: c };
        },
      },
      {
        id: 'C16', aplica_a: ['ingles'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 Anexo II, cuadro tercero (redacción RD 659/2023)',
        evaluar(ctx) {
          const grado = ctx.ciclo.ciclo.grado;
          const m = logse(ctx, ...(grado === 'medio'
            ? ['Lengua extranjera (inglés) de grado medio', 'Lengua extranjera (inglés) de grado superior']
            : ['Lengua extranjera (inglés) de grado superior']));
          if (m.length) return { motivo: `${m[0].modulo} (LOGSE) → Inglés profesional`, aportes: m };
        },
      },
      {
        id: 'C23', aplica_a: ['primeros_auxilios'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'RD 1085/2020 Anexo III (redacción RD 500/2024)',
        evaluar(ctx) {
          const c = certs(ctx, 'ciclo_emergencias');
          if (c.length) return { motivo: 'Ciclo completo de Técnico en Emergencias Sanitarias → 0020', aportes: c };
        },
      },
      {
        id: 'C24', aplica_a: ['optativo'], estado: 'convalidable', resuelve: 'Dirección del centro',
        calificacion: 'tabla', fundamento: 'Aragón Decreto 91/2024 Anexo VIII ap. 6.9-6.10',
        aviso: 'Calificación no regulada expresamente (no verificado).',
        evaluar(ctx) {
          const c = certs(ctx, 'optativo_otro_ciclo');
          if (c.length) return { motivo: 'Optativo superado en otro ciclo del mismo grado', aportes: c };
        },
      },
      {
        id: 'E', aplica_a: ['empresa'], estado: 'exento', resuelve: 'Dirección del centro',
        calificacion: 'exento', fundamento: 'RD 659/2023 arts. 131 y 161.1; Aragón Decreto 91/2024 arts. 49-50',
        aviso: 'Solo régimen general (no intensivo). Experiencia de los últimos 5 años. En Aragón: solicitar hasta 2 meses antes del periodo en empresa, en cada curso.',
        evaluar(ctx) {
          if (ctx.normativa.exencion_excluida.includes(ctx.ciclo.ciclo.codigo)) return;
          const e = ctx.exp.filter((a) => a.relacionada);
          const meses = e.reduce((s, a) => s + (a.meses || 0), 0);
          if (meses >= 12) return { motivo: `${meses} meses de experiencia relacionada (mínimo 12) → exención total posible`, aportes: e };
          if (meses > 0) return { motivo: `${meses} meses de experiencia relacionada: no alcanza 1 año; solo cabría estudiar exención parcial`, aportes: e, estado: 'revisar' };
        },
      },
    ],

    /* Ciclos excluidos de la exención de la formación en empresa en Aragón.
       Art. 49.2 del Decreto 91/2024 (BOA 109 de 06/06/2024): nueve títulos de grado
       superior de Sanidad. De ellos, estos son los que se imparten en Aragón. */
    exencion_excluida: ['SAN301', 'SAN303', 'SAN304', 'SAN305', 'SAN306', 'SAN308', 'SAN309'],

    // Avisos que dependen de lo aportado, no de un módulo concreto
    avisos_generales: [
      (ctx) => ctx.exp.length && ctx.normativa.exencion_excluida.includes(ctx.ciclo.ciclo.codigo)
        ? 'En Aragón no cabe exención de la formación en empresa en este ciclo: es uno de los nueve de grado superior de Sanidad excluidos por el art. 49.2 del Decreto 91/2024.' : null,
      (ctx) => ctx.loe.some((a) => a.codigo === '1664') && ctx.ciclo.ciclo.grado === 'superior'
        ? '1664 Digitalización (grado medio) no convalida 1665 (grado superior): RD 659/2023 art. 126.4.d y Aragón Anexo VIII ap. 5.' : null,
      (ctx) => ctx.loe.some((a) => a.codigo === '1710')
        ? 'En Aragón, 1710 IPE II no convalida Empresa e Iniciativa Emprendedora ni los módulos LOGSE equivalentes (Anexo VIII ap. 6.16, redacción de 3/12/2025).' : null,
      (ctx) => ctx.loe.some((a) => a.codigo === '0156') && ctx.ciclo.ciclo.grado === 'superior'
        ? '0156 Inglés profesional (grado medio) no convalida 0179 (grado superior): RD 659/2023 art. 126.4.c.' : null,
    ],

    no_verificado: [
      'Sostenibilidad (1708) y Digitalización: mismo código entre familias distintas — el art. 126.3 RD 659/2023 exige misma familia profesional.',
      'Posible unidad formativa complementaria de hasta 30 h para IPE (art. 126.5): no consta si Aragón la aplica.',
      'Másteres universitarios como estudios aportables: todofp se contradice.',
      'Calificación de UC en ciclos LOE a extinguir en Aragón ("CV" sin computar) según Resolución 24/06/2021, no leída.',
      'Resolución de Aragón de 24/11/2025 (duración de la formación en empresa en ciclos de más de 2000 h): no leída; puede afectar a la exención.',
      'Se ha retirado la regla "1227 Gestión de un pequeño comercio → EIE/IPE II" (la citaba todofp): no aparece en el consolidado del RD 1085/2020 a 07/04/2026.',
    ],
  };
})();
