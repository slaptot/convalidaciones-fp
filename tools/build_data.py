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


def comun_por_nombre(m):
    """FOL y EIE del plan LOE a extinguir tienen un código distinto en cada título:
    se reconocen por la denominación para que les alcancen las reglas generales."""
    nombre = m["nombre"].strip().lower()
    if re.fullmatch(r"\d{4}", m["codigo"] or ""):
        if nombre.startswith("formación y orientación laboral"):
            return "fol_loe"
        if nombre.startswith("empresa e iniciativa emprendedora"):
            return "eie_loe"
    return m["tipo"]


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
            "comun": COMUNES.get(cod, "tutoria" if cod.startswith("A99") else comun_por_nombre(m)),
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
    # La formación en empresa (FCT) nunca se convalida, solo admite exención
    # (RD 659/2023 art. 126.4.a; RD 1085/2020 art. 3.4). Los anexos IV originales
    # de los títulos traían una fila FCT -> FCT que el RD 1085/2020 no reproduce.
    empresa = {m["codigo"] for m in d["modulos"] if m.get("tipo") == "empresa"}
    for f in d["convalidaciones_titulos_anteriores"]:
        destinos = [x for x in f["destino_modulos"] if x in codigos_ciclo and x not in empresa]
        if not destinos:
            continue  # destino suprimido (FOL, EIE, FCT) o sentido inverso
        if plan != "LOGSE" and f["origen_titulo"].startswith(GENERICAS):
            continue  # las resuelven las reglas generales (con sus condiciones)
        # Una celda con varios módulos LOE ("1576. X + 1577. Y") exige aportarlos todos
        partes = [CODIGO_LOE.match(x.strip()) for x in re.split(r"\s\+\s(?=\d{4}\.)", f["origen_modulo"])]
        if all(partes):
            loe.append({"origen_codigos": [p.group(1) for p in partes],
                        "origen_nombre": " + ".join(p.group(2) for p in partes),
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

build("san308", "san308.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san305", "san305.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("san309", "san309.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("imp302", "imp302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 532/2025: UC0067_3 se desdobla en dos estándares de micropigmentación
    "equivalencias": {"UC0067_3": ["UC2670_3", "UC2671_3"]},
})

build("ssc303", "ssc303.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ssc302", "ssc302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ssc304", "ssc304.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ssc301", "ssc301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("imp303", "imp303.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 544/2023: UC0351_2 se desdobla y el módulo 1069 exige las dos
    "equivalencias": {"UC0351_2": ["UC2685_2", "UC2686_2"]},
    "no_verificado_extra": [
        "La herramienta de CATEDU acepta ECP2685_2 o ECP2686_2 por separado para el módulo 1069; el anexo del título las pone en la misma celda, lo que exige acreditar las dos.",
    ],
})

build("fpb128", "fpb128.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("fpb121", "fpb121.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("fpb104", "fpb104.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("afd302", "afd302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("afd201", "afd201.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("afd301", "afd301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("fpb127", "fpb127.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele202", "ele202.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 532/2025: las UC de la redacción de 2008 pasan a las vigentes del anexo V A
    "equivalencias": {"UC0820_2": ["UC2341_2"], "UC0821_2": ["UC2341_2"], "UC0822_2": ["UC2343_2"],
                      "UC0823_2": ["UC2340_2"], "UC0824_2": ["UC2340_2"], "UC0825_2": ["UC2345_2"]},
    "no_verificado_extra": [
        "La herramienta de CATEDU convalida 0240 solo con ECP2345_2; el anexo V A vigente (RD 499/2024) exige UC2344_2 y UC2345_2 juntas.",
    ],
})

build("fpb102", "fpb102.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    "no_verificado_extra": [
        "3013 aportado desde Instalaciones Electrotécnicas y Mecánica (FPB126): mismos resultados de aprendizaje, pero 180 h en el RD 127/2014 frente a 175 h en el RD 774/2015. El art. 3.2 del RD 1085/2020 exige igual duración; el anexo VIII ap. 3 del Decreto 91/2024 no. Revisar antes de trasladar la nota.",
    ],
})

build("hot201", "hot201.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 1023/2024 y RD 532/2025: UC2816_2 reúne UC0261_2 y UC0262_2, así que acredita las dos
    "equivalencias": {"UC2816_2": ["UC0261_2", "UC0262_2"]},
    "no_verificado_extra": [
        "UC0261_2 y UC0262_2 se funden en UC2816_2 (RD 1023/2024 y RD 532/2025), que solo se obtiene con las dos: no se traducen por separado. La herramienta de CATEDU da ECP2816_2 con solo 0047 o solo 0048, lo que no cuadra con el anexo V B.",
    ],
})

