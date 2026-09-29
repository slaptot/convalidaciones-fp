#!/usr/bin/env python3
"""Descarga de la herramienta de CATEDU la correspondencia módulo -> estándares de competencia.

Para cada módulo del catálogo pregunta qué competencias hacen falta para
convalidarlo (pestaña "Quiero convalidar Módulos"). El resultado alimenta las
filas uc_a_modulos de los ciclos que todavía no tienen su anexo leído del BOE.

Uso: python3 tools/fetch_competencias.py [--limite N]
Es reanudable: si el fichero de salida existe, solo pide los módulos que falten.
Las peticiones van espaciadas para no cargar el servicio.
"""
import argparse
import json
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SALIDA = ROOT / "research" / "competencias-catedu.json"
URL = "https://centrosdocentes.catedu.es/awc/public/competencias/api/tab4_convalidar_modulos.php"
PAUSA = 1.2


def pedir(modulo):
    """POST multipart a mano: la API no acepta application/x-www-form-urlencoded."""
    limite = "----convalidaciones"
    cuerpo = ""
    for campo, valor in (("accion", "calcular_competencias_necesarias"), ("modulo", modulo)):
        cuerpo += f'--{limite}\r\nContent-Disposition: form-data; name="{campo}"\r\n\r\n{valor}\r\n'
    cuerpo += f"--{limite}--\r\n"
    req = urllib.request.Request(
        URL, data=cuerpo.encode(),
        headers={"Content-Type": f"multipart/form-data; boundary={limite}",
                 "User-Agent": "Mozilla/5.0 (convalidaciones-fp; uso educativo)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def normalizar(respuesta):
    """Deja solo lo que necesita el motor: grupos de competencias por módulo."""
    datos = (respuesta or {}).get("data") or {}
    grupos = []
    for g in datos.get("grupos_competencias", []):
        comps = g.get("competencias", [])
        grupos.append({
            "uc": [c["codigo"] for c in comps],
            "conjunto": bool(g.get("es_conjunto")),
            "activas": [c["codigo"] for c in comps if c.get("activa")],
            "equivalencias": {c["codigo"]: c.get("info_suprimida", "") for c in comps if not c.get("activa")},
        })
    return {"nombre": (datos.get("modulo_seleccionado") or {}).get("nombre"), "grupos": grupos}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limite", type=int, default=0, help="máximo de módulos a pedir en esta pasada")
    args = ap.parse_args()

    catalogo = json.loads((ROOT / "research" / "catalogo-aragon.json").read_text())
    modulos = sorted({m["codigo"] for c in catalogo["ciclos"] for m in c["modulos"]})

    datos = json.loads(SALIDA.read_text()) if SALIDA.exists() else {"fuente": URL, "modulos": {}}
    pendientes = [m for m in modulos if m not in datos["modulos"]]
    if args.limite:
        pendientes = pendientes[: args.limite]
    print(f"{len(modulos)} módulos en el catálogo, {len(pendientes)} por pedir", flush=True)

    for i, mod in enumerate(pendientes, 1):
        try:
            datos["modulos"][mod] = normalizar(pedir(mod))
        except Exception as e:  # red o respuesta inesperada: se reintenta en otra pasada
            print(f"  error en {mod}: {e}", file=sys.stderr, flush=True)
            continue
        if i % 25 == 0 or i == len(pendientes):
            SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
            print(f"  {i}/{len(pendientes)} guardados", flush=True)
        time.sleep(PAUSA)

    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
    con = sum(1 for v in datos["modulos"].values() if v["grupos"])
    print(f"listo: {len(datos['modulos'])} módulos consultados, {con} con correspondencia")


if __name__ == "__main__":
    main()
