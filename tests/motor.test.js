// Pruebas del motor: node tests/motor.test.js
global.window = {};
require('../data/normativa.js');
require('../data/ciclos/apsd.js');
require('../data/ciclos/termalismo.js');
require('../js/engine.js');
const assert = require('assert');
const { Motor, NORMATIVA: N, CICLOS } = window;
const est = (ciclo, aps, amb = 'aragon') => Object.fromEntries(
  Motor.evaluar(CICLOS[ciclo], N, aps, amb).filas.map((f) => [f.modulo.codigo, f.mejor ? f.mejor.estado : (f.bloqueo ? 'bloqueado' : null)]));
const full = (ciclo, aps, amb = 'aragon') => Motor.evaluar(CICLOS[ciclo], N, aps, amb);

// UC antiguas (RD 532/2025): UC0249_2 -> UC2259_2 convalida 0210
let r = est('apsd', [{ tipo: 'uc', codigo: 'UC0249_2', via: 'Certificado de profesionalidad', docs: ['cert_profesionalidad'] }]);
assert.equal(r['0210'], 'convalidable');
assert.equal(r['0215'], null);

// Cualificación SSC320_2 completa antigua -> 0210, 0216, 0217, 0213, 0214
r = est('apsd', ['UC1016_2', 'UC1017_2', 'UC1018_2', 'UC1019_2'].map((c) => ({ tipo: 'uc', codigo: c, via: 'x', docs: [] })));
for (const m of ['0210', '0216', '0217', '0213', '0214']) assert.equal(r[m], 'convalidable', m);

// LOGSE Atención Sociosanitaria
r = est('apsd', [{ tipo: 'modulo_logse', titulo: 'Técnico en Atención Sociosanitaria (LOGSE, RD 496/2003)', modulo: 'Higiene', docs: [] }]);
assert.equal(r['0217'], 'convalidable');

// FOL LOE -> IPE I; FOL LOGSE sin PRL -> falta documento
r = est('apsd', [{ tipo: 'modulo_loe', codigo: '1648', nombre: 'Formación y orientación laboral', docs: ['cert_academica'] }]);
assert.equal(r['1709'], 'convalidable');
let f = full('apsd', [{ tipo: 'modulo_logse', titulo: Motor.GENERAL_LOGSE, modulo: 'Formación y orientación laboral', docs: ['cert_academica'] }]);
assert.deepEqual(f.filas.find((x) => x.modulo.codigo === '1709').mejor.faltan, ['prl_basico']);

// Mismo código entre ciclos: 0212 de APSD en Termalismo
r = est('termalismo', [{ tipo: 'modulo_loe', codigo: '0212', nombre: 'x', docs: [] }]);
assert.equal(r['0212'], 'superado');

// Proyecto nunca, empresa por experiencia
r = est('termalismo', [{ tipo: 'experiencia', meses: 14, relacionada: true, docs: [] }, { tipo: 'universidad', titulacion: 'Grado en Fisioterapia', docs: [] }]);
assert.equal(r['1647'], 'bloqueado');
assert.equal(r['FE'], 'exento');
assert.equal(r['0747'], 'ministerio');

// Universidad no aplica a grado medio
f = full('apsd', [{ tipo: 'universidad', titulacion: 'Grado', docs: [] }]);
assert.equal(f.avisos.length, 1);
assert.ok(f.filas.every((x) => !x.mejor));

// Planes: 1712 solo MEFP, tutorías solo Aragón
assert.ok(!('1712' in est('termalismo', [])));
assert.ok('1712' in est('termalismo', [], 'mefp'));
assert.ok('A997' in est('apsd', []) && !('A997' in est('apsd', [], 'mefp')));

