// Ejecuta las "pruebas" de una ficha de research/ contra el motor, sin tocar data/.
// Uso: node tools/probar_ficha.js <dir con el .js construido> <research/ficha.json>
const fs = require('fs');
const path = require('path');
const [dir, ficha] = process.argv.slice(2);
global.window = {};
require('../data/normativa.js');
require('../data/certificados.js');
for (const f of fs.readdirSync(dir)) require(path.resolve(dir, f));
require('../js/engine.js');
const { Motor, NORMATIVA, CICLOS } = window;
const d = JSON.parse(fs.readFileSync(ficha, 'utf8'));
const id = Object.keys(CICLOS)[0];
const c = CICLOS[id];
console.log(`${id}: ${c.modulos.length} módulos, ${c.convalidaciones_titulos_anteriores.length} filas de títulos anteriores, ${c.convalidaciones_loe.length} filas LOE, ${c.uc_a_modulos.length} filas UC`);
let fallos = 0;
for (const p of d.pruebas || []) {
  const res = Object.fromEntries(Motor.evaluar(c, NORMATIVA, p.aporta, p.plan || 'aragon').filas
    .map((f) => [f.modulo.codigo, f.mejor ? f.mejor.estado : (f.bloqueo ? 'bloqueado' : null)]));
  const mal = [];
  for (const [m, e] of Object.entries(p.espera || {})) if (res[m] !== e) mal.push(`${m}: esperaba ${e}, sale ${res[m]}`);
  for (const [m, e] of Object.entries(p.no_espera || {})) if (res[m] === e) mal.push(`${m}: no debía ser ${e}`);
  console.log(`${mal.length ? 'FALLA' : 'ok   '} ${p.descripcion}${mal.length ? ' -> ' + mal.join('; ') : ''}`);
  fallos += mal.length ? 1 : 0;
}
if (!(d.pruebas || []).length) { console.log('La ficha no trae "pruebas".'); process.exit(1); }
process.exit(fallos ? 1 : 0);
