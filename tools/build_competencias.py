#!/usr/bin/env python3
"""Añade a los ciclos del catálogo sus filas de convalidación por competencias.

Parte de research/competencias-catedu.json (lo que devuelve la herramienta de
CATEDU para cada módulo: qué estándares de competencia hacen falta para
convalidarlo) y genera data/competencias.js, que completa los ciclos ya
cargados en data/catalogo.js.

La fuente es la herramienta de Aragón, no el BOE: ya hemos visto dos casos en
los que no coinciden, así que cada fila lo deja dicho.

Uso: python3 tools/build_competencias.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FUENTE = "Herramienta de competencias de CATEDU (Gobierno de Aragón); sin contrastar con el anexo V del RD del título"


def main():
    catalogo = json.loads((ROOT / "research" / "catalogo-aragon.json").read_text())
    comp = json.loads((ROOT / "research" / "competencias-catedu.json").read_text())["modulos"]
    cargados = {c.split(".")[0] for c in []}  # se filtran abajo por lo que ya existe en data/ciclos

    # Ciclos que tienen fichero propio: sus reglas vienen del BOE y no se tocan
    propios = set()
    for f in (ROOT / "research").glob("*.json"):
        if f.name in ("catalogo-aragon.json", "competencias-catedu.json", "certificados.json"):
            continue
        try:
            d = json.loads(f.read_text())
            propios.add(d["ciclo"]["codigo"].split()[0].upper())
        except Exception:
            pass

    salida, equivalencias_globales = {}, {}
    for c in catalogo["ciclos"]:
        if c["codigo"].upper() in propios:
            continue
        filas, vistas = [], set()
        for m in c["modulos"]:
            datos = comp.get(m["codigo"])
            if not datos:
                continue
            for g in datos["grupos"]:
                # Solo los códigos vigentes: los suprimidos entran por uc_equivalencias
                ucs = g["activas"] or g["uc"]
                clave = (tuple(sorted(ucs)), m["codigo"])
                if not ucs or clave in vistas:
                    continue
                vistas.add(clave)
                filas.append({
                    "uc": sorted(ucs), "modulos": [m["codigo"]], "fuente": FUENTE,
                    **({"nota": "Hacen falta todas las competencias del grupo"} if g["conjunto"] else {}),
                })
                # "(Esta Competencia equivale a la actual ECPxxxx_N según RD 532/2025)"
                for viejo, texto in g["equivalencias"].items():
                    nuevo = re.search(r"ECP\d+_\d+", texto or "")
                    if nuevo:
                        equivalencias_globales.setdefault(c["codigo"], {})[viejo] = [nuevo.group(0)]
        if filas:
            salida[c["codigo"]] = {"uc_a_modulos": filas,
                                   "uc_equivalencias": equivalencias_globales.get(c["codigo"], {})}

    js = "// Generado por tools/build_competencias.py a partir de research/competencias-catedu.json. No editar a mano.\n"
    js += "// Completa los ciclos del catálogo con sus correspondencias módulo <-> competencia.\n"
    js += "(function () {\n  const extra = %s;\n" % json.dumps(salida, ensure_ascii=False, separators=(",", ":"))
    js += """  for (const [codigo, datos] of Object.entries(extra)) {
    const c = window.CICLOS[codigo];
    if (!c) continue;
    c.uc_a_modulos = datos.uc_a_modulos;
    c.uc_equivalencias = { ...(c.uc_equivalencias || {}), ...datos.uc_equivalencias };
    c.ciclo.competencias_catedu = true;
  }
})();
"""
    (ROOT / "data" / "competencias.js").write_text(js)
    total = sum(len(v["uc_a_modulos"]) for v in salida.values())
    print(f"competencias: {len(salida)} ciclos del catálogo con correspondencias, {total} filas")


if __name__ == "__main__":
    main()