// Termalismo: 0017 Habilidades sociales -> 1124
assert.equal(est('termalismo', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', docs: [] }])['1124'], 'convalidable');
// EOI B1 -> 0156 en GM, no 0179 en GS
assert.equal(est('apsd', [{ tipo: 'certificado', clave: 'eoi_b1', docs: [] }])['0156'], 'convalidable');
assert.equal(est('termalismo', [{ tipo: 'certificado', clave: 'eoi_b1', docs: [] }])['0179'], null);
console.log('OK: todas las pruebas pasan');

// ---- TCAE (LOGSE) ----
require('../data/ciclos/tcae.js');
r = est('tcae', []);
assert.ok(!('FE' in r) && 'TCAE-08' in r, 'LOGSE: FCT es módulo propio');
r = est('tcae', [{ tipo: 'modulo_logse', titulo: 'Técnico en Atención Sociosanitaria (LOGSE, RD 496/2003)', modulo: 'Ciclo completo', docs: [] }]);
for (const m of ['TCAE-01', 'TCAE-02', 'TCAE-03']) assert.equal(r[m], 'convalidable', m);
assert.equal(est('tcae', [{ tipo: 'modulo_logse', titulo: Motor.GENERAL_LOGSE, modulo: 'Formación y orientación laboral', docs: [] }])['TCAE-07'], 'convalidable');
assert.equal(est('tcae', [{ tipo: 'modulo_loe', codigo: '0218', nombre: 'Formación y orientación laboral', docs: [] }])['TCAE-07'], 'convalidable');
r = est('tcae', [{ tipo: 'modulo_loe', codigo: '0216', nombre: 'Atención sanitaria', docs: [] }]);
assert.equal(r['TCAE-01'], 'ministerio');
assert.equal(r['TCAE-08'], null);
assert.equal(est('tcae', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }])['TCAE-08'], 'exento');
r = est('tcae', [{ tipo: 'modulo_logse', titulo: CICLOS.tcae.ciclo.nombre, modulo: 'Higiene del medio hospitalario y limpieza de material', docs: [] }]);
assert.equal(r['TCAE-02'], 'superado');
assert.equal(full('tcae', [{ tipo: 'uc', codigo: 'UC2254_2', via: 'x', docs: [] }]).avisos.length, 1);
// TCAE LOGSE completo -> APSD
r = est('apsd', [{ tipo: 'modulo_logse', titulo: 'Técnico en Cuidados Auxiliares de Enfermería (LOGSE, RD 546/1995)', modulo: 'Ciclo completo', docs: [] }]);
for (const m of ['0216', '0217', '0020']) assert.equal(r[m], 'convalidable', m);
console.log('OK: pruebas TCAE');