build("hot203", "hot203.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele203", "ele203.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele301", "ele301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele302", "ele302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele303", "ele303.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ele304", "ele304.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("hot301", "hot301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 532/2025 y redacción del anexo V A del RD 500/2024: UC antiguas -> vigentes
    "equivalencias": {"UC0266_3": ["UC2567_3"], "UC0267_2": ["UC2567_3"], "UC1069_3": ["UC2579_3"],
                      "UC1070_3": ["UC2580_3"], "UC1072_3": ["UC9999_3"], "UC1073_3": ["UC9997_3"]},
})

build("ele305", "ele305.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    "no_verificado_extra": [
        "Fila de Automatización y Robótica Industrial hacia 1586: el RD 838/2015 escribe el código 0559 y el RD 1085/2020, 0959. Se aplica 0959 (Sistemas eléctricos, neumáticos e hidráulicos), que es un módulo de ese título.",
    ],
})

build("hot303", "hot303.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    # RD 532/2025 y anexo V A del RD 500/2024: UC antiguas -> vigentes
    "equivalencias": {"UC1069_3": ["UC2579_3"], "UC1070_3": ["UC2580_3"],
                      "UC1072_3": ["UC9999_3"], "UC1073_3": ["UC9997_3"]},
    "no_verificado_extra": [
        "UC1071_3 convalidaba 0386 por sí sola en el anexo V A de 2009. El RD 532/2025 solo la equipara a las competencias vigentes junto con UC1069_3 o UC1070_3, así que no se traduce: 0386 exige hoy UC2579_3 y UC2580_3.",
    ],
})

build("hot302", "hot302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
    "no_verificado_extra": [
        "UC1057_2 (inglés, nivel 2) convalidaba 0179 en el anexo V A de 2007. La redacción vigente pide UC9999_3, y el RD 532/2025 equipara UC1057_2 a ECP9998_2, de nivel 2, así que no se traduce.",
    ],
})

build("ssc305", "ssc305.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ifc301", "ifc301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("imp301", "imp301.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ifc302", "ifc302.json", {
    "loe": lambda m: horas_ambito(m, ["loe"]),
    "aragon": lambda m: horas_ambito(m, ["aragon"]),
    "mefp": lambda m: horas_ambito(m, ["mefp"]),
})

build("ifc303", "ifc303.json", {
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


# Cursos de especialización sin periodo de formación en empresa, comprobado en su real decreto
# (research/cursos-especializacion-ifc.md). De Informática solo lo tiene CESIFC04 (RD 145/2026).
SIN_FORMACION_EMPRESA = {"CESIFC01", "CESIFC02", "CESIFC03", "CESIFC05"}


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
                **({"curso_especializacion": True} if c.get("nivel_catedu") in ("CEM", "CES") else {}),
                **({"sin_formacion_empresa": True} if c["codigo"] in SIN_FORMACION_EMPRESA else {}),
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


build_catalogo(["SSC201", "IMP304", "SAN201", "IFC201", "IMP202", "IMP203", "FPB108", "FPB128",
                "SAN202", "SAN203", "SAN301", "SAN302", "SAN303", "SAN304", "SAN305", "SAN306", "SAN308", "SAN309", "IFC301", "IFC302", "IFC303", "IMP301", "IMP302", "IMP303", "SSC301", "SSC302", "SSC303", "SSC304", "SSC305", "FPB121", "FPB104", "AFD302", "AFD201", "AFD301", "FPB127", "ELE202", "FPB102", "HOT201", "HOT203", "ELE203", "ELE301", "ELE302", "ELE303", "ELE304", "HOT301", "ELE305", "HOT303", "HOT302"])
