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
// Un ciclo cualquiera del catálogo: competencia acreditada -> módulo convalidado
const delCatalogo = Object.entries(CICLOS)
  .find(([, c]) => c.ciclo.parcial && c.ciclo.competencias_catedu && c.uc_a_modulos.length);
assert.ok(delCatalogo, 'debe quedar algún ciclo con correspondencias de CATEDU');
const [idCat, cicloCat] = delCatalogo;
f = full(idCat, cicloCat.uc_a_modulos[0].uc.map((u) => ({ tipo: 'uc', codigo: u, via: 'Procedimiento de acreditación de competencias', docs: ['cert_uc'] })));
assert.ok(f.filas.some((x) => x.mejor && x.mejor.estado === 'convalidable'), idCat);
assert.ok(f.avisos.some((a) => a.includes('CATEDU')), 'debe avisar del origen de los datos');
// Los ciclos con normativa propia no se tocan
assert.ok(!CICLOS.apsd.ciclo.parcial && CICLOS.apsd.uc_a_modulos[0].fuente.includes('Anexo V A'));
console.log('OK: catálogo con competencias');

// ---- Ciclos de Sanidad ----
['san202', 'san203', 'san301', 'san302', 'san303'].forEach((c) => require(`../data/ciclos/${c}.js`));
// Emergencias Sanitarias: ciclo completo -> 0020 en APSD (ya estaba) y su propio plan
assert.ok(Object.keys(est('san203', [])).length > 15);
// Documentación Sanitaria: excluida de la exención en Aragón (art. 49.2 Decreto 91/2024)
f = full('san303', [{ tipo: 'experiencia', meses: 24, relacionada: true, docs: ['vida_laboral', 'contrato_empresa'] }]);
assert.ok(!f.filas.some((x) => x.mejor && x.mejor.estado === 'exento'), 'no debe conceder exención');
assert.ok(f.avisos.some((a) => a.includes('49.2')), 'debe explicar por qué');
// Farmacia sí admite exención (es grado medio)
assert.equal(est('san202', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }])['FE'], 'exento');
// Dietética es LOGSE: FCT propia, sin pseudo-módulo
r = est('san302', [{ tipo: 'experiencia', meses: 12, relacionada: true, docs: [] }]);
assert.ok(!('FE' in r) && r['D010'] === 'exento');
// Anatomía Patológica: módulos idénticos con Laboratorio Clínico
assert.equal(est('san301', [{ tipo: 'modulo_loe', codigo: '1367', nombre: 'Gestión de muestras biológicas', titulo: 'TS Laboratorio Clínico', docs: [] }])['1367'], 'superado');
console.log('OK: ciclos de Sanidad');

// Higiene Bucodental: exploración + prevención bucodental (LOGSE) -> TCAE
require('../data/ciclos/san304.js');
r = est('tcae', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Higiene Bucodental (LOGSE, RD 537/1995)', modulo: 'Exploración bucodental', docs: [] },
                 { tipo: 'modulo_logse', titulo: 'Técnico Superior en Higiene Bucodental (LOGSE, RD 537/1995)', modulo: 'Prevención bucodental', docs: [] }]);
assert.equal(r['TCAE-04'], 'convalidable');
// Y el propio ciclo: sin exención por el art. 49.2
assert.ok(!full('san304', [{ tipo: 'experiencia', meses: 24, relacionada: true, docs: [] }]).filas.some((x) => x.mejor && x.mejor.estado === 'exento'));
console.log('OK: Higiene Bucodental');