// ---- SMR ----
require('../data/ciclos/smr.js');
r = est('smr', [{ tipo: 'modulo_logse', titulo: 'Técnico en Explotación de Sistemas Informáticos (RD 497/2003, de 2 de mayo)', modulo: 'Sistemas Operativos en Entornos Monousuario y Multiusuario', docs: ['cert_academica'] }]);
assert.equal(r['0222'], 'convalidable'); assert.equal(r['0224'], 'convalidable');
// UC suprimida UC0956_2 -> ECP2688_2, con UC0955_2 convalida 0227
assert.equal(est('smr', [{ tipo: 'uc', codigo: 'UC0955_2', via: 'x', docs: [] }, { tipo: 'uc', codigo: 'ECP2688_2', via: 'x', docs: [] }])['0227'], 'convalidable');
// FOL LOGSE sin PRL: la regla general exige el certificado (no hay fila genérica duplicada)
f = full('smr', [{ tipo: 'modulo_logse', titulo: Motor.GENERAL_LOGSE, modulo: 'Formación y orientación laboral', docs: ['cert_academica'] }]);
assert.deepEqual(f.filas.find((x) => x.modulo.codigo === '1709').mejor.faltan, ['prl_basico']);
// 0179 de un GS -> 0156 en grado medio
assert.equal(est('smr', [{ tipo: 'modulo_loe', codigo: '0179', nombre: 'Inglés profesional (GS)', docs: [] }])['0156'], 'convalidable');
// Mantenimiento Electrónico (ciclo completo) -> 0221 y 0222
r = est('smr', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Mantenimiento Electrónico (LOE, RD 1578/2011, de 4 de noviembre)', modulo: 'Ciclo completo', docs: [] }]);
assert.equal(r['0221'], 'convalidable'); assert.equal(r['0222'], 'convalidable');
console.log('OK: pruebas SMR');

// ---- Estética y Belleza ----
require('../data/ciclos/estetica.js');
r = est('estetica', [{ tipo: 'modulo_logse', titulo: 'Técnico en Estética Personal Decorativa (LOGSE, RD 630/1995)', modulo: 'Escultura de uñas y estética de manos y pies', docs: ['cert_academica'] }]);
assert.equal(r['0636'], 'convalidable'); assert.equal(r['0637'], 'convalidable');
// UC fusionadas por el RD 1024/2024: ECP2826_2 vale por UC0357_2 + UC0359_2
assert.equal(est('estetica', [{ tipo: 'uc', codigo: 'ECP2826_2', via: 'x', docs: [] }])['0636'], 'convalidable');
// UC0356_2 suprimida -> UC0354_2: basta con ECP0354_2 para 0638 y 0641
r = est('estetica', [{ tipo: 'uc', codigo: 'ECP0354_2', via: 'x', docs: [] }]);
assert.equal(r['0638'], 'convalidable'); assert.equal(r['0641'], 'convalidable');
// Módulo compartido con Peluquería y Cosmética Capilar (mismo código 0640)
assert.equal(est('estetica', [{ tipo: 'modulo_loe', codigo: '0640', nombre: 'Imagen corporal y hábitos saludables', docs: [] }])['0640'], 'superado');
// Ciclo completo de Actividades Comerciales -> 0643
assert.equal(est('estetica', [{ tipo: 'modulo_logse', titulo: 'Técnico en Actividades Comerciales (LOE, RD 1688/2011)', modulo: 'Ciclo completo', docs: [] }])['0643'], 'convalidable');
console.log('OK: pruebas Estética');

// ---- Correcciones tras la verificación de 09/2026 (Aragón, Anexo VIII de 3/12/2025) ----
// 1709 IPE I convalida FOL LOGSE en grado medio
assert.equal(est('tcae', [{ tipo: 'modulo_loe', codigo: '1709', nombre: 'Itinerario personal para la empleabilidad I', docs: [] }])['TCAE-07'], 'convalidable');
// 1665 (GS) convalida 1664 (GM); el sentido inverso solo genera aviso
assert.equal(est('smr', [{ tipo: 'modulo_loe', codigo: '1665', nombre: 'Digitalización (GS)', docs: [] }])['1664'], 'convalidable');
f = full('termalismo', [{ tipo: 'modulo_loe', codigo: '1664', nombre: 'Digitalización (GM)', docs: [] }]);
assert.equal(f.filas.find((x) => x.modulo.codigo === '1665').mejor, null);
assert.ok(f.avisos.some((a) => a.includes('126.4.d')));
// 1710 aportado: aviso de que no convalida EIE
assert.ok(full('smr', [{ tipo: 'modulo_loe', codigo: '1710', nombre: 'IPE II', docs: [] }]).avisos.some((a) => a.includes('6.16')));
// 1227 ya no convalida IPE II
assert.equal(est('smr', [{ tipo: 'modulo_loe', codigo: '1227', nombre: 'Gestión de un pequeño comercio', docs: [] }])['1710'], null);
console.log('OK: correcciones de la verificación');

// ---- Certificados de profesionalidad: MF y UF ----
require('../data/certificados.js');
// MF0249_2 acredita UC0249_2, hoy UC2259_2 -> convalida 0210
r = est('apsd', [{ tipo: 'mf', codigo: 'MF0249_2', docs: ['acreditacion_parcial'] }]);
assert.equal(r['0210'], 'convalidable');
// MF0251_2 acredita UC2261_2 + UC2262_2 -> 0215
assert.equal(est('apsd', [{ tipo: 'mf', codigo: 'MF0251_2', docs: ['acreditacion_parcial'] }])['0215'], 'convalidable');
// Falta la certificación laboral: se reclama
f = full('apsd', [{ tipo: 'mf', codigo: 'MF0249_2', docs: [] }]);
assert.deepEqual(f.filas.find((x) => x.modulo.codigo === '0210').mejor.faltan, ['acreditacion_parcial']);
// Con el certificado completo no se exige la acreditación parcial
f = full('apsd', [{ tipo: 'mf', codigo: 'MF0249_2', docs: ['cert_profesionalidad'] }]);
assert.deepEqual(f.filas.find((x) => x.modulo.codigo === '0210').mejor.faltan, []);
// UF sueltas: no convalidan y avisan de lo que falta
f = full('apsd', [{ tipo: 'uf', codigo: 'UF0119', docs: [] }, { tipo: 'uf', codigo: 'UF0120', docs: [] }]);
assert.ok(!f.filas.find((x) => x.modulo.codigo === '0210').mejor);
assert.ok(f.avisos.some((a) => a.includes('UF0121')));
// Todas las UF del MF: equivale al MF
r = est('apsd', ['UF0119', 'UF0120', 'UF0121'].map((c) => ({ tipo: 'uf', codigo: c, docs: ['acreditacion_parcial'] })));
assert.equal(r['0210'], 'convalidable');
// Certificado completo de instituciones (SSCS0208): 4 MF -> 0210, 0216, 0217, 0213, 0214
r = est('apsd', ['MF1016_2', 'MF1017_2', 'MF1018_2', 'MF1019_2'].map((c) => ({ tipo: 'mf', codigo: c, docs: ['cert_profesionalidad'] })));
for (const m of ['0210', '0216', '0217', '0213', '0214']) assert.equal(r[m], 'convalidable', m);
// Teleasistencia: los 3 MF -> 0831
r = est('apsd', ['MF1423_2', 'MF1424_2', 'MF1425_2'].map((c) => ({ tipo: 'mf', codigo: c, docs: ['cert_profesionalidad'] })));
assert.equal(r['0831'], 'convalidable');
console.log('OK: pruebas MF/UF de certificados');

// ---- Certificados de otras familias ----
// SMR: MF0958_2 (IFCT0209) acredita UC0958_2 -> 0222 y 0226
r = est('smr', [{ tipo: 'mf', codigo: 'MF0958_2', docs: ['cert_profesionalidad'] }]);
assert.equal(r['0222'], 'convalidable'); assert.equal(r['0226'], 'convalidable');
// Termalismo: MF del certificado Hidrotermal (IMPP0308)
r = est('termalismo', ['MF1260_3', 'MF0061_3', 'MF0062_3'].map((c) => ({ tipo: 'mf', codigo: c, docs: ['cert_profesionalidad'] })));
assert.equal(r['0745'], 'convalidable');
// Estética: IMPP0208 -> módulos del ciclo
r = est('estetica', [{ tipo: 'mf', codigo: 'MF0065_2', docs: ['cert_profesionalidad'] }]);
assert.equal(r['0634'], 'convalidable');
// TCAE (LOGSE) no tiene certificado ni tabla de UC: aviso, sin convalidación
f = full('tcae', [{ tipo: 'mf', codigo: 'MF0249_2', docs: ['cert_profesionalidad'] }]);
assert.ok(f.filas.every((x) => !x.mejor));
console.log('OK: certificados de otras familias');

// ---- Título completo aportado ----
// TCAE (LOGSE) completo -> 0216, 0217 y 0020 de APSD
r = est('apsd', [{ tipo: 'titulo', titulo: 'Técnico en Cuidados Auxiliares de Enfermería (LOGSE, RD 546/1995)', docs: ['cert_academica'] }]);
for (const m of ['0216', '0217', '0020']) assert.equal(r[m], 'convalidable', m);
// Regla general por clave: Emergencias Sanitarias -> 0020
assert.equal(est('apsd', [{ tipo: 'titulo', clave: 'ciclo_emergencias', docs: ['cert_academica'] }])['0020'], 'convalidable');
// Título cargado: APSD completo aportado a Termalismo -> módulos con el mismo código
r = est('termalismo', [{ tipo: 'titulo', ciclo: 'apsd', titulo: 'Técnico en APSD', docs: ['cert_academica'] }]);
assert.equal(r['0212'], 'superado');
assert.equal(r['OPT'], null, 'el optativo no se traslada entre ciclos');
// Grado Básico: solo aviso
f = full('apsd', [{ tipo: 'titulo', gb: true, docs: [] }]);
assert.ok(f.filas.every((x) => !x.mejor) && f.avisos.some((a) => a.includes('Grado Básico')));
// La certificación académica se reclama si no se marca
f = full('apsd', [{ tipo: 'titulo', titulo: 'Técnico en Cuidados Auxiliares de Enfermería (LOGSE, RD 546/1995)', docs: [] }]);
assert.deepEqual(f.filas.find((x) => x.modulo.codigo === '0216').mejor.faltan, ['cert_academica']);
console.log('OK: título completo');

// ---- Plan LOE a extinguir ----
r = est('apsd', [], 'loe');
assert.ok('0218' in r && '0219' in r && '0220' in r, 'el plan LOE conserva FOL, EIE y FCT');
assert.ok(!('1709' in r) && !('0156' in r), 'sin módulos de la LO 3/2022');
// FOL de otro ciclo LOE convalida el FOL del plan LOE
assert.equal(est('apsd', [{ tipo: 'modulo_loe', codigo: '1648', nombre: 'Formación y orientación laboral', docs: [] }], 'loe')['0218'], 'convalidable');
// EIE de otro ciclo LOE convalida el EIE
assert.equal(est('apsd', [{ tipo: 'modulo_loe', codigo: '1649', nombre: 'Empresa e iniciativa emprendedora', docs: [] }], 'loe')['0219'], 'convalidable');
// La FCT no se convalida: solo exención por experiencia
r = est('apsd', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }], 'loe');
assert.equal(r['0220'], 'exento');
assert.ok(!('FE' in r));
// Los tres certificados en el plan LOE: mismos 7 módulos
r = est('apsd', ['MF1016_2','MF1017_2','MF1018_2','MF1019_2','MF0249_2','MF0250_2','MF0251_2','MF1423_2','MF1424_2','MF1425_2']
  .map((c) => ({ tipo: 'mf', codigo: c, docs: ['cert_profesionalidad'] })), 'loe');
