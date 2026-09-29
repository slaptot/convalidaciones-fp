(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const h = (s) => (s ?? '').toString().replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KEY = 'convalidaciones-fp:expediente';
  const N = window.NORMATIVA;
  const CICLOS = window.CICLOS;

  const TIPOS = {
    modulo_loe: 'Módulo LOE / LO 3/2022 superado',
    modulo_logse: 'Módulo de título anterior (LOGSE)',
    titulo: 'Título completo de FP (GB, GM o GS)',
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
    return { centro: '', membrete: '', localidad: '', director: '', fecha_res: '', titularidad: 'publico', provincia: 'Zaragoza', adscrito: '', grado: '', familia: '', calificaciones: {}, alumno: '', dni: '', curso: '', ciclo: Object.keys(CICLOS)[0], ambito: 'aragon', aportaciones: [], notas: '' };
  }
  function cargar() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }
  function guardar() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  const ciclo = () => CICLOS[state.ciclo];
  // Algunos códigos vienen con aclaraciones entre paréntesis: para mostrar basta el código
  const codigoCiclo = (c) => (c.ciclo.codigo || '').split(/[\s(]/)[0];
  // Un módulo puede llamarse distinto según el plan de estudios
  const nombreModulo = (m, amb) => (m.nombres && m.nombres[amb]) || m.nombre;
  const calificacionFinal = (codigo, mejor) =>
    (state.calificaciones && state.calificaciones[codigo]) || (mejor ? mejor.valor : '');

  // ---------- Catálogo de ciclos: grado y familia ----------
  const GRADOS = { basico: 'Grado básico', medio: 'Grado medio', superior: 'Grado superior' };

  const familiasDisponibles = (grado) => [...new Set(Object.values(CICLOS)
    .filter((c) => !grado || c.ciclo.grado === grado)
    .map((c) => c.ciclo.familia))].sort((a, b) => a.localeCompare(b, 'es'));

  const ciclosFiltrados = () => Object.entries(CICLOS)
    .filter(([, c]) => (!state.grado || c.ciclo.grado === state.grado)
      && (!state.familia || c.ciclo.familia === state.familia))
    .sort((a, b) => a[1].ciclo.nombre.localeCompare(b[1].ciclo.nombre, 'es'));

  function pintarFiltros() {
    const gradosConCiclos = [...new Set(Object.values(CICLOS).map((c) => c.ciclo.grado))];
    $('#grado').innerHTML = `<option value="">Todos</option>` + Object.entries(GRADOS)
      .filter(([k]) => gradosConCiclos.includes(k))
      .map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    $('#grado').value = state.grado || '';

    const fams = familiasDisponibles(state.grado);
    if (state.familia && !fams.includes(state.familia)) state.familia = '';
    $('#familia').innerHTML = `<option value="">Todas</option>`
      + fams.map((f) => `<option value="${h(f)}">${h(f)}</option>`).join('');
    $('#familia').value = state.familia || '';

    const lista = ciclosFiltrados();
    const opcion = ([id, c]) => `<option value="${id}">${h(c.ciclo.nombre.replace(/\s*\(LOGSE\)$/, ''))} · ${h(codigoCiclo(c))}${c.ciclo.plan === 'LOGSE' ? ' (LOGSE)' : ''}</option>`;
    const completos = lista.filter(([, c]) => !c.ciclo.parcial);
    const catalogo = lista.filter(([, c]) => c.ciclo.parcial);
    $('#ciclo').innerHTML =
      (completos.length ? `<optgroup label="Con normativa cargada">${completos.map(opcion).join('')}</optgroup>` : '')
      + (catalogo.length ? `<optgroup label="Catálogo de Aragón (solo reglas generales)">${catalogo.map(opcion).join('')}</optgroup>` : '');
    if (!lista.some(([id]) => id === state.ciclo) && lista.length) state.ciclo = lista[0][0];
    $('#ciclo').value = state.ciclo;

    const aviso = $('#aviso-catalogo');
    aviso.hidden = lista.length > 0;
    aviso.textContent = lista.length ? '' : 'Todavía no hay ciclos cargados con ese grado y esa familia.';
  }

  // ---------- Formulario de expediente ----------
  function pintarCabecera() {
    pintarFiltros();
    $('#centro').value = state.centro || '';
    $('#membrete').value = state.membrete || '';
    $('#localidad').value = state.localidad || '';
    $('#director').value = state.director || '';
    $('#fecha_res').value = state.fecha_res || new Date().toISOString().slice(0, 10);
    $('#titularidad').value = state.titularidad || 'publico';
    $('#provincia').value = state.provincia || 'Zaragoza';
    $('#adscrito').value = state.adscrito || '';
    $('#lbl-adscrito').hidden = (state.titularidad || 'publico') !== 'privado';
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
          <label>Título en el que lo superó <input name="titulo" placeholder="p. ej. Técnico en Cuidados Auxiliares de Enfermería"></label>
          <label>Calificación obtenida (opcional) <input name="nota" type="number" min="1" max="10" step="1" placeholder="para calcular el CV-n"></label>`;
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
          <optgroup label="Cualquier ciclo LOGSE">${gen}</optgroup>${mismo}</select></label>
          <label>Calificación obtenida (opcional) <input name="nota" type="number" min="1" max="10" step="1" placeholder="para calcular el CV-n"></label>`;
      }
      case 'titulo': {
        const vistos = new Set();
        const tablas = [];
        for (const f of c.convalidaciones_titulos_anteriores || []) {
          if (!f.origen_modulo.some((m) => /ciclo completo/i.test(m)) || vistos.has(f.origen_titulo)) continue;
          vistos.add(f.origen_titulo);
          tablas.push(`<option value="titulo|${h(f.origen_titulo)}">${h(f.origen_titulo)}</option>`);
        }
        const generales = N.titulos_generales
          .map((t) => `<option value="clave|${h(t.clave)}">${h(t.label)}</option>`).join('');
        const cargados = Object.entries(CICLOS).filter(([id]) => id !== state.ciclo)
          .map(([id, x]) => `<option value="ciclo|${h(id)}">${h(x.ciclo.nombre)} (${h(codigoCiclo(x))})</option>`).join('');
        return `<label>Título completo aportado <select name="titulo" required>
            ${tablas.length ? `<optgroup label="Tabla de este ciclo">${tablas.join('')}</optgroup>` : ''}
            <optgroup label="Reglas generales">${generales}</optgroup>
            <optgroup label="Otros títulos de esta herramienta">${cargados}</optgroup>
            <optgroup label="Grado Básico"><option value="gb|">Título de Grado Básico (cualquier ciclo)</option></optgroup>
          </select></label>
          <label>Nota media del título (opcional) <input name="nota" type="number" min="1" max="10" step="1" placeholder="para calcular el CV-n"></label>
          <p class="pista">Aplica de una vez lo que corresponda: filas de "ciclo completo", reglas generales y, en los títulos cargados, los módulos con el mismo código.</p>`;
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
    const nota = Number(fd.get('nota'));
    if (nota > 0) a.nota = nota;
    if (tipo === 'modulo_loe') Object.assign(a, { codigo: fd.get('codigo').trim(), nombre: fd.get('nombre'), titulo: fd.get('titulo') });
    if (tipo === 'modulo_logse') { const [t, m] = fd.get('logse').split('||'); Object.assign(a, { titulo: t, modulo: m }); }
    if (tipo === 'titulo') {
      const [clase, valor] = fd.get('titulo').split('|');
      if (clase === 'clave') Object.assign(a, { clave: valor, label: N.titulos_generales.find((t) => t.clave === valor)?.label });
      else if (clase === 'ciclo') Object.assign(a, { ciclo: valor, titulo: CICLOS[valor].ciclo.nombre });
      else if (clase === 'gb') Object.assign(a, { gb: true, label: 'Título de Grado Básico' });
      else Object.assign(a, { titulo: valor });
    }
    if (tipo === 'uc') Object.assign(a, { codigo: fd.get('codigo').trim().toUpperCase(), via: fd.get('via') });
    if (tipo === 'mf' || tipo === 'uf') Object.assign(a, { codigo: fd.get('codigo') });
    if (tipo === 'universidad') Object.assign(a, { titulacion: fd.get('titulacion'), asignaturas: fd.get('asignaturas') });
    if (tipo === 'experiencia') Object.assign(a, { meses: Number(fd.get('meses')), relacionada: fd.get('relacionada') === 'on' });
    if (tipo === 'certificado') Object.assign(a, { clave: fd.get('clave') });
    return a;
  }

  function describir(a) {
    switch (a.tipo) {
      case 'modulo_loe': return `${a.codigo} ${a.nombre || ''}${a.titulo ? ` — ${a.titulo}` : ''}${a.nota ? ` · nota ${a.nota}` : ''}`;
      case 'modulo_logse': return `${a.modulo} — ${a.titulo}${a.nota ? ` · nota ${a.nota}` : ''}`;
      case 'titulo': return `${a.label || a.titulo} — título completo`;
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
          <td>${h(nombreModulo(m, amb))}${horas ? `<div class="sub">${horas} h${curso ? ` · ${curso}º curso` : ''}</div>` : ''}${m.nota && !horas ? `<div class="sub">${h(m.nota)}</div>` : ''}</td>
          <td><span class="badge ${est.cls}">${est.txt}</span></td>
          <td>${mejor ? `${h(mejor.motivo)}<div class="sub"><b>Resuelve:</b> ${h(mejor.resuelve)} · <b>Nota:</b> ${h(mejor.calificacion)}</div><div class="sub">${h(mejor.fundamento)}</div>${mejor.aviso ? `<div class="sub aviso">⚠ ${h(mejor.aviso)}</div>` : ''}${alt}` : bloqueo ? `<span class="sub">${h(bloqueo)}</span>` : ''}</td>
          <td>${mejor ? `<input class="cal" data-cod="${h(m.codigo)}" value="${h(calificacionFinal(m.codigo, mejor))}" size="8" aria-label="Calificación de ${h(m.codigo)}">` : ''}</td>
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
    pintarResolucion(c, amb, filas);
    pintarExencion(c, amb, filas);
    pintarSolicitudes(c, amb, filas);
    pintarListado(c, amb, filas);
  }

  // ---------- Solicitud de convalidación (una por módulo) ----------
  function pintarSolicitudes(c, amb, filas) {
    // Anexo VIII ap. 9: una solicitud por cada módulo, con código y denominación exactos
    const pedibles = filas.filter((f) => f.mejor && ['convalidable', 'ministerio'].includes(f.mejor.estado));
    if (!pedibles.length) {
      $('#solicitudes').innerHTML = `<p class="res-p">No hay módulos que solicitar con la documentación registrada.</p>`;
      return;
    }

    $('#solicitudes').innerHTML = pedibles.map(({ modulo: m, mejor }, i) => `
      <section class="hoja${i < pedibles.length - 1 ? ' corte' : ''}">
        <div class="res-membrete">${h(state.centro || '')}${state.membrete ? `<br>${h(state.membrete).replace(/\n/g, '<br>')}` : ''}</div>
        <h1 class="res-titulo">Solicitud de convalidación de módulo profesional</h1>
        <p class="sol-orden">Solicitud ${i + 1} de ${pedibles.length}</p>

        <table class="res-tabla">
          <colgroup><col style="width:28%"><col style="width:72%"></colgroup>
          <tbody>
            <tr><th>Alumno/a</th><td>${h(state.alumno || '')}</td></tr>
            <tr><th>DNI/NIE</th><td>${h(state.dni || '')}</td></tr>
            <tr><th>Domicilio, teléfono y correo</th><td></td></tr>
            <tr><th>Ciclo formativo</th><td>${h(c.ciclo.nombre)} (${h(codigoCiclo(c))})</td></tr>
            <tr><th>Curso académico</th><td>${h(state.curso || '')}</td></tr>
          </tbody>
        </table>

        <h2 class="res-apartado">Módulo profesional cuya convalidación solicita</h2>
        <table class="res-tabla">
          <colgroup><col style="width:28%"><col style="width:72%"></colgroup>
          <tbody>
            <tr><th>Código</th><td class="cod">${h(m.codigo)}</td></tr>
            <tr><th>Denominación</th><td>${h(nombreModulo(m, amb))}</td></tr>
            <tr><th>Formación o acreditación que aporta</th><td>${h(mejor.motivo)}</td></tr>
            <tr><th>Órgano que resuelve</th><td>${h(mejor.resuelve)}</td></tr>
          </tbody>
        </table>

        <h2 class="res-apartado">Documentación que acompaña</h2>
        <ul class="sol-docs">
          ${[...new Set((mejor.aportes || []).flatMap((a) => a.docs || []))]
            .map((d) => `<li>☑ ${h(N.documentos[d] || d)}</li>`).join('')}
          ${(mejor.faltan || []).map((d) => `<li>☐ ${h(N.documentos[d] || d)} <b>(pendiente)</b></li>`).join('')}
        </ul>

        <p class="res-p">La persona abajo firmante declara que los datos y la documentación aportados son ciertos y solicita la
        convalidación del módulo profesional indicado, de conformidad con el artículo 4 del Real Decreto 1085/2020, de 9 de
        diciembre, y con los artículos 50 y 51 del Decreto 91/2024, de 5 de junio, del Gobierno de Aragón.</p>

        <p class="res-lugar">En ${h(state.localidad || '____________________')}, a ____ de ______________ de 20____</p>
        <div class="res-firma"><p>Firma del/de la solicitante</p><div class="res-linea"></div>
          <p>Fdo.: ${h(state.alumno || '____________________')}</p></div>

        <p class="sol-destino"><b>SR./SRA. DIRECTOR/A DEL CENTRO ${h((state.centro || '____________________').toUpperCase())}</b></p>
        <div class="sol-registro">Registro de entrada del centro<br><br>N.º ____________ Fecha: ____ / ____ / ________</div>
      </section>`).join('');
  }

  // ---------- Listado provisional de solicitantes ----------
  /* Enmascarado según la DA 7ª de la LO 3/2018 y el criterio de la AEPD (sorteo de 27/02/2019):
     se muestran las posiciones 4ª a 7ª. DNI: ***4567**  ·  NIE: ****4567* */
  const dniParcial = (dni) => {
    const d = (dni || '').replace(/[\s-]/g, '').toUpperCase();
    if (d.length < 8) return d || '____________';
    const nie = /^[XYZ]/.test(d);
    const desde = nie ? 4 : 3;
    const visible = d.slice(desde, desde + 4);
    return '*'.repeat(desde) + visible + '*'.repeat(Math.max(0, d.length - desde - 4));
  };

  function pintarListado(c, amb, filas) {
    // Solo lo solicitado: la formación en empresa va por el expediente de exención y el
    // Proyecto no es convalidable, así que no procede listarlo
    const resueltos = filas.filter((f) => f.mejor && f.modulo.tipo !== 'empresa');
    const cuerpo = resueltos.length
      ? resueltos.map(({ modulo: m, mejor }) => {
          const favorable = mejor && ['convalidable', 'superado', 'exento'].includes(mejor.estado);
          return `<tr>
            <td class="cod">${h(m.codigo)}</td>
            <td>${h(nombreModulo(m, amb))}</td>
            <td>${favorable ? 'Favorable' : mejor.estado === 'ministerio' ? 'Remitido al Ministerio' : 'Pendiente de estudio'}</td>
            <td class="num">${favorable && mejor ? h(calificacionFinal(m.codigo, mejor)) : ''}</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="4" class="vacio-td">Sin solicitudes resueltas.</td></tr>`;

    $('#listado').innerHTML = `
      <div class="res-membrete">${h(state.centro || '')}${state.membrete ? `<br>${h(state.membrete).replace(/\n/g, '<br>')}` : ''}</div>
      <h1 class="res-titulo">Listado provisional de solicitantes de convalidación de módulos profesionales</h1>

      <p class="res-p"><b>Documento Nacional de Identidad:</b> ${h(dniParcial(state.dni))} ·
      <b>Ciclo formativo:</b> ${h(c.ciclo.nombre)}${state.curso ? ` · <b>Curso:</b> ${h(state.curso)}` : ''}</p>

      <table class="res-tabla">
        <colgroup><col style="width:12%"><col style="width:53%"><col style="width:20%"><col style="width:15%"></colgroup>
        <thead><tr><th>Código</th><th>Denominación</th><th>Estado</th><th class="num">Calificación</th></tr></thead>
        <tbody>${cuerpo}</tbody>
      </table>

      <p class="res-p res-recursos"><b>CARÁCTER PROVISIONAL.</b> Este listado no es una resolución y su publicación no está
      prevista en la normativa de convalidaciones: es una actuación interna de este centro, sin efectos de notificación. Las
      personas interesadas podrán formular <b>alegaciones</b> ante la dirección del centro en el plazo de <b>diez días hábiles</b>
      contados desde el día siguiente al de su publicación, de conformidad con el artículo 82 de la Ley 39/2015, de 1 de octubre.
      El trámite es potestativo y no preclusivo. La resolución se notificará individualmente a cada persona interesada y contra
      ella cabrá el recurso que en la propia resolución se indique.</p>

      ${firma('LA/EL DIRECTORA/DIRECTOR DEL CENTRO')}`;
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
    const plan = amb === 'aragon' ? 'LO 3/2022 · Aragón' : amb === 'mefp' ? 'LO 3/2022 · Ministerio (ámbito MEFPD)' : 'LOE a extinguir';
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
        <td>${h(nombreModulo(m, amb))}</td>
        <td class="num">${horas || '—'}</td>
        <td>${h(estado)}</td>
        <td>${mejor ? h(mejor.motivo) : bloqueo ? h(bloqueo) : '—'}</td>
        <td>${mejor ? h(mejor.resuelve) : '—'}</td>
        <td>${mejor ? `${h(calificacionFinal(m.codigo, mejor))}<div class="res-nota">${h(mejor.calificacion)}</div>` : '—'}</td>
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
        <tr><th>Ciclo formativo</th><td colspan="3">${h(c.ciclo.nombre)} (${h(codigoCiclo(c))}) · Grado ${h(c.ciclo.grado)} · ${h(c.ciclo.familia)}</td></tr>
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

      <p class="inf-pie">Documento generado con la herramienta de análisis de convalidaciones. Es una propuesta de trabajo interna:
      no constituye resolución administrativa ni se notifica al interesado. La resolución corresponde en cada caso al órgano
      competente: a la dirección del centro (artículos 127.1.a y 128.1 del RD 659/2023; artículo 8 del RD 1085/2020; artículo 50.4
      y apartado 6 del Anexo VIII del Decreto 91/2024), a la Dirección General competente en los Grados D y E (artículo 50.4,
      párrafo segundo, y apartado 8 del Anexo VIII) o a la Subdirección General de Ordenación e Innovación de la FP del Ministerio
      (artículo 9 del RD 1085/2020). Antes de resolver debe contrastarse el resultado con el texto vigente de las normas citadas.
      Normativa consolidada empleada: BOE a 07/04/2026 y Decreto 91/2024 (versión de 09/01/2026).<br>
      Aplicación desarrollada por Alberto Muñoz Fuertes · alberto.munoz.fuertes@proton.me</p>`;
  }

  function refrescar() {
    guardar();
    pintarAportaciones();
    pintarResultados();
  }

  // ---------- Resolución de la dirección del centro ----------
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function fechaLarga(iso) {
    const d = iso ? new Date(`${iso}T00:00:00`) : new Date();
    return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  }
  function fechaCorta(iso) {
    const d = iso ? new Date(`${iso}T00:00:00`) : new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  // Expresión breve para la columna "Registro/calificación" (Anexo VIII, aps. 15-24)
  const calificacionCorta = (r) => (r.calificacion || '').split(' (')[0];

  // Pie de recursos: art. 53 del Decreto 91/2024, distinto según titularidad y tipo de resolución
  function recursos(tipo) {
    const privado = state.titularidad === 'privado';
    const via = privado ? 'reclamación' : 'recurso de alzada';
    const art = tipo === 'exencion' ? (privado ? '53.3' : '53.2') : '53.1.a)';
    // El 53.2 es redacción original del Decreto 91/2024; el 53.1 y el 53.3 los dio el Decreto 107/2025
    const norma = (tipo === 'exencion' && !privado)
      ? 'Decreto 91/2024' : 'Decreto 91/2024 (redacción del Decreto 107/2025)';
    return `<p class="res-recursos"><b>Modo de impugnación:</b> ${via} ante la Dirección del Servicio Provincial de
      ${h(state.provincia || '____________')}, en el plazo de un mes desde el día siguiente a la notificación; puede presentarse
      en este centro. Su resolución pone fin a la vía administrativa. Arts. 121 y 122 de la Ley 39/2015 y art. ${art} del ${norma}.</p>`;
  }

  function notificacion() {
    return `<p class="res-recursos"><b>Notificación</b> (art. 40 de la Ley 39/2015). Recibí. Fecha: ____ / ____ / ______
      &nbsp;&nbsp; Firma: ____________________</p>`;
  }

  function firma(texto) {
    return `<p class="res-lugar">En ${h(state.localidad || '____________________')}, a ${h(fechaLarga(state.fecha_res))}</p>
      <div class="res-firma">
        <p>${texto}</p>
        <div class="res-linea"></div>
        <p>Fdo.: ${h(state.director || '____________________')}</p>
      </div>`;
  }

  function tablaModulos(filas, amb) {
    return `<table class="res-tabla">
        <colgroup><col style="width:9%"><col style="width:33%"><col style="width:7%"><col style="width:16%"><col style="width:35%"></colgroup>
        <thead><tr><th>Código</th><th>Nombre Módulo</th><th class="num">Curso</th><th>Calificación</th><th>Fundamento</th></tr></thead>
        <tbody>${filas.map(({ modulo: m, mejor }) => `<tr>
          <td class="cod">${h(m.codigo)}</td>
          <td>${h(nombreModulo(m, amb))}</td>
          <td class="num">${m.curso[amb] || ''}</td>
          <td>${h(calificacionFinal(m.codigo, mejor))}</td>
          <td>${h(mejor.motivo)}<div class="res-nota">${h(mejor.fundamento)}</div>
            ${mejor.faltan.length ? `<div class="res-nota falta">Falta: ${mejor.faltan.map((d) => h(N.documentos[d] || d)).join('; ')}</div>` : ''}</td>
        </tr>`).join('')}</tbody>
      </table>`;
  }

  function pintarResolucion(c, amb, filas) {
    // El Anexo VIII ap. 3 exige separar la convalidación del traslado de nota
    const convalidados = filas.filter((f) => f.mejor && f.mejor.estado === 'convalidable');
    const trasladados = filas.filter((f) => f.mejor && f.mejor.estado === 'superado');

    const dispositivo = [];
    if (convalidados.length) {
      dispositivo.push(`<h2 class="res-apartado">A · Módulos que procede convalidar</h2>${tablaModulos(convalidados, amb)}`);
    }
    if (trasladados.length) {
      dispositivo.push(`<h2 class="res-apartado">${convalidados.length ? 'B' : 'A'} · Módulos idénticos: traslado de calificación</h2>
        <p class="res-p">No son objeto de convalidación (apartado 3 del Anexo VIII del Decreto 91/2024): se traslada la nota.</p>
        ${tablaModulos(trasladados, amb)}`);
    }
    if (!dispositivo.length) {
      dispositivo.push(`<p class="res-p">No procede convalidar ningún módulo profesional con la documentación aportada.</p>`);
    }

    $('#resolucion').innerHTML = `
      <div class="res-membrete">${h(state.centro || '')}${state.membrete ? `<br>${h(state.membrete).replace(/\n/g, '<br>')}` : ''}</div>

      <h1 class="res-titulo">Propuesta de convalidación de módulos profesionales</h1>
      <p class="res-sub">Documento interno de cotejo. No es una resolución administrativa: la dirección del centro resolverá
      con su propio modelo.</p>

      <table class="res-tabla res-datos">
        <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
        <tbody>
          <tr><th>Alumno/a</th><td>${h(state.alumno || '')}</td><th>DNI/NIE</th><td>${h(state.dni || '')}</td></tr>
          <tr><th>Ciclo formativo</th><td colspan="3">${h(c.ciclo.nombre)} (${h(codigoCiclo(c))})</td></tr>
          <tr><th>Curso académico</th><td>${h(state.curso || '')}</td><th>Plan de estudios</th>
            <td>${amb === 'aragon' ? 'LO 3/2022 · Aragón' : amb === 'mefp' ? 'LO 3/2022 · Ministerio' : 'LOE a extinguir'}</td></tr>
          <tr><th>Fecha del cotejo</th><td colspan="3">${h(fechaLarga(state.fecha_res))}</td></tr>
        </tbody>
      </table>

      ${dispositivo.join('')}

      <p class="res-p res-recursos">Base normativa aplicada: Ley Orgánica 3/2022, de 31 de marzo; Real Decreto 659/2023, de 18 de
      julio (artículos 126 a 128); Real Decreto 1085/2020, de 9 de diciembre (artículos 8 y 10); y Decreto 91/2024, de 5 de junio,
      del Gobierno de Aragón (artículos 48, 50 y 51 y Anexo VIII, apartado 6). La expresión de la calificación sigue los apartados
      15 a 24 de ese Anexo VIII.</p>`;
  }

  // ---------- Resolución de exención de la formación en empresa ----------
  function pintarExencion(c, amb, filas) {
    const fila = filas.find((f) => f.modulo.tipo === 'empresa');
    const mejor = fila && fila.mejor;
    const exp = state.aportaciones.filter((a) => a.tipo === 'experiencia');
    const meses = exp.filter((a) => a.relacionada).reduce((s, a) => s + (a.meses || 0), 0);
    const total = mejor && mejor.estado === 'exento';
    const privado = state.titularidad === 'privado';
    const minimo = 'un año a tiempo completo o su equivalente (Grado D)';
    const nombreMod = fila
      ? `${fila.modulo.codigo === 'FE' ? '' : `${fila.modulo.codigo} `}${nombreModulo(fila.modulo, amb)}`
      : 'periodo de formación en empresa u organismo equiparado';
    const docs = [...new Set(exp.flatMap((a) => a.docs))];

    const alcance = total
      ? `<p class="res-p"><b>Alcance:</b> exención <b>total</b> del ${h(nombreMod)}.</p>`
      : `<p class="res-p"><b>Alcance:</b> exención <b>parcial</b>. Quedan eximidos los siguientes resultados de aprendizaje del
         periodo de formación en empresa u organismo equiparado, por coincidencia con las tareas profesionales acreditadas
         (artículo 131.4 del Real Decreto 659/2023):</p>
         <table class="res-tabla">
           <colgroup><col style="width:38%"><col style="width:42%"><col style="width:20%"></colgroup>
           <thead><tr><th>Módulo profesional</th><th>Resultado(s) de aprendizaje eximido(s)</th><th class="num">Horas (orientativo)</th></tr></thead>
           <tbody><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></tbody>
         </table>
         <p class="res-p">El/la alumno/a deberá realizar el resto del periodo, por una duración de ____________ horas.</p>`;

    $('#exencion').innerHTML = `
      <div class="res-membrete">${h(state.centro || '')}${state.membrete ? `<br>${h(state.membrete).replace(/\n/g, '<br>')}` : ''}</div>

      <h1 class="res-titulo">Resolución sobre exención del periodo de formación en empresa u organismo equiparado</h1>

      <p class="res-p">Vista la solicitud presentada por el/la alumno/a y la documentación acreditativa de la experiencia laboral
      aportada${privado ? `, así como el informe y la documentación remitidos por el centro privado ${h(state.centro || '____________')} (artículo 50.7 del Decreto 91/2024)` : ''}.</p>
      <p class="res-p">De conformidad con la Ley Orgánica 3/2022, de 31 de marzo (artículo 39.2.b); el Real Decreto 659/2023, de 18
      de julio (artículos 131, 161 y 177.3); y el Decreto 91/2024, de 5 de junio, del Gobierno de Aragón (artículos 49, 50.6, 50.7
      y 51.3):</p>
      <p class="res-p"><b>SE RESUELVE:</b> Con fecha ${h(fechaCorta(state.fecha_res))}, conceder la
      <b>exención ${total ? 'total' : 'parcial'}</b> del ${h(nombreMod)} al/a la alumno/a
      <b>${h(state.alumno || '____________________')}</b> con DNI: <b>${h(state.dni || '____________')}</b>,
      matriculado/a en el ciclo formativo de ${h(c.ciclo.nombre)}${state.curso ? `, curso ${h(state.curso)}` : ''},
      por corresponderse la experiencia laboral acreditada con la formación del ciclo.</p>

      <table class="res-tabla">
        <colgroup><col style="width:34%"><col style="width:66%"></colgroup>
        <tbody>
          <tr><th>Experiencia laboral acreditada</th><td>${meses ? `${meses} meses a tiempo completo o equivalente` : '____________________'}
            <div class="res-nota">Mínimo exigible: ${h(minimo)} (artículo 161.1 del RD 659/2023). Solo es válida la experiencia de
            los cinco años anteriores a la solicitud (artículo 49.1 del Decreto 91/2024).</div></td></tr>
          <tr><th>Documentación aportada</th><td>${docs.length ? docs.map((d) => h(doc(d))).join('; ') : '____________________'}</td></tr>
        </tbody>
      </table>

      ${alcance}

      <p class="res-p">La exención del periodo de formación en empresa u organismo equiparado se recogerá en los documentos de
      evaluación y no afectará a las calificaciones de los módulos profesionales a los que pertenezcan los resultados de aprendizaje
      compartidos entre centro de formación profesional y empresa u organismo equiparado. Será el equipo docente del centro de
      formación profesional el responsable único de la evaluación y calificación (artículo 131.6 del Real Decreto 659/2023 y
      artículo 51.3 del Decreto 91/2024).</p>

      ${recursos('exencion')}
      ${notificacion()}
      ${firma(privado
        ? `LA/EL DIRECTORA/DIRECTOR DEL CENTRO PÚBLICO DE ADSCRIPCIÓN${state.adscrito ? `<br>${h(state.adscrito)}` : ''}`
        : 'LA/EL DIRECTORA/DIRECTOR DEL CENTRO')}`;
  }

  // ---------- Eventos ----------
  function init() {
    pintarCabecera();
    $('#tipo').innerHTML = Object.entries(TIPOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
    pintarFormAlta();
    refrescar();

    $('#ambito').addEventListener('change', (e) => { state.ambito = e.target.value; refrescar(); });
    for (const id of ['centro', 'membrete', 'localidad', 'director', 'fecha_res', 'adscrito', 'alumno', 'dni', 'curso', 'notas']) {
      $('#' + id).addEventListener('input', (e) => { state[id] = e.target.value; guardar(); pintarResultados(); });
    }
    for (const id of ['titularidad', 'provincia']) {
      $('#' + id).addEventListener('change', (e) => {
        state[id] = e.target.value;
        $('#lbl-adscrito').hidden = state.titularidad !== 'privado';
        guardar(); pintarResultados();
      });
    }
    for (const id of ['grado', 'familia']) {
      $('#' + id).addEventListener('change', (e) => {
        state[id] = e.target.value;
        pintarFiltros();
        pintarFormAlta();
        refrescar();
      });
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
    $('#tabla-resultados').addEventListener('change', (e) => {
      const cod = e.target.dataset.cod;
      if (cod === undefined) return;
      state.calificaciones = { ...(state.calificaciones || {}) };
      const v = e.target.value.trim();
      if (v) state.calificaciones[cod] = v; else delete state.calificaciones[cod];
      guardar();
      pintarResultados();
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
    const imprimir = (clase) => {
      document.body.className = clase;
      window.print();
    };
    $('#btn-resolucion').addEventListener('click', () => imprimir('doc-resolucion'));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