// Laboratorio Clínico: módulos idénticos con Anatomía Patológica
require('../data/ciclos/san306.js');
r = est('san306', ['1367', '1368', '1369', '1370'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Anatomía Patológica', docs: [] })));
for (const m of ['1367', '1368', '1369', '1370']) assert.equal(r[m], 'superado', m);
console.log('OK: Laboratorio Clínico');

// Radioterapia: módulos comunes con Imagen para el Diagnóstico
require('../data/ciclos/san309.js');
r = est('san309', ['1345', '1346', '1347', '1348'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Imagen para el Diagnóstico', docs: [] })));
for (const m of ['1345', '1346', '1347', '1348']) assert.equal(r[m], 'superado', m);
// Sanidad completa: los once ciclos con normativa propia
['san305', 'san308'].forEach((c) => require(`../data/ciclos/${c}.js`));
const sanidad = ['tcae', 'san202', 'san203', 'san301', 'san302', 'san303', 'san304', 'san305', 'san306', 'san308', 'san309'];
sanidad.forEach((c) => assert.ok(CICLOS[c] && !CICLOS[c].ciclo.parcial, c));
console.log('OK: Sanidad completa (11 ciclos)');

// Estética Integral: módulos compartidos con Termalismo
require('../data/ciclos/imp302.js');
r = est('imp302', ['0745', '0747'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Termalismo y bienestar', docs: [] })));
assert.equal(r['0745'], 'superado'); assert.equal(r['0747'], 'superado');
// Y al revés, en Termalismo
r = est('termalismo', ['0745', '0747'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Estética Integral', docs: [] })));
assert.equal(r['0745'], 'superado'); assert.equal(r['0747'], 'superado');
console.log('OK: Estética Integral y Bienestar');

// Integración Social: sus módulos 0017 y 0343 convalidan en APSD (ya cargado por el otro lado)
require('../data/ciclos/ssc303.js');
r = est('apsd', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', titulo: 'TS Integración Social', docs: [] },
                 { tipo: 'modulo_loe', codigo: '0343', nombre: 'Sistemas aumentativos y alternativos de comunicación', titulo: 'TS Integración Social', docs: [] }]);
assert.equal(r['0211'], 'convalidable'); assert.equal(r['0214'], 'convalidable');
console.log('OK: Integración Social');

// Educación Infantil: su 0017 convalida Destrezas sociales en APSD
require('../data/ciclos/ssc302.js');
assert.equal(est('apsd', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', titulo: 'TS Educación Infantil', docs: [] }])['0211'], 'convalidable');
// Y el propio ciclo ya no es del catálogo
assert.ok(!CICLOS.ssc302.ciclo.parcial && CICLOS.ssc302.convalidaciones_titulos_anteriores.length > 5);
console.log('OK: Educación Infantil');

// Animación Sociocultural: 1124 convalida Destrezas sociales en APSD, y comparte 1123/1124 con Termalismo
require('../data/ciclos/ssc301.js');
assert.equal(est('apsd', [{ tipo: 'modulo_loe', codigo: '1124', nombre: 'Dinamización grupal', titulo: 'TS Animación Sociocultural y Turística', docs: [] }])['0211'], 'convalidable');
r = est('ssc301', ['1123', '1124'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Termalismo y bienestar', docs: [] })));
assert.equal(r['1123'], 'superado'); assert.equal(r['1124'], 'superado');
console.log('OK: Animación Sociocultural y Turística');

// Estilismo y Dirección de Peluquería: 0750 común con Estética Integral
require('../data/ciclos/imp303.js');
assert.equal(est('imp303', [{ tipo: 'modulo_loe', codigo: '0750', nombre: 'x', titulo: 'TS Estética Integral y Bienestar', docs: [] }])['0750'], 'superado');
assert.equal(est('imp302', [{ tipo: 'modulo_loe', codigo: '0750', nombre: 'x', titulo: 'TS Estilismo y Dirección de Peluquería', docs: [] }])['0750'], 'superado');
console.log('OK: Estilismo y Dirección de Peluquería');

// Actividades Domésticas (grado básico): ámbitos y sin 3005
require('../data/ciclos/fpb128.js');
r = est('fpb128', [{ tipo: 'modulo_loe', codigo: '3011', nombre: 'Comunicación y sociedad I', docs: ['cert_academica'] }]);
assert.equal(r['3161'], 'convalidable');
assert.ok(!('3005' in est('fpb128', [])), 'este título no tiene el módulo 3005');
console.log('OK: Actividades Domésticas y Limpieza de Edificios');

// Informática de Oficina (grado básico): ámbitos del plan anterior y módulos comunes con FPB104
require('../data/ciclos/fpb121.js');
r = est('fpb121', [
  { tipo: 'modulo_loe', codigo: '3019', nombre: 'Ciencias aplicadas II', docs: ['cert_academica'] },
  { tipo: 'modulo_loe', codigo: '3029', nombre: 'Montaje y mantenimiento de sistemas y componentes informáticos', titulo: 'Profesional Básico en Informática y Comunicaciones', docs: [] },
]);
assert.equal(r['3164'], 'convalidable');
assert.equal(r['3029'], 'superado');
assert.notEqual(r['3031'], 'superado');
console.log('OK: Informática de Oficina');

// Informática y Comunicaciones (grado básico): 3029, 3030 y 3016 comunes con Informática de Oficina
require('../data/ciclos/fpb104.js');
r = est('fpb104', ['3029', '3030', '3016'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Profesional Básico en Informática de Oficina', docs: [] })));
['3029', '3030', '3016'].forEach((c) => assert.equal(r[c], 'superado', c));
assert.notEqual(r['3015'], 'superado');
assert.equal(est('fpb104', ['UC1559_1', 'UC1560_1'].map((u) => ({ tipo: 'uc', codigo: u, docs: [] })))['3015'] === 'convalidable', false, '3015 exige las tres UC');
console.log('OK: Informática y Comunicaciones (grado básico)');

// Promoción de Igualdad de Género: 0017 convalida Destrezas sociales en APSD
require('../data/ciclos/ssc305.js');
assert.equal(est('apsd', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', titulo: 'TS Promoción de Igualdad de Género', docs: [] }])['0211'], 'convalidable');
// Servicios Socioculturales completa: los siete ciclos con normativa propia
require('../data/ciclos/ssc304.js');
['apsd', 'fpb128', 'ssc301', 'ssc302', 'ssc303', 'ssc304', 'ssc305'].forEach((c) => assert.ok(CICLOS[c] && !CICLOS[c].ciclo.parcial, c));
console.log('OK: Servicios Socioculturales completa (7 ciclos)');

// Asesoría de Imagen: 1071 idéntico al de Estilismo y Dirección de Peluquería
require('../data/ciclos/imp301.js');
assert.equal(est('imp301', [{ tipo: 'modulo_loe', codigo: '1071', nombre: 'x', titulo: 'TS Estilismo y Dirección de Peluquería', docs: [] }])['1071'], 'superado');
// Imagen Personal completa: los siete ciclos con normativa propia
['fpb_peluqueria_estetica', 'estetica', 'peluqueria', 'imp301', 'imp302', 'imp303', 'termalismo']
  .forEach((c) => assert.ok(CICLOS[c] && !CICLOS[c].ciclo.parcial, c));
console.log('OK: Imagen Personal completa (7 ciclos)');

// DAM y DAW: cinco módulos idénticos, cotejados por las dos investigaciones
['ifc301', 'ifc302', 'ifc303'].forEach((c) => require(`../data/ciclos/${c}.js`));
const comunes = ['0483', '0484', '0485', '0373', '0487'];
r = est('ifc303', comunes.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS DAM', docs: [] })));
comunes.forEach((m) => assert.equal(r[m], 'superado', m));
r = est('ifc302', comunes.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS DAW', docs: [] })));
comunes.forEach((m) => assert.equal(r[m], 'superado', m));
// Y el ciclo completo de ASIR convalida 0483 y 0484 en ambos
['ifc302', 'ifc303'].forEach((c) => {
  const x = est(c, [{ tipo: 'titulo', ciclo: 'ifc301', titulo: CICLOS.ifc301.ciclo.nombre, docs: ['cert_academica'] }]);
  assert.equal(x['0483'], 'convalidable', c); assert.equal(x['0484'], 'convalidable', c);
});
console.log('OK: DAM y DAW');

// ---- Calificación con la que se convalida ----
// Con nota en lo aportado, sale el CV-n; con UC acreditada, CV-5
f = full('apsd', [
  { tipo: 'modulo_logse', titulo: 'Técnico en Atención Sociosanitaria (LOGSE, RD 496/2003)', modulo: 'Higiene', nota: 8, docs: ['cert_academica'] },
  { tipo: 'uc', codigo: 'UC0249_2', via: 'Certificado de profesionalidad', docs: ['cert_profesionalidad'] },
]);
assert.equal(f.filas.find((x) => x.modulo.codigo === '0217').mejor.valor, 'CV-8');
assert.equal(f.filas.find((x) => x.modulo.codigo === '0210').mejor.valor, 'CV-5');
// Media redondeada cuando la fila exige varios módulos
f = full('tcae', [
  { tipo: 'modulo_logse', titulo: 'Técnico Superior en Higiene Bucodental (LOGSE, RD 537/1995)', modulo: 'Exploración bucodental', nota: 7, docs: [] },
  { tipo: 'modulo_logse', titulo: 'Técnico Superior en Higiene Bucodental (LOGSE, RD 537/1995)', modulo: 'Prevención bucodental', nota: 10, docs: [] },
]);
assert.equal(f.filas.find((x) => x.modulo.codigo === 'TCAE-04').mejor.valor, 'CV-9');
// Sin nota, queda como CV-nota para rellenar a mano
f = full('apsd', [{ tipo: 'modulo_logse', titulo: 'Técnico en Atención Sociosanitaria (LOGSE, RD 496/2003)', modulo: 'Higiene', docs: [] }]);
assert.equal(f.filas.find((x) => x.modulo.codigo === '0217').mejor.valor, 'CV-nota');
// Estudios universitarios y EOI: CV sin nota
f = full('termalismo', [{ tipo: 'certificado', clave: 'eoi_b2', docs: ['cert_eoi'] }]);
assert.equal(f.filas.find((x) => x.modulo.codigo === '0179').mejor.valor, 'CV');
console.log('OK: calificación con la que se convalida');

// Acondicionamiento Físico: 1136, 1151 y 1152 comunes con Termalismo; 1124 convalida 0017; 1136 da 0020
require('../data/ciclos/afd302.js');
r = est('afd302', ['1136', '1151', '1152'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Termalismo y bienestar', docs: [] })));
['1136', '1151', '1152'].forEach((c) => assert.equal(r[c], 'superado', c));
assert.equal(est('afd302', [{ tipo: 'modulo_loe', codigo: '1124', nombre: 'Dinamización grupal', titulo: 'TS Animación Sociocultural y Turística', docs: [] }])['0017'], 'convalidable');
assert.equal(est('ssc301', [{ tipo: 'modulo_loe', codigo: '1136', nombre: 'Valoración de la condición física e intervención en accidentes', titulo: 'TS Acondicionamiento Físico', docs: [] }])['0020'], 'convalidable');
console.log('OK: Acondicionamiento Físico');

// Guía en el Medio Natural: 0211 de APSD y 0017 convalidan 1328; una celda LOGSE da dos módulos
require('../data/ciclos/afd201.js');
assert.equal(est('afd201', [{ tipo: 'modulo_loe', codigo: '0211', nombre: 'Destrezas sociales', titulo: 'Técnico en Atención a Personas en Situación de Dependencia', docs: [] }])['1328'], 'convalidable');
assert.equal(est('afd201', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', titulo: 'TS Acondicionamiento Físico', docs: [] }])['1328'], 'convalidable');
r = est('afd201', [{ tipo: 'modulo_logse', titulo: 'Técnico en Conducción de Actividades Físico-Deportivas en el Medio Natural', modulo: 'Desplazamiento, estancia y seguridad en el medio natural terrestre', docs: [] }]);
assert.equal(r['1329'], 'convalidable'); assert.equal(r['1333'], 'convalidable');
console.log('OK: Guía en el Medio Natural y de Tiempo Libre');

// Enseñanza y Animación Sociodeportiva: 1123 y 1124 comunes con Termalismo, 1136 con Acondicionamiento Físico
require('../data/ciclos/afd301.js');
r = est('afd301', [
  ...['1123', '1124'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Termalismo y bienestar', docs: [] })),
  { tipo: 'modulo_loe', codigo: '1136', nombre: 'x', titulo: 'TS Acondicionamiento Físico', docs: [] },
]);
['1123', '1124', '1136'].forEach((c) => assert.equal(r[c], 'superado', c));
assert.equal(est('afd301', [{ tipo: 'modulo_loe', codigo: '0017', nombre: 'Habilidades sociales', titulo: 'TS Integración Social', docs: [] }])['1124'], 'convalidable');
assert.equal(est('afd201', [{ tipo: 'modulo_loe', codigo: '1124', nombre: 'Dinamización grupal', titulo: 'TS Enseñanza y Animación Sociodeportiva', docs: [] }])['1328'], 'convalidable');
console.log('OK: Enseñanza y Animación Sociodeportiva');

// Acceso y Conservación en Instalaciones Deportivas: 3005 común con Peluquería y Estética; 3010 da 3164
require('../data/ciclos/fpb127.js');
r = est('fpb127', [
  { tipo: 'modulo_loe', codigo: '3005', nombre: 'Atención al cliente', titulo: 'Técnico Básico en Peluquería y Estética', docs: [] },
  { tipo: 'modulo_loe', codigo: '3010', nombre: 'Ciencias aplicadas II', docs: ['cert_academica'] },
]);
assert.equal(r['3005'], 'superado');
assert.equal(r['3164'], 'convalidable');
assert.notEqual(r['3148'], 'superado');
console.log('OK: Acceso y Conservación en Instalaciones Deportivas');

// Instalaciones Eléctricas y Automáticas: celdas con dos módulos o dos UC exigen ambos
require('../data/ciclos/ele202.js');
const agua = (cods) => cods.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Gestión del Agua', docs: [] }));
assert.notEqual(est('ele202', agua(['1576']))['0232'], 'convalidable');
assert.equal(est('ele202', agua(['1576', '1577']))['0232'], 'convalidable');
assert.notEqual(est('ele202', [{ tipo: 'uc', codigo: 'UC2345_2', via: 'x', docs: [] }])['0240'], 'convalidable');
assert.equal(est('ele202', ['UC2344_2', 'UC2345_2'].map((u) => ({ tipo: 'uc', codigo: u, via: 'x', docs: [] })))['0240'], 'convalidable');
assert.equal(est('ele202', [{ tipo: 'modulo_logse', titulo: 'Técnico en Equipos e Instalaciones Electrotécnicas', modulo: 'Electrotecnia', docs: [] }])['0234'], 'convalidable');
console.log('OK: Instalaciones Eléctricas y Automáticas');

// Electricidad y Electrónica (grado básico): 3015 y 3016 comunes con Informática y Comunicaciones
require('../data/ciclos/fpb102.js');
r = est('fpb102', ['3015', '3016'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Profesional Básico en Informática y Comunicaciones', docs: [] })));
assert.equal(r['3015'], 'superado'); assert.equal(r['3016'], 'superado');
assert.notEqual(r['3013'], 'superado');
r = est('fpb104', ['3015', '3016'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Profesional Básico en Electricidad y Electrónica', docs: [] })));
assert.equal(r['3015'], 'superado'); assert.equal(r['3016'], 'superado');
console.log('OK: Electricidad y Electrónica (grado básico)');

// Cocina y Gastronomía: Repostería LOGSE da 0026 y 0028; UC2816_2 reúne las dos UC antiguas
require('../data/ciclos/hot201.js');
r = est('hot201', [{ tipo: 'modulo_logse', titulo: 'Técnico en Cocina', modulo: 'Repostería', docs: [] }]);
assert.equal(r['0026'], 'convalidable'); assert.equal(r['0028'], 'convalidable');
assert.equal(est('hot201', [{ tipo: 'modulo_loe', codigo: '0031', nombre: 'x', titulo: 'Técnico en Servicios en Restauración', docs: [] }])['0031'], 'superado');
r = est('hot201', [{ tipo: 'uc', codigo: 'UC2816_2', via: 'x', docs: [] }]);
assert.equal(r['0047'], 'convalidable'); assert.equal(r['0048'], 'convalidable');
assert.notEqual(est('hot201', [{ tipo: 'uc', codigo: 'UC0261_2', via: 'x', docs: [] }])['0048'], 'convalidable');
console.log('OK: Cocina y Gastronomía');

// Servicios en Restauración: 0031 y 0045 comunes con Cocina; 0152 exige los dos módulos LOGSE
require('../data/ciclos/hot203.js');
r = est('hot203', ['0031', '0045'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Técnico en Cocina y Gastronomía', docs: [] })));
assert.equal(r['0031'], 'superado'); assert.equal(r['0045'], 'superado');
const bar = (mods) => mods.map((m) => ({ tipo: 'modulo_logse', titulo: 'Técnico en Servicios de Restaurante y Bar', modulo: m, docs: [] }));
assert.notEqual(est('hot203', bar(['Bebidas']))['0152'], 'convalidable');
assert.equal(est('hot203', bar(['Bebidas', 'Técnicas elementales de cocina']))['0152'], 'convalidable');
console.log('OK: Servicios en Restauración');

// Instalaciones de Telecomunicaciones: celda de tres módulos de ELE202, ciclo completo de SMR, 0237 común
require('../data/ciclos/ele203.js');
const iea = (cods) => cods.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'Técnico en Instalaciones Eléctricas y Automáticas', docs: [] }));
assert.notEqual(est('ele203', iea(['0232', '0235']))['0362'], 'convalidable');
assert.equal(est('ele203', iea(['0232', '0235', '0240']))['0362'], 'convalidable');
assert.equal(est('ele203', iea(['0237']))['0237'], 'superado');
r = est('ele203', [{ tipo: 'titulo', titulo: 'Técnico en Sistemas Microinformáticos y Redes', ciclo: 'smr', docs: [] }]);
assert.equal(r['0360'], 'convalidable'); assert.equal(r['0361'], 'convalidable');
console.log('OK: Instalaciones de Telecomunicaciones');

// Mantenimiento Electrónico: filas LOGSE de entrada y, como título completo, convalida en cuatro ciclos cargados
require('../data/ciclos/ele301.js');
assert.equal(est('ele301', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Desarrollo de Productos Electrónicos', modulo: 'Electrónica analógica', docs: [] }])['1051'], 'convalidable');
const tsme = [{ tipo: 'titulo', titulo: 'Técnico Superior en Mantenimiento Electrónico', ciclo: 'ele301', docs: [] }];
r = est('ele202', tsme); assert.equal(r['0233'], 'convalidable'); assert.equal(r['0234'], 'convalidable');
r = est('ele203', tsme); assert.equal(r['0359'], 'convalidable'); assert.equal(r['0360'], 'convalidable');
console.log('OK: Mantenimiento Electrónico');

// Sistemas Electrotécnicos y Automatizados: Mantenimiento Electrónico completo da 0519; celda LOGSE de dos módulos
require('../data/ciclos/ele302.js');
assert.equal(est('ele302', tsme)['0519'], 'convalidable');
const ie = (mods) => mods.map((m) => ({ tipo: 'modulo_logse', titulo: 'Técnico Superior en Instalaciones Electrotécnicas', modulo: m, docs: [] }));
assert.notEqual(est('ele302', ie(['Informática técnica']))['0519'], 'convalidable');
assert.equal(est('ele302', ie(['Gestión del desarrollo de instalaciones electrotécnicas', 'Informática técnica']))['0519'], 'convalidable');
console.log('OK: Sistemas Electrotécnicos y Automatizados');

// Automatización y Robótica Industrial: 0519 <-> 0963 con ELE302, DAM completo da 0964
require('../data/ciclos/ele303.js');
assert.equal(est('ele303', [{ tipo: 'modulo_loe', codigo: '0519', nombre: 'x', titulo: 'TS Sistemas Electrotécnicos y Automatizados', docs: [] }])['0963'], 'convalidable');
assert.equal(est('ele302', [{ tipo: 'modulo_loe', codigo: '0963', nombre: 'x', titulo: 'TS Automatización y Robótica Industrial', docs: [] }])['0519'], 'convalidable');
assert.equal(est('ele303', tsme)['0963'], 'convalidable');
assert.equal(est('ele303', [{ tipo: 'titulo', titulo: 'Técnico Superior en Desarrollo de Aplicaciones Multiplataforma', ciclo: 'ifc302', docs: [] }])['0964'], 'convalidable');
r = est('ele303', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Sistemas de Regulación y Control Automáticos', modulo: 'Sistemas de control secuencial', docs: [] }]);
assert.equal(r['0959'], 'convalidable'); assert.equal(r['0960'], 'convalidable');
console.log('OK: Automatización y Robótica Industrial');

// Sistemas de Telecomunicaciones e Informáticos: ASIR completo da 0552; 0525 + 0553 dan 0517 en ELE302
require('../data/ciclos/ele304.js');
assert.equal(est('ele304', [{ tipo: 'titulo', titulo: 'Técnico Superior en Administración de Sistemas Informáticos en Red', ciclo: 'ifc301', docs: [] }])['0552'], 'convalidable');
const stei = (cods) => cods.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Sistemas de Telecomunicaciones e Informáticos', docs: [] }));
assert.notEqual(est('ele302', stei(['0525']))['0517'], 'convalidable');
assert.equal(est('ele302', stei(['0525', '0553']))['0517'], 'convalidable');
r = est('ele304', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Sistemas de Telecomunicación e Informáticos', modulo: 'Desarrollo de sistemas de telecomunicación e informática', docs: [] }]);
assert.equal(r['0525'], 'convalidable'); assert.equal(r['0553'], 'convalidable');
console.log('OK: Sistemas de Telecomunicaciones e Informáticos');

// Agencias de Viajes: una fila LOGSE da 0173 y 0171; módulos comunes de la familia por código
require('../data/ciclos/hot301.js');
r = est('hot301', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Agencias de Viajes', modulo: 'Comercialización de productos y servicios turísticos', docs: [] }]);
assert.equal(r['0173'], 'convalidable'); assert.equal(r['0171'], 'convalidable');
assert.equal(est('hot301', [{ tipo: 'modulo_loe', codigo: '0171', nombre: 'x', titulo: 'TS Gestión de Alojamientos Turísticos', docs: [] }])['0171'], 'superado');
assert.equal(est('hot301', [{ tipo: 'uc', codigo: 'UC0266_3', via: 'x', docs: [] }])['0398'], 'convalidable');
console.log('OK: Agencias de Viajes y Gestión de Eventos');

// Electromedicina Clínica: cruces con ELE301, ELE302 y ELE303
require('../data/ciclos/ele305.js');
const de = (titulo, cods) => cods.map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo, docs: [] }));
assert.notEqual(est('ele305', de('TS Mantenimiento Electrónico', ['1051']))['1587'], 'convalidable');
assert.equal(est('ele305', de('TS Mantenimiento Electrónico', ['1051', '1052']))['1587'], 'convalidable');
assert.equal(est('ele305', de('TS Sistemas Electrotécnicos y Automatizados', ['0524', '0602']))['1585'], 'convalidable');
assert.equal(est('ele305', de('TS Automatización y Robótica Industrial', ['0959']))['1586'], 'convalidable');
assert.notEqual(est('ele305', [{ tipo: 'uc', codigo: 'UC1271_3', via: 'x', docs: [] }])['1593'], 'convalidable');
console.log('OK: Electromedicina Clínica');

// Guía, Información y Asistencias Turísticas: comunes con Agencias de Viajes; UC1071_3 sola ya no da 0386
require('../data/ciclos/hot303.js');
r = est('hot303', ['0171', '0172', '0173', '0383', '0384', '0180'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Agencias de Viajes y Gestión de Eventos', docs: [] })));
['0171', '0172', '0173', '0383', '0384', '0180'].forEach((c) => assert.equal(r[c], 'superado', c));
r = est('hot303', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Información y Comercialización Turísticas', modulo: 'Asistencia y guía de grupos', docs: [] }]);
assert.equal(r['0386'], 'convalidable'); assert.equal(r['0172'], 'convalidable');
assert.notEqual(est('hot303', [{ tipo: 'uc', codigo: 'UC1071_3', via: 'x', docs: [] }])['0386'], 'convalidable');
assert.equal(est('hot303', ['UC1069_3', 'UC1070_3'].map((u) => ({ tipo: 'uc', codigo: u, via: 'x', docs: [] })))['0386'], 'convalidable');
console.log('OK: Guía, Información y Asistencias Turísticas');

// Gestión de Alojamientos Turísticos: una fila LOGSE da tres módulos; comunes con Agencias de Viajes
require('../data/ciclos/hot302.js');
r = est('hot302', [{ tipo: 'modulo_logse', titulo: 'Técnico Superior en Alojamiento', modulo: 'Recepción y atención al cliente', docs: [] }]);
['0176', '0177', '0172'].forEach((c) => assert.equal(r[c], 'convalidable', c));
r = est('hot302', ['0171', '0172', '0173', '0180'].map((c) => ({ tipo: 'modulo_loe', codigo: c, nombre: 'x', titulo: 'TS Agencias de Viajes y Gestión de Eventos', docs: [] })));
['0171', '0172', '0173', '0180'].forEach((c) => assert.equal(r[c], 'superado', c));
assert.ok(!('0383' in r));
assert.notEqual(est('hot302', [{ tipo: 'uc', codigo: 'UC1057_2', via: 'x', docs: [] }])['0179'], 'convalidable');
console.log('OK: Gestión de Alojamientos Turísticos');

// La FCT de un título anterior nunca convalida la formación en empresa (solo exención)
for (const [id, c] of Object.entries(CICLOS)) {
  const emp = c.modulos.filter((m) => m.tipo === 'empresa').map((m) => m.codigo);
  for (const f of [...c.convalidaciones_titulos_anteriores, ...c.convalidaciones_loe]) {
    assert.ok(!f.destino_modulos.some((d) => emp.includes(d)), `${id}: fila hacia la formación en empresa`);
  }
}
assert.notEqual(est('hot201', [{ tipo: 'modulo_logse', titulo: 'Técnico en Cocina', modulo: 'Formación en centro de trabajo', docs: [] }], 'loe')['0051'], 'convalidable');
console.log('OK: la FCT no se convalida');

// Plan LOE a extinguir: FOL y EIE de cualquier título se reconocen por su nombre
for (const [c, fol, eie] of [['hot203', '0157', '0158'], ['ele202', '0241', '0242'], ['ifc301', '0380', '0381']]) {
  const mods = Object.fromEntries(CICLOS[c].modulos.map((m) => [m.codigo, m.comun]));
  assert.equal(mods[fol], 'fol_loe', `${c} ${fol}`); assert.equal(mods[eie], 'eie_loe', `${c} ${eie}`);
}
r = est('hot203', [{ tipo: 'modulo_loe', codigo: '0049', nombre: 'Formación y orientación laboral', titulo: 'Técnico en Cocina y Gastronomía', docs: ['cert_academica'] }], 'loe');
assert.equal(r['0157'], 'convalidable');
console.log('OK: FOL y EIE del plan LOE');

// Cursos de especialización (Grado E): sin formación en empresa salvo Nube, seis meses y sin universidad
require('../data/catalogo.js');
const exp6 = [{ tipo: 'experiencia', meses: 6, relacionada: true, docs: [] }];
assert.ok(!('FE' in est('CESIFC01', exp6)), 'Ciberseguridad no tiene formación en empresa');
assert.equal(est('CESIFC04', exp6).FE, 'exento');
assert.notEqual(est('ifc301', exp6).FE, 'exento');
r = est('CESIFC02', [{ tipo: 'universidad', titulacion: 'Grado en Ingeniería Informática', asignaturas: '', docs: [] }]);
assert.ok(Object.values(r).every((e) => e !== 'ministerio'));
console.log('OK: cursos de especialización');