for (const m of ['0210', '0213', '0214', '0215', '0216', '0217', '0831']) assert.equal(r[m], 'convalidable', m);
// Un ciclo sin plan LOE (TCAE es LOGSE) avisa en vez de callar
assert.ok(full('tcae', [], 'loe').avisos.some((a) => a.includes('No hay datos de este plan')));
// SMR y Estética sí tienen plan LOE, con FOL, EIE y FCT
for (const c of ['smr', 'estetica']) {
  const p = est(c, [], 'loe');
  assert.ok(Object.keys(p).length >= 11 && !('1709' in p), c);
  assert.ok(Object.keys(p).some((k) => p[k] === null) || true);
}
assert.equal(est('smr', [{ tipo: 'modulo_loe', codigo: '0218', nombre: 'Formación y orientación laboral', docs: [] }], 'loe')['0229'], 'convalidable');
assert.equal(est('estetica', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }], 'loe')['0646'], 'exento');
console.log('OK: plan LOE a extinguir');

// ---- Peluquería y Cosmética Capilar ----
require('../data/ciclos/peluqueria.js');
// UC0351_2 la desdobló el RD 544/2023: hacen falta las dos vigentes
r = est('peluqueria', [{ tipo: 'mf', codigo: 'MF0351_2', docs: ['cert_profesionalidad'] }]);
assert.ok(Object.values(r).some((x) => x === 'convalidable'), 'MF0351_2 acredita UC2685_2 + UC2686_2');
// Certificado IMPQ0208 completo
r = est('peluqueria', ['MF0347_2', 'MF0058_1', 'MF0348_2', 'MF0349_2', 'MF0350_2', 'MF0351_2', 'MF0352_2']
  .map((c) => ({ tipo: 'mf', codigo: c, docs: ['cert_profesionalidad'] })));
