#!/usr/bin/env python3
"""Generador de fichas FPB107-FPB112 basado en data investigada."""
import json
import sys
from pathlib import Path

# Mapeo de ciclos identificados
CICLOS = {
    "FPB107": {
        "nombre": "Técnico Básico en Agrojardinería y Composiciones Florales",
        "familia": "Agraria",
        "rd_principal": "RD 774/2015, de 28 de agosto",
        "boe_principal": "BOE-A-2015-9462",
        "anexo": "III"
    },
    "FPB109": {
        "nombre": "Técnico Básico en Servicios Comerciales",
        "familia": "Comercio y Marketing",
        "rd_principal": "RD 127/2014, de 28 de febrero",
        "boe_principal": "BOE-A-2014-2360",
        "anexo": "IX"
    },
    "FPB110": {
        "nombre": "Técnico Básico en Carpintería y Mueble",
        "familia": "Madera, Mueble y Corcho",
        "rd_principal": "RD 127/2014, de 28 de febrero",
        "boe_principal": "BOE-A-2014-2360",
        "anexo": "X"
    },
    "FPB111": {
        "nombre": "Técnico Básico en Reforma y Mantenimiento de Edificios",
        "familia": "Edificación y Obra Civil",
        "rd_principal": "RD 356/2014, de 16 de mayo",
        "boe_principal": "BOE-A-2014-5591",
        "anexo": "V"
    },
    "FPB112": {
        "nombre": "Técnico Básico en Arreglo y Reparación de Artículos Textiles y de Piel",
        "familia": "Textil, Confección y Piel",
        "rd_principal": "RD 127/2014, de 28 de febrero",
        "boe_principal": "BOE-A-2014-2360",
        "anexo": "XII"
    },
}

def crear_ficha_basica(codigo, datos):
    """Crea estructura básica de ficha JSON para un FPB."""
    return {
        "ciclo": {
            "codigo": codigo,
            "nombre": datos["nombre"],
            "grado": "basico",
            "familia": datos["familia"],
            "duracion_total_horas": 2000,
            "normas": [
                {
                    "ref": datos["rd_principal"],
                    "boe": datos["boe_principal"],
                    "url": f"https://www.boe.es/buscar/doc.php?id={datos['boe_principal']}",
                    "nota": f"Título de Grado Básico. Anexo {datos['anexo']}."
                },
                {
                    "ref": "RD 498/2024, de 21 de mayo",
                    "boe": "BOE-A-2024-10683",
                    "url": "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10683",
                    "nota": "Adaptación a la LO 3/2022. Suprime FCT, añade ámbitos, proyecto e IPE."
                },
                {
                    "ref": "RD 659/2023, de 18 de julio",
                    "boe": "BOE-A-2023-16889",
                    "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2023-16889",
                    "nota": "Ordenación del Sistema de FP."
                },
                {
                    "ref": "RD 1085/2020, de 9 de diciembre",
                    "boe": "BOE-A-2020-17274",
                    "url": "https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274",
                    "nota": "Convalidaciones de módulos."
                },
                {
                    "ref": "RD 532/2025, de 24 de junio",
                    "boe": "BOE-A-2025-13147",
                    "url": "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-13147",
                    "nota": "UC → ECP (estándares de competencia)."
                },
                {
                    "ref": "Orden ECD/841/2024, de 25 de julio (Aragón)",
                    "boe": None,
                    "url": "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VERDOC&BASE=BOLE&SEC=BUSQUEDA_AVANZADA&SEPARADOR=&DOCN=007942791",
                    "nota": "Currículo vigente de Aragón para 23 ciclos de Grado Básico."
                },
                {
                    "ref": "Decreto 91/2024, de 5 de junio, del Gobierno de Aragón",
                    "boe": None,
                    "url": "https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1336515330404",
                    "nota": "Estructura básica de currículos y evaluación en Aragón."
                }
            ]
        },
        "modulos": [],
        "convalidaciones_titulos_anteriores": [],
        "uc_a_modulos": [],
        "modulos_a_uc": [],
        "equivalencias_uc": {},
        "uc_descripciones": {},
        "cualificaciones": [],
        "notas": [
            "INVESTIGACIÓN PENDIENTE: fichas parcialmente compiladas; faltan módulos específicos, UC y convalidaciones del BOE."
        ],
        "no_verificado": [
            "Investigación en progress. Necesario verificar módulos en los anexos de los RD principales.",
            "Convalidaciones con títulos anteriores: investigar RD 1085/2020."
        ],
        "filas_derogadas_no_aplicadas": {"motivo": "", "filas": []},
        "equivalencias_motor": {},
        "equivalencias_conjuntas_motor": [],
        "pruebas": []
    }

if __name__ == "__main__":
    # Crear fichas básicas
    for cod, datos in CICLOS.items():
        ficha = crear_ficha_basica(cod, datos)

        # Guardar en research/
        output_path = Path(f"/Users/albertomunozfuertes/Proyectos/convalidaciones-fp/research/{cod.lower()}.json")
        with open(output_path, 'w') as f:
            json.dump(ficha, f, indent=2, ensure_ascii=False)
        print(f"Generado: {output_path}")
