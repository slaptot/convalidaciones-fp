(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const h = (s) => (s ?? '').toString().replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'convalidaciones-fp:expediente';
  const N = window.NORMATIVA;
  const CICLOS = window.CICLOS;

  const TIPOS = {
    modulo_loe: 'Módulo LOE / LO 3/2022 superado',
    modulo_logse: 'Módulo de título anterior (LOGSE)',
    uc: 'Unidad de competencia acreditada',
    mf: 'Módulo formativo de certificado (MF)',
    uf: 'Unidad formativa de certificado (UF)',
    universidad: 'Estudios universitarios',
    experiencia: 'Experiencia laboral',
    certificado: 'Otro certificado',
  };

  const ESTADOS = {
    superado: { txt: 'Superado (mismo código)', cls: 'ok' },
    convalidable: { txt: 'Convalidable', cls: 'ok' },
    exento: { txt: 'Exención', cls: 'ok' },
    ministerio: { txt: 'Resuelve Ministerio', cls: 'warn' },
    revisar: { txt: 'Revisar', cls: 'warn' },
  };

  let state = cargar() || nuevo();

  function nuevo() {
    return { centro: '', alumno: '', dni: '', curso: '', ciclo: Object.keys(CICLOS)[0], ambito: 'aragon', aportaciones: [], notas: '' };
  }
  function cargar() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const ciclo = () => CICLOS[state.ciclo];

  // ---------- Formulario de expediente ----------
  function pintarCabecera() {
    const sel = $('#ciclo');
    sel.innerHTML = Object.entries(CICLOS)
      .map(([id, c]) => `<option value="${id}">${h(c.ciclo.nombre.replace(/\s*\(LOGSE\)$/, ''))} (${h(c.ciclo.grado)}${c.ciclo.plan === 'LOGSE' ? ', LOGSE' : ''})</option>`)
      .join('');
    sel.value = state.ciclo;
    $('#centro').value = state.centro || '';
    $('#alumno').value = state.alumno;
    $('#dni').value = state.dni;
    $('#curso').value = state.curso;
    $('#ambito').value = state.ambito || 'aragon';
    $('#notas').value = state.notas || '';
  }

  // ---------- Alta de aportaciones ----------
  function camposTipo(tipo) {
    const c = ciclo();
    switch (tipo) {
      case 'modulo_loe': {
        const opts = todosModulosLoe().map((m) => `<option value="${h(m.codigo)}">${h(m.codigo)} · ${h(m.nombre)}</option>`).join('');
        return `
          <label>Código del módulo <input name="codigo" list="dl-modulos" required placeholder="p. ej. 1709"></label>
          <datalist id="dl-modulos">${opts}</datalist>
          <label>Nombre del módulo <input name="nombre" placeholder="Se rellena al elegir código"></label>
          <label>Título en el que lo superó <input name="titulo" placeholder="p. ej. Técnico en Cuidados Auxiliares de Enfermería"></label>`;
      }
      case 'modulo_logse': {
        const filas = c.convalidaciones_titulos_anteriores || [];
        const vistos = new Set();
        const opts = [];
        for (const f of filas) {
          for (const om of [].concat(f.origen_modulo)) {
            const k = f.origen_titulo + '||' + om;
            if (vistos.has(k)) continue;
            vistos.add(k);
            opts.push(`<option value="${h(k)}">${h(om)} — ${h(f.origen_titulo)}</option>`);
          }
        }
        const mismo = c.ciclo.plan === 'LOGSE'
          ? `<optgroup label="Mismo título (traslado de nota)">${c.modulos
              .map((m) => `<option value="${h(c.ciclo.nombre + '||' + m.nombre)}">${h(m.nombre)}</option>`).join('')}</optgroup>` : '';
        const gen = N.modulos_logse_generales
          .map((m) => `<option value="${h(window.Motor.GENERAL_LOGSE + '||' + m)}">${h(m)}</option>`).join('');
        return `<label>Módulo superado <select name="logse" required>
          <optgroup label="Tabla del título (${h(c.ciclo.nombre)})">${opts.join('')}</optgroup>
          <optgroup label="Cualquier ciclo LOGSE">${gen}</optgroup>${mismo}</select></label>`;
      }
      case 'uc': {
        const ucs = { ...(c.uc_descripciones || {}) };
        for (const k of Object.keys(c.uc_equivalencias || {})) ucs[k] ||= '(código anterior)';
        const opts = Object.entries(ucs).sort().map(([k, v]) => `<option value="${h(k)}">${h(k)} · ${h(v)}</option>`).join('');
        return `
          <label>Unidad de competencia <input name="codigo" list="dl-uc" required placeholder="UC0249_2"></label>
          <datalist id="dl-uc">${opts}</datalist>
          <label>Vía de acreditación
            <select name="via">
              <option>Certificado de profesionalidad</option>
              <option>Procedimiento de acreditación de competencias</option>
              <option>Acreditación parcial acumulable</option>
            </select></label>`;
      }
      case 'mf': {
        const opts = (window.CERTIFICADOS?.certificados || []).map((c) => {
          const items = (c.mf || []).filter((m) => m.uc)
            .map((m) => `<option value="${h(m.codigo)}">${h(m.codigo)} · ${h(m.nombre)}${m.horas ? ` (${m.horas} h)` : ''}</option>`).join('');
          return items ? `<optgroup label="${h(c.codigo)} ${h(c.nombre)}">${items}</optgroup>` : '';
        }).join('');
        return `<label>Módulo formativo superado <select name="codigo" required>${opts}</select></label>
          <p class="pista">Acredita la unidad de competencia asociada. Los módulos de prácticas (MP) no aparecen porque no acreditan ninguna UC.</p>`;
      }
      case 'uf': {
        const opts = (window.CERTIFICADOS?.certificados || []).map((c) => {
          const items = (c.mf || []).flatMap((m) => (m.uf || [])
            .map((u) => `<option value="${h(u.codigo)}">${h(u.codigo)} · ${h(u.nombre)}${u.horas ? ` (${u.horas} h)` : ''} — ${h(m.codigo)}</option>`)).join('');
          return items ? `<optgroup label="${h(c.codigo)} ${h(c.nombre)}">${items}</optgroup>` : '';
        }).join('');
        return `<label>Unidad formativa superada <select name="codigo" required>${opts}</select></label>
          <p class="pista">Una UF suelta no acredita la UC. Solo cuentan cuando están todas las del mismo MF.</p>`;
      }
      case 'universidad':
        return `
          <label>Titulación universitaria <input name="titulacion" required placeholder="p. ej. Grado en Enfermería"></label>
          <label>Asignaturas relevantes <textarea name="asignaturas" rows="2"></textarea></label>`;
      case 'experiencia':
        return `
          <label>Meses trabajados (jornada completa equivalente) <input name="meses" type="number" min="0" required></label>
          <label class="check"><input name="relacionada" type="checkbox" checked> Relacionada con el ciclo</label>`;
      case 'certificado': {
        const opts = Object.entries(N.certificados).map(([k, v]) => `<option value="${k}">${h(v)}</option>`).join('');
        return `<label>Certificado <select name="clave">${opts}</select></label>`;
      }
    }
    return '';
  }

  function checklistDocs(tipo) {
    const ids = N.documentos_por_via[tipo] || [];
    if (!ids.length || tipo === 'certificado') return '';
    return `<fieldset class="docs"><legend>Documentación aportada</legend>${ids
      .map((id) => `<label class="check"><input type="checkbox" name="doc" value="${id}"> ${h(N.documentos[id])}</label>`)
      .join('')}</fieldset>`;
  }

  function pintarFormAlta() {
    const tipo = $('#tipo').value;
    $('#campos').innerHTML = camposTipo(tipo) + checklistDocs(tipo);
    const cod = $('#campos [name=codigo]');
    if (tipo === 'modulo_loe' && cod) {
      cod.addEventListener('input', () => {
        const m = todosModulosLoe().find((x) => x.codigo === cod.value.trim());
        if (m) {
          $('#campos [name=nombre]').value = m.nombre;
          if (m.titulo) $('#campos [name=titulo]').value = m.titulo;
        }
      });
    }
  }

  function buscarMf(codigo) {
    for (const c of window.CERTIFICADOS?.certificados || []) {
      const m = (c.mf || []).find((x) => x.codigo === codigo);
      if (m) return m;
    }
  }
  function buscarUf(codigo) {
    for (const c of window.CERTIFICADOS?.certificados || []) {
      for (const m of c.mf || []) {
        const u = (m.uf || []).find((x) => x.codigo === codigo);
        if (u) return { ...u, mf: m.codigo };
      }
    }
  }

  function todosModulosLoe() {
    const out = [...(N.modulos_comunes || [])];
    for (const c of Object.values(CICLOS)) {
      if (c.ciclo.plan === 'LOGSE') continue; // sus módulos no tienen código LOE
      for (const m of c.modulos) out.push({ codigo: m.codigo, nombre: m.nombre, titulo: c.ciclo.nombre });
    }
    const vistos = new Set();
    return out.filter((m) => (vistos.has(m.codigo) ? false : vistos.add(m.codigo)));
  }

  function leerAlta(form) {
    const fd = new FormData(form);
    const tipo = fd.get('tipo');
    const a = { tipo, docs: fd.getAll('doc') };
    if (tipo === 'modulo_loe') Object.assign(a, { codigo: fd.get('codigo').trim(), nombre: fd.get('nombre'), titulo: fd.get('titulo') });
    if (tipo === 'modulo_logse') { const [t, m] = fd.get('logse').split('||'); Object.assign(a, { titulo: t, modulo: m }); }
    if (tipo === 'uc') Object.assign(a, { codigo: fd.get('codigo').trim().toUpperCase(), via: fd.get('via') });
    if (tipo === 'mf' || tipo === 'uf') Object.assign(a, { codigo: fd.get('codigo') });
    if (tipo === 'universidad') Object.assign(a, { titulacion: fd.get('titulacion'), asignaturas: fd.get('asignaturas') });
    if (tipo === 'experiencia') Object.assign(a, { meses: Number(fd.get('meses')), relacionada: fd.get('relacionada') === 'on' });
    if (tipo === 'certificado') Object.assign(a, { clave: fd.get('clave') });
    return a;
  }

  function describir(a) {
    switch (a.tipo) {
      case 'modulo_loe': return `${a.codigo} ${a.nombre || ''}${a.titulo ? ` — ${a.titulo}` : ''}`;
      case 'modulo_logse': return `${a.modulo} — ${a.titulo}`;
      case 'uc': return `${a.codigo} ${ciclo().uc_descripciones?.[a.codigo] || ''} (${a.via})`;
      case 'mf': {
        const m = buscarMf(a.codigo);
        return `${a.codigo} ${m ? m.nombre : ''}${m ? ` → ${(m.uc_vigente?.length ? m.uc_vigente : [m.uc]).join(', ')}` : ''}`;
      }
      case 'uf': {
        const u = buscarUf(a.codigo);
        return `${a.codigo} ${u ? `${u.nombre} (de ${u.mf})` : ''}`;
      }
      case 'universidad': return a.titulacion;
      case 'experiencia': return `${a.meses} meses${a.relacionada ? ', relacionada con el ciclo' : ', no relacionada'}`;
      case 'certificado': return N.certificados[a.clave] || a.clave;
    }
  }

  function pintarAportaciones() {
    const ul = $('#lista-aportaciones');
    if (!state.aportaciones.length) {
      ul.innerHTML = `<li class="vacio">Todavía no has añadido nada. Usa el formulario de arriba.</li>`;
      return;
    }
    ul.innerHTML = state.aportaciones
      .map((a, i) => {
        const ids = a.tipo === 'certificado' ? N.requeridos(a) : (N.documentos_por_via[a.tipo] || []);
        const docs = ids
          .map((id) => `<label class="check small"><input type="checkbox" data-i="${i}" data-doc="${id}" ${a.docs.includes(id) ? 'checked' : ''}> ${h(N.documentos[id])}</label>`)
          .join('');
        return `<li>
          <div class="ap-head"><span class="tag">${h(TIPOS[a.tipo])}</span>
          <button class="link" data-del="${i}" aria-label="Quitar">Quitar</button></div>
          <div class="ap-desc">${h(describir(a))}</div>
          ${docs ? `<div class="ap-docs">${docs}</div>` : ''}
        </li>`;
      })
      .join('');
  }

  // ---------- Resultados ----------
  function pintarResultados() {
    const c = ciclo();
    const amb = state.ambito || 'aragon';
    const { filas, avisos } = window.Motor.evaluar(c, N, state.aportaciones, amb);
    const n = { conv: 0, min: 0, faltan: 0, horas: 0 };
    const cuerpo = filas
      .map(({ modulo: m, mejor, alternativas, bloqueo }) => {
        if (mejor) {
          if (['superado', 'convalidable', 'exento'].includes(mejor.estado)) { n.conv++; n.horas += m.horas[amb] || 0; }
          else n.min++;
          if (mejor.faltan.length) n.faltan++;
        }
        const est = mejor ? ESTADOS[mejor.estado] : bloqueo ? { txt: 'No convalidable', cls: 'bad' } : { txt: 'A cursar', cls: 'none' };
        const horas = m.horas[amb], curso = m.curso[amb];
        const alt = alternativas.length
          ? `<details><summary>${alternativas.length} vía(s) alternativa(s)</summary><ul>${alternativas
              .map((r) => `<li>${h(ESTADOS[r.estado].txt)}: ${h(r.motivo)} <em>(${h(r.fundamento)})</em></li>`)
              .join('')}</ul></details>`
          : '';
        return `<tr class="${mejor ? 'con' : ''}">
          <td class="cod">${h(m.codigo)}</td>
          <td>${h(m.nombre)}${horas ? `<div class="sub">${horas} h${curso ? ` · ${curso}º curso` : ''}</div>` : ''}${m.nota && !horas ? `<div class="sub">${h(m.nota)}</div>` : ''}</td>
          <td><span class="badge ${est.cls}">${est.txt}</span></td>
          <td>${mejor ? `${h(mejor.motivo)}<div class="sub"><b>Resuelve:</b> ${h(mejor.resuelve)} · <b>Nota:</b> ${h(mejor.calificacion)}</div><div class="sub">${h(mejor.fundamento)}</div>${mejor.aviso ? `<div class="sub aviso">⚠ ${h(mejor.aviso)}</div>` : ''}${alt}` : bloqueo ? `<span class="sub">${h(bloqueo)}</span>` : ''}</td>
          <td>${mejor ? (mejor.faltan.length ? `<ul class="faltan">${mejor.faltan.map((d) => `<li>${h(N.documentos[d] || d)}</li>`).join('')}</ul>` : '<span class="ok-txt">Completa</span>') : ''}</td>
        </tr>`;
      })
      .join('');

    $('#resumen').innerHTML = `
      <div class="kpi"><b>${n.conv}</b><span>convalidables o superados</span></div>
      <div class="kpi"><b>${n.min}</b><span>a resolver por otro órgano o revisar</span></div>
      <div class="kpi"><b>${n.faltan}</b><span>con documentación incompleta</span></div>
      <div class="kpi"><b>${n.horas}</b><span>horas convalidadas de ${filas.reduce((s, f) => s + (f.modulo.horas[amb] || 0), 0)}</span></div>`;

    $('#tabla-resultados tbody').innerHTML = cuerpo;
    $('#avisos').innerHTML = avisos.map((x) => `<p class="aviso-box">${h(x)}</p>`).join('');
    $('#fuentes').innerHTML = (c.ciclo.normas || [])
      .map((x) => `<li><a href="${h(x.url)}" target="_blank" rel="noopener">${h(x.ref)}</a>${x.nota ? ` — ${h(x.nota)}` : ''}</li>`)
      .join('');
    const nv = [...(c.no_verificado || []), ...(N.no_verificado || [])];
    $('#no-verificado').innerHTML = nv.map((x) => `<li>${h(x)}</li>`).join('');
    $('#bloque-nv').hidden = !nv.length;

    pintarInforme(c, amb, filas, avisos, n);
  }

  // ---------- Anexo imprimible ----------
  // Etiquetas cortas para el anexo (en la tabla se repiten mucho)
  const TIPO_CORTO = {
    modulo_loe: 'Módulo LOE', modulo_logse: 'Módulo LOGSE', uc: 'UC acreditada',
    mf: 'MF de certificado', uf: 'UF de certificado', universidad: 'Estudios universitarios',
    experiencia: 'Experiencia laboral', certificado: 'Certificado',
  };
  const DOC_CORTO = {
    cert_academica: 'Certificación académica', cert_uc: 'Certificación de UC',
    cert_profesionalidad: 'Certificado de profesionalidad', acreditacion_parcial: 'Acreditación parcial acumulable',
    programas_univ: 'Programas sellados', cert_univ_programas: 'Certificación de la universidad',
    prl_basico: 'PRL nivel básico', vida_laboral: 'Certificado TGSS/ISM',
    contrato_empresa: 'Contrato o certificado de empresa', cert_eoi: 'Certificado EOI', titulo_univ: 'Título universitario',
  };
  const doc = (d) => DOC_CORTO[d] || N.documentos[d] || d;

  const ESTADO_INFORME = {
    superado: 'Superado (traslado de nota)',
    convalidable: 'Convalidable',
    exento: 'Exención',
    ministerio: 'Propuesta al Ministerio',
    revisar: 'A estudiar',
  };

  function pintarInforme(c, amb, filas, avisos, n) {
    const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const plan = amb === 'aragon' ? 'Aragón' : 'Ministerio (ámbito MEFPD)';
    const totalHoras = filas.reduce((s, f) => s + (f.modulo.horas[amb] || 0), 0);

    const aportadas = state.aportaciones.length
      ? state.aportaciones.map((a, i) => {
          const faltan = N.requeridos(a).filter((d) => !a.docs.includes(d));
          return `<tr>
            <td class="num">${i + 1}</td>
            <td>${h(TIPO_CORTO[a.tipo])}</td>
            <td>${h(describir(a))}</td>
            <td>${a.docs.length ? a.docs.map((d) => h(doc(d))).join('<br>') : '—'}</td>
            <td>${faltan.length ? `<span class="falta">${faltan.map((d) => h(doc(d))).join('<br>')}</span>` : 'Completa'}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="5" class="vacio-td">No se ha registrado documentación.</td></tr>`;

    const resultado = filas.map(({ modulo: m, mejor, bloqueo }) => {
      const estado = mejor ? ESTADO_INFORME[mejor.estado] : bloqueo ? 'No convalidable' : 'Debe cursarlo';
      const horas = m.horas[amb];
      return `<tr class="${mejor ? 'r-si' : 'r-no'}">
        <td class="cod">${h(m.codigo)}</td>
        <td>${h(m.nombre)}</td>
        <td class="num">${horas || '—'}</td>
        <td>${h(estado)}</td>
        <td>${mejor ? h(mejor.motivo) : bloqueo ? h(bloqueo) : '—'}</td>
        <td>${mejor ? h(mejor.resuelve) : '—'}</td>
        <td>${mejor ? h(mejor.calificacion) : '—'}</td>
      </tr>`;
    }).join('');

    // Normas efectivamente aplicadas en este expediente
    const normas = [...new Set(filas.filter((f) => f.mejor).map((f) => f.mejor.fundamento))];
    const advertencias = [...new Set([...avisos, ...filas.filter((f) => f.mejor && f.mejor.aviso).map((f) => f.mejor.aviso)])];

    $('#informe').innerHTML = `
      <header class="inf-head">
        <div class="inf-centro">${h(state.centro || '')}</div>
        <h1>Anexo · Análisis de convalidaciones y exenciones</h1>
        <p class="inf-sub">Propuesta de resolución. Documento de trabajo, no es una resolución administrativa.</p>
      </header>

      <table class="inf-datos">
        <tr><th>Alumno/a</th><td>${h(state.alumno || '—')}</td><th>DNI/NIE</th><td>${h(state.dni || '—')}</td></tr>
        <tr><th>Ciclo formativo</th><td colspan="3">${h(c.ciclo.nombre)} (${h(c.ciclo.codigo)}) · Grado ${h(c.ciclo.grado)} · ${h(c.ciclo.familia)}</td></tr>
        <tr><th>Plan de estudios</th><td>${h(plan)}</td><th>Curso académico</th><td>${h(state.curso || '—')}</td></tr>
        <tr><th>Fecha del análisis</th><td colspan="3">${h(hoy)}</td></tr>
      </table>

      <h2>1. Documentación aportada</h2>
      <table class="inf-tabla">
        <colgroup><col style="width:4%"><col style="width:15%"><col style="width:40%"><col style="width:26%"><col style="width:15%"></colgroup>
        <thead><tr><th class="num">#</th><th>Tipo</th><th>Detalle</th><th>Documentación aportada</th><th>Falta</th></tr></thead>
        <tbody>${aportadas}</tbody>
      </table>

      <h2>2. Resultado por módulo profesional</h2>
      <table class="inf-tabla">
        <colgroup><col style="width:7%"><col style="width:24%"><col style="width:6%"><col style="width:12%"><col style="width:25%"><col style="width:16%"><col style="width:10%"></colgroup>
        <thead><tr><th>Código</th><th>Módulo profesional</th><th class="num">Horas</th><th>Resultado</th><th>Fundamento de hecho</th><th>Resuelve</th><th>Calificación</th></tr></thead>
        <tbody>${resultado}</tbody>
      </table>

      <h2>3. Resumen</h2>
      <table class="inf-tabla inf-resumen">
        <tbody>
          <tr><th>Módulos convalidados, con nota trasladada o exentos</th><td class="num">${n.conv}</td></tr>
          <tr><th>Pendientes de otro órgano o de estudio individual</th><td class="num">${n.min}</td></tr>
          <tr><th>Horas reconocidas sobre el total del ciclo</th><td class="num">${n.horas} de ${totalHoras}</td></tr>
          <tr><th>Aportaciones con documentación incompleta</th><td class="num">${n.faltan}</td></tr>
        </tbody>
      </table>

      ${state.notas ? `<h2>4. Observaciones</h2><p class="inf-parrafo">${h(state.notas)}</p>` : ''}

      ${advertencias.length ? `<h2>${state.notas ? 5 : 4}. Advertencias a comprobar antes de resolver</h2>
        <ul class="inf-lista">${advertencias.map((a) => `<li>${h(a)}</li>`).join('')}</ul>` : ''}

      ${normas.length ? `<h2>${(state.notas ? 5 : 4) + (advertencias.length ? 1 : 0)}. Normativa aplicada</h2>
        <ul class="inf-lista">${normas.map((x) => `<li>${h(x)}</li>`).join('')}</ul>` : ''}

      <div class="inf-firmas">
        <div><p class="inf-lugar">En ____________________, a ____ de ______________ de 20____</p></div>
        <div class="inf-firma"><p>Elaborado por (Secretaría)</p><div class="inf-linea"></div><p class="inf-fdo">Fdo.: ____________________</p></div>
        <div class="inf-firma"><p>V.º B.º Dirección del centro</p><div class="inf-linea"></div><p class="inf-fdo">Fdo.: ____________________</p></div>
      </div>

      <p class="inf-pie">Documento generado con la herramienta de análisis de convalidaciones. El resultado es orientativo:
      la resolución corresponde al órgano competente conforme al RD 659/2023, al RD 1085/2020 y a la normativa autonómica aplicable.</p>`;
  }

  function refrescar() {
    guardar();
    pintarAportaciones();
    pintarResultados();
  }

  // ---------- Eventos ----------
  function init() {
    pintarCabecera();
    $('#tipo').innerHTML = Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    pintarFormAlta();
    refrescar();

    $('#ambito').addEventListener('change', (e) => { state.ambito = e.target.value; refrescar(); });
    for (const id of ['centro', 'alumno', 'dni', 'curso', 'notas']) {
      $('#' + id).addEventListener('input', (e) => { state[id] = e.target.value; guardar(); pintarResultados(); });
    }
    $('#ciclo').addEventListener('change', (e) => {
      if (state.aportaciones.some((a) => a.tipo === 'modulo_logse') &&
          !confirm('Las aportaciones de títulos anteriores dependen del ciclo y se eliminarán. ¿Continuar?')) {
        e.target.value = state.ciclo; return;
      }
      state.ciclo = e.target.value;
      state.aportaciones = state.aportaciones.filter((a) => a.tipo !== 'modulo_logse');
      pintarFormAlta();
      refrescar();
    });
    $('#tipo').addEventListener('change', pintarFormAlta);
    $('#form-alta').addEventListener('submit', (e) => {
      e.preventDefault();
      state.aportaciones.push(leerAlta(e.target));
      pintarFormAlta();
      refrescar();
    });
    $('#lista-aportaciones').addEventListener('click', (e) => {
      const i = e.target.dataset.del;
      if (i !== undefined) { state.aportaciones.splice(Number(i), 1); refrescar(); }
    });
    $('#lista-aportaciones').addEventListener('change', (e) => {
      const { i, doc } = e.target.dataset;
      if (doc) {
        const a = state.aportaciones[Number(i)];
        a.docs = e.target.checked ? [...new Set([...a.docs, doc])] : a.docs.filter((d) => d !== doc);
        guardar();
        pintarResultados();
      }
    });
    $('#btn-nuevo').addEventListener('click', () => {
      if (!confirm('¿Empezar un expediente nuevo? Se perderá el actual si no lo has guardado.')) return;
      state = nuevo(); pintarCabecera(); pintarFormAlta(); refrescar();
    });
    $('#btn-guardar').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `expediente-${(state.alumno || 'sin-nombre').replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
    $('#btn-abrir').addEventListener('click', () => $('#file').click());
    $('#file').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const s = JSON.parse(await f.text());
        if (!CICLOS[s.ciclo]) throw new Error('Ciclo desconocido');
        state = { ...nuevo(), ...s };
        pintarCabecera(); pintarFormAlta(); refrescar();
      } catch (err) { alert('No se pudo abrir el expediente: ' + err.message); }
      e.target.value = '';
    });
    $('#btn-imprimir').addEventListener('click', () => window.print());
  }

  document.addEventListener('DOMContentLoaded', init);
})();