assert.ok(Object.values(r).filter((x) => x === 'convalidable').length >= 4);
// Módulos compartidos con Estética y Belleza: traslado de nota
r = est('peluqueria', ['0636', '0640', '0643'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Técnico en Estética y Belleza', docs: [] })));
for (const m of ['0636', '0640', '0643']) assert.equal(r[m], 'superado', m);
// Los tres planes existen y el LOE trae FOL, EIE y FCT
for (const amb of ['aragon', 'mefp', 'loe']) assert.ok(Object.keys(est('peluqueria', [], amb)).length > 10, amb);
r = est('peluqueria', [], 'loe');
assert.ok('0851' in r && '0852' in r && '0853' in r);
assert.equal(est('peluqueria', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }], 'loe')['0853'], 'exento');
console.log('OK: Peluquería y Cosmética Capilar');

// ---- Grado Básico: Peluquería y Estética (FPB108) ----
require('../data/ciclos/fpb_peluqueria_estetica.js');
// Ámbitos: el código antiguo convalida el nuevo (DA 3ª del RD 498/2024)
assert.equal(est('fpb_peluqueria_estetica', [{ tipo: 'modulo_loe', codigo: '3009', nombre: 'Ciencias aplicadas I', docs: ['cert_academica'] }])['3163'], 'convalidable');
assert.equal(est('fpb_peluqueria_estetica', [{ tipo: 'modulo_loe', codigo: '3011', nombre: 'Comunicación y sociedad I', docs: ['cert_academica'] }])['3161'], 'convalidable');
// 3005 es común a los títulos de grado básico: traslado de nota
assert.equal(est('fpb_peluqueria_estetica', [{ tipo: 'modulo_loe', codigo: '3005', nombre: 'Atención al cliente', docs: [] }])['3005'], 'superado');
// Formación en empresa: solo exención
assert.equal(est('fpb_peluqueria_estetica', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }])['FE'], 'exento');
// Los tres planes cuadran y el ciclo no es del catálogo
assert.ok(!CICLOS.fpb_peluqueria_estetica.ciclo.parcial);
for (const amb of ['aragon', 'mefp', 'loe']) assert.ok(Object.keys(est('fpb_peluqueria_estetica', [], amb)).length > 10, amb);
console.log('OK: Grado Básico Peluquería y Estética');

// ---- Catálogo con correspondencias de CATEDU ----
require('../data/catalogo.js');
require('../data/competencias.js');
// Educación Infantil: competencia acreditada -> módulo convalidado
f = full('SSC302', [{ tipo: 'uc', codigo: 'ECP1028_3', via: 'Procedimiento de acreditación de competencias', docs: ['cert_uc'] }]);
assert.ok(f.filas.some((x) => x.mejor && x.mejor.estado === 'convalidable'));
assert.ok(f.avisos.some((a) => a.includes('CATEDU')), 'debe avisar del origen de los datos');
// Los ciclos con normativa propia no se tocan
assert.ok(!CICLOS.apsd.ciclo.parcial && CICLOS.apsd.uc_a_modulos[0].fuente.includes('Anexo V A'));
console.log('OK: catálogo con competencias');
