#!/usr/bin/env python3
"""Genera data/ciclos/*.js a partir de research/*.json.

Uso: python3 tools/build_data.py
Los .js asignan window.CICLOS[id] para que la web funcione abriendo index.html
directamente (file://), sin servidor.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "ciclos"

# Clave de módulo común -> usada por las reglas generales (data/normativa.js)
COMUNES = {
    "0156": "ingles", "0179": "ingles", "1712": "ingles2",
    "1709": "ipe1", "1710": "ipe2",
    "1664": "digitalizacion", "1665": "digitalizacion",
    "1708": "sostenibilidad",
    "0020": "primeros_auxilios",
    "TCAE-06": "rel_equipo", "TCAE-07": "fol_logse",
    # Grado básico: ámbitos, IPE y módulos propios de Aragón
    "3161": "ambito_comunicacion", "3162": "ambito_comunicacion",
    "3163": "ambito_ciencias", "3164": "ambito_ciencias",
    "3159": "ipe_gb", "3160": "proyecto", "A123": "prl_aragon",
    # Plan LOE a extinguir: FOL, EIE y FCT siguen siendo módulos del ciclo
    "0218": "fol_loe", "0229": "fol_loe", "0644": "fol_loe", "1648": "fol_loe",
    "0851": "fol_loe", "0852": "eie_loe",
    "0219": "eie_loe", "0230": "eie_loe", "0645": "eie_loe", "1649": "eie_loe",
}

CODIGO_LOE = re.compile(r"^(\d{4})\.\s*(.+)$")


def horas_ambito(m, claves):
    for k in claves:
        v = (m.get("horas_otras") or {}).get(k)
        if isinstance(v, dict):
            return v.get("horas"), v.get("curso")
        if isinstance(v, (int, float)):
            return v, None
    return None, None


def modulos(d, cfg):
    """Un módulo entra en cada plan (ámbito) solo si ese plan le asigna horas."""
    out = []
    loe = cfg.get("loe")
    for m in d["modulos"]:
        cod = m["codigo"] or "OPT"
        if cod in cfg.get("excluir", []):
            continue
        hl, cl = loe(m) if loe else (None, None)
        if not m.get("vigente") and hl is None:
            continue  # módulo suprimido sin datos del plan LOE
        ha, ca = (cfg["aragon"](m) if m.get("vigente") else (None, None))
        hm, cm = (cfg["mefp"](m) if m.get("vigente") else (None, None))
        out.append({
            "codigo": cod,
            "nombre": m["nombre"],
            # Denominaciones propias de un plan (el RD 500/2024 renombró módulos)
            **({"nombres": cfg["nombres"][cod]} if cod in cfg.get("nombres", {}) else {}),
            "tipo": m["tipo"],
            "comun": COMUNES.get(cod, "tutoria" if cod.startswith("A99") else m["tipo"]),
            "horas": {"aragon": ha, "mefp": hm, "loe": hl},
            "curso": {"aragon": ca, "mefp": cm, "loe": cl},
            "nota": m.get("nota"),
        })
    return out


# Filas genéricas (FOL, EIE, inglés, EOI) que ya cubren las reglas de data/normativa.js
GENERICAS = ("Cualquier ciclo formativo", "Cualquier título LOE", "Escuela Oficial de Idiomas", "Certificado")


def split_convalidaciones(d, codigos_ciclo, plan):
    """Separa filas por módulo de título anterior (texto) y por módulo LOE con código."""
    anteriores, loe = [], []
    for f in d["convalidaciones_titulos_anteriores"]:
        destinos = [x for x in f["destino_modulos"] if x in codigos_ciclo]
        if not destinos:
            continue  # destino suprimido (FOL, EIE, FCT) o sentido inverso
        if plan != "LOGSE" and f["origen_titulo"].startswith(GENERICAS):
            continue  # las resuelven las reglas generales (con sus condiciones)
        mo = CODIGO_LOE.match(f["origen_modulo"])
        if mo:
            loe.append({"origen_codigos": [mo.group(1)], "origen_nombre": mo.group(2),
                        "origen_titulo": f["origen_titulo"], "destino_modulos": destinos,
                        "fuente": f["fuente"]})
        else:
            # Las tablas añaden coletillas del tipo "(hacen falta los dos)": no son parte del nombre
            limpio = re.sub(r"\s*\((?:se requieren|hacen falta|ambos|los dos|simult[áa]ne)[^)]*\)\s*$", "", f["origen_modulo"], flags=re.I)
            origen = [x.strip() for x in re.split(r"\s\+\s", limpio)]
            anteriores.append({"origen_titulo": f["origen_titulo"], "origen_modulo": origen,
                               "destino_modulos": destinos, "fuente": f["fuente"]})
    # Unifica filas LOE con el mismo módulo de origen y destino
    uni = {}
    for r in loe:
        k = (tuple(r["origen_codigos"]), tuple(r["destino_modulos"]))
        if k in uni:
            uni[k]["origen_titulo"] += "; " + r["origen_titulo"]
        else:
            uni[k] = r
    return anteriores, list(uni.values())


def build(id_, fichero, cfg):
    d = json.loads((ROOT / "research" / fichero).read_text())
    mods = modulos(d, cfg)
    cods = {m["codigo"] for m in mods}
    anteriores, loe = split_convalidaciones(d, cods, cfg.get("plan", "LOE"))

    uc_a_mod = []
    todas_uc = sorted({u for f in d["uc_a_modulos"] if f.get("vigente", True) for u in f["uc"] if u.startswith("UC")})
    for f in d["uc_a_modulos"]:
        if not f.get("vigente", True):
            continue
        ucs = todas_uc if f["uc"] == ["Todas las UC del título"] else f["uc"]
        uc_a_mod.append({"uc": ucs, "modulos": [m for m in f["modulos"] if m in cods], "fuente": f["fuente"],
                         **({"nota": "Requiere acreditar todas las UC del título"} if ucs is todas_uc else {})})

    ciclo = {
        "ciclo": {**{k: d["ciclo"][k] for k in ("codigo", "nombre", "grado", "familia", "normas")},
                  "plan": cfg.get("plan", "LOE")},
        "modulos": mods,
        "convalidaciones_titulos_anteriores": anteriores,
        "convalidaciones_loe": loe,
        "uc_a_modulos": uc_a_mod,
        "uc_descripciones": {k: v for k, v in d["uc_descripciones"].items()},
        "uc_equivalencias": cfg.get("equivalencias", {}),
        "notas": d.get("notas", []),
        "no_verificado": d.get("no_verificado", []) + cfg.get("no_verificado_extra", []),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    js = "// Generado por tools/build_data.py a partir de research/%s. No editar a mano.\n" % fichero
    js += "window.CICLOS = window.CICLOS || {};\n"
    js += "window.CICLOS[%s] = %s;\n" % (json.dumps(id_), json.dumps(ciclo, ensure_ascii=False, indent=1))
    (OUT / f"{id_}.js").write_text(js)
    print(f"{id_}: {len(mods)} módulos, {len(anteriores)} conv. títulos anteriores, {len(loe)} conv. LOE, {len(uc_a_mod)} filas UC")


def build_certificados():
    """data/certificados.js: catálogo de certificados con sus MF y UF."""
    d = json.loads((ROOT / "research" / "certificados.json").read_text())
    js = "// Generado por tools/build_data.py a partir de research/certificados.json. No editar a mano.\n"
    js += "window.CERTIFICADOS = %s;\n" % json.dumps(d, ensure_ascii=False, indent=1)
    (ROOT / "data" / "certificados.js").write_text(js)
    n_mf = sum(len(c["mf"]) for c in d["certificados"])
    n_uf = sum(len(m.get("uf", [])) for c in d["certificados"] for m in c["mf"])
    print(f"certificados: {len(d['certificados'])} certificados, {n_mf} MF, {n_uf} UF")


def _termalismo_aragon(m):
    h = (m.get("horas_otras") or {})
    return h.get("Aragon_Orden_ECD_843_2024_LO3_2022"), h.get("Aragon_curso_LO3_2022")


build("apsd", "apsd.json", {
    "loe": lambda m: horas_ambito(m, ["mec_ECD_340_2012"]),
    "aragon": lambda m: horas_ambito(m, ["aragon_ECD_842_2024"]) if m["codigo"] not in ("A997", "A996") else (m["horas"], m["curso"]),
    "mefp": lambda m: horas_ambito(m, ["mefp_EFD_657_2024"]),
    "excluir": ["A995"],  # Tutoría III: solo régimen nocturno
    # UC suprimidas -> vigentes (RD 532/2025 anexo II-a). UC0251_2 equivale a las dos.
    "equivalencias": {
        "UC0249_2": ["UC2259_2"], "UC0250_2": ["UC2260_2"], "UC0251_2": ["UC2261_2", "UC2262_2"],
        "UC1016_2": ["UC2259_2"], "UC1017_2": ["UC2261_2"], "UC1019_2": ["UC2260_2"],
    },
})

build("termalismo", "termalismo.json", {
    # RD 500/2024: "Proyecto" pasó a "Proyecto intermodular" y "Inglés" a "Inglés Profesional (GS)"
    "nombres": {
        "1647": {"loe": "Proyecto de Termalismo y bienestar"},
        "0179": {"loe": "Inglés"},
    },
    "loe": lambda m: ((m.get("horas_otras") or {}).get("Aragon_Orden_ECD_993_2021_LOE"), None),
    "aragon": _termalismo_aragon,
    "mefp": lambda m: (m.get("horas"), m.get("curso")),
    "equivalencias": {"UC1867_2": ["UC1867_3"], "UC1868_2": ["UC1868_3"]},
    "no_verificado_extra": [
        "Se tratan UC1867_2/UC1868_2 (como las muestra la herramienta de CATEDU) como equivalentes a UC1867_3/UC1868_3 del RD 500/2024: confirmar con la administración.",
    ],
})

build("smr", "smr.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    "equivalencias": {"UC0956_2": ["UC2688_2"], "UC0960_2": ["UC2688_2"]},
    "no_verificado_extra": [
        "La herramienta de CATEDU exige 0225 + 0227 para acreditar ECP2688_2, mientras que el Anexo V B del RD 1691/2007 solo pide 0227.",
    ],
})

build("estetica", "estetica.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 1024/2024 y RD 150/2022: UC suprimidas -> vigentes
    "equivalencias": {"UC0345_1": ["UC2583_1"], "UC0356_2": ["UC0354_2"], "UC0357_2": ["UC2826_2"], "UC0359_2": ["UC2826_2"]},
})

build("san202", "san202.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san203", "san203.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san303", "san303.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san302", "san302.json", {
    "plan": "LOGSE",
    "loe": lambda m: (None, None),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san301", "san301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san304", "san304.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san306", "san306.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("fpb_peluqueria_estetica", "fpb-peluqueria-estetica.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 150/2022: reescribe las cualificaciones IMP022_1 e IMP118_1
    "equivalencias": {"UC0345_1": ["UC2583_1"], "UC1224_1": ["UC1329_1"]},
})

build("peluqueria", "peluqueria.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 544/2023 (desdobla UC0351_2), RD 1024/2024 y RD 532/2025
    "equivalencias": {
        "UC0351_2": ["UC2685_2", "UC2686_2"],
        "UC0356_2": ["UC0354_2"], "UC0357_2": ["UC2826_2"], "UC0359_2": ["UC2826_2"],
    },
    "no_verificado_extra": [
        "La herramienta de CATEDU convalida 0845 con ECP2685_2 o ECP2686_2 por separado; el Anexo V A las pone en la misma celda, lo que exige acreditar las dos (art. 15.3).",
    ],
})

build("tcae", "tcae.json", {
    "plan": "LOGSE",
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build_certificados()


# Palabras clave para clasificar los módulos del catálogo (no traen tipo)
PATRONES = [
    (r"formaci[oó]n y orientaci[oó]n laboral", "comun", "fol_loe"),
    (r"empresa e iniciativa emprendedora", "comun", "eie_loe"),
    (r"formaci[oó]n en centros? de trabajo", "empresa", "empresa"),
    (r"formaci[oó]n en empresa", "empresa", "empresa"),
    (r"itinerario personal para la empleabilidad i\b|itinerario personal para la empleabilidad$", "comun", "ipe1"),
    (r"itinerario personal para la empleabilidad ii", "comun", "ipe2"),
    (r"digitalizaci[oó]n aplicada", "comun", "digitalizacion"),
    (r"sostenibilidad aplicada", "comun", "sostenibilidad"),
    (r"ingl[eé]s profesional ii", "comun", "ingles2"),
    (r"ingl[eé]s", "comun", "ingles"),
    (r"proyecto", "proyecto", "proyecto"),
    (r"tutor[ií]a", "comun", "tutoria"),
    (r"optativo", "optativo", "optativo"),
    (r"primeros auxilios", "especifico", "primeros_auxilios"),
]


def clasificar(codigo, nombre):
    """Devuelve (tipo, clave común) de un módulo del catálogo."""
    if codigo in COMUNES:
        clave = COMUNES[codigo]
        tipo = {"fol_loe": "comun", "eie_loe": "comun"}.get(clave, "comun")
        return tipo, clave
    n = nombre.lower()
    for patron, tipo, clave in PATRONES:
        if re.search(patron, n):
            return tipo, clave
    return "especifico", "especifico"


def build_catalogo(ya_cargados):
    """data/catalogo.js: los ciclos de Aragón sin reglas propias todavía.

    Llevan los módulos y sus horas, así que las reglas generales (módulo con el
    mismo código, FOL, EIE, inglés, exención...) ya funcionan con ellos.
    """
    d = json.loads((ROOT / "research" / "catalogo-aragon.json").read_text())
    familias = {f["codigo"]: f["nombre"] for f in d["familias"]}
    fuera = {c.upper() for c in ya_cargados}
    ciclos = {}
    for c in d["ciclos"]:
        if c["codigo"].upper() in fuera:
            continue
        mods = []
        for m in c["modulos"]:
            tipo, comun = clasificar(m["codigo"], m["nombre"])
            mods.append({
                "codigo": m["codigo"], "nombre": m["nombre"], "tipo": tipo, "comun": comun,
                "horas": {"aragon": m.get("horas"), "mefp": None, "loe": None},
                "curso": {"aragon": m.get("curso"), "mefp": None, "loe": None},
            })
        # Los módulos LOE llevan código numérico de cuatro cifras; si no, es un plan LOGSE
        plan = "LOE" if any(re.fullmatch(r"\d{4}", m["codigo"]) for m in mods) else "LOGSE"
        ciclos[c["codigo"]] = {
            "ciclo": {
                "codigo": c["codigo"], "nombre": c["nombre"], "grado": c["grado"],
                "familia": familias.get(c["familia"], c["familia"]), "plan": plan,
                "parcial": True,
                "normas": [{"ref": "Catálogo de CATEDU (Gobierno de Aragón)",
                            "url": "https://centrosdocentes.catedu.es/awc/",
                            "nota": "Módulos y horas del currículo de Aragón. Faltan las tablas de convalidación del título y las correspondencias con estándares de competencia."}],
            },
            "modulos": mods,
            "convalidaciones_titulos_anteriores": [], "convalidaciones_loe": [],
            "uc_a_modulos": [], "uc_descripciones": {}, "uc_equivalencias": {},
            "notas": [], "no_verificado": [
                "Ciclo del catálogo: solo se aplican las reglas generales. Faltan el anexo de convalidaciones del título y la correspondencia con unidades de competencia.",
                "Denominación y horas según la herramienta de CATEDU; conviene contrastarlas con el RD del título y con el currículo publicado en el BOA.",
            ],
        }
    js = "// Generado por tools/build_data.py a partir de research/catalogo-aragon.json. No editar a mano.\n"
    js += "window.CICLOS = window.CICLOS || {};\n"
    js += "Object.assign(window.CICLOS, %s);\n" % json.dumps(ciclos, ensure_ascii=False, separators=(",", ":"))
    (ROOT / "data" / "catalogo.js").write_text(js)
    print(f"catálogo: {len(ciclos)} ciclos pendientes de normativa, "
          f"{sum(len(c['modulos']) for c in ciclos.values())} módulos")


build_catalogo(["SSC201", "IMP304", "SAN201", "IFC201", "IMP202", "IMP203", "FPB108",
                "SAN202", "SAN203", "SAN301", "SAN302", "SAN303", "SAN304", "SAN306"])
