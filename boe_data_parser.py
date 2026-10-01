#!/usr/bin/env python3
"""
Parser para extraer datos de convalidaciones del BOE
Uso: python3 boe_data_parser.py <ruta_pdf>

Este script es un template para procesar PDFs del BOE una vez descargados.
Requiere: pip install pdfplumber
"""

import json
import sys
from typing import List, Dict, Any

# Template de funciones para procesar datos


def extract_convalidaciones_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """
    Extrae convalidaciones del Anexo II/III del RD 1085/2020

    Estructura esperada en PDF:
    - Denominación del título origen
    - Módulo origen (código)
    - Módulos destino (códigos)
    - Observaciones
    """
    try:
        import pdfplumber
    except ImportError:
        print("Error: Se requiere pdfplumber. Instala con: pip install pdfplumber")
        return {}

    convalidaciones = []

    try:
        with pdfplumber.open(pdf_path) as pdf:
            # Buscar páginas del Anexo II y III
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()

                if "ANEXO II" in text or "ANEXO III" in text:
                    # Extraer tablas de la página
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                if row and len(row) >= 3:
                                    convalidacion = {
                                        "origen_titulo": row[0] if row[0] else "",
                                        "origen_modulo": row[1] if len(row) > 1 and row[1] else "",
                                        "destino_modulos": row[2].split(",") if len(row) > 2 and row[2] else [],
                                        "observaciones": row[3] if len(row) > 3 and row[3] else "",
                                        "pagina": page_num + 1
                                    }
                                    if convalidacion["origen_titulo"]:
                                        convalidaciones.append(convalidacion)

    except Exception as e:
        print(f"Error al procesar PDF: {e}")

    return {
        "rd": "1085/2020",
        "total_convalidaciones": len(convalidaciones),
        "convalidaciones": convalidaciones
    }


def extract_equivalencias_uc_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """
    Extrae equivalencias UC -> ECP del Anexo II-a del RD 532/2025

    Estructura esperada:
    - UC antigua (ej: UC0099_2)
    - ECP equivalentes (ej: ECP2312_2, ECP2314_2, ECP2316_2)
    - Requisitos adicionales
    """
    try:
        import pdfplumber
    except ImportError:
        print("Error: Se requiere pdfplumber. Instala con: pip install pdfplumber")
        return {}

    equivalencias_uc = {}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages):
                text = page.extract_text()

                if "ANEXO II-a" in text or "Equivalencia" in text:
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                if row and len(row) >= 2:
                                    # Identificar UC antigua (patrón: UCxxxx_x)
                                    uc = row[0].strip() if row[0] else ""
                                    if uc.startswith("UC") and "_" in uc:
                                        ecps = row[1].split(",") if row[1] else []
                                        ecps = [ecp.strip() for ecp in ecps]

                                        equivalencias_uc[uc] = {
                                            "ecp_equivalentes": ecps,
                                            "requisitos": row[2] if len(row) > 2 else "",
                                            "pagina": page_num + 1
                                        }

    except Exception as e:
        print(f"Error al procesar PDF: {e}")

    return {
        "rd": "532/2025",
        "familia": "Energía y Agua",
        "total_equivalencias": len(equivalencias_uc),
        "equivalencias_uc": equivalencias_uc
    }


def procesar_y_guardar(pdf_path: str, tipo: str = "convalidaciones") -> None:
    """
    Procesa un PDF del BOE y guarda los resultados en JSON

    Args:
        pdf_path: Ruta al archivo PDF
        tipo: 'convalidaciones' o 'equivalencias'
    """
    if tipo == "convalidaciones":
        datos = extract_convalidaciones_from_pdf(pdf_path)
        output_file = "convalidaciones_extraidas.json"
    else:
        datos = extract_equivalencias_uc_from_pdf(pdf_path)
        output_file = "equivalencias_uc_extraidas.json"

    if datos and datos.get("total_convalidaciones", 0) > 0 or datos.get("total_equivalencias", 0) > 0:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(datos, f, ensure_ascii=False, indent=2)
        print(f"✓ Datos guardados en {output_file}")
        print(f"  Total de registros: {datos.get('total_convalidaciones', datos.get('total_equivalencias', 0))}")
    else:
        print("⚠ No se encontraron datos de convalidaciones/equivalencias en el PDF")


def filtrar_por_familia(datos: Dict[str, Any], familia: str = "ENA") -> Dict[str, Any]:
    """
    Filtra convalidaciones por familia profesional
    """
    if "convalidaciones" in datos:
        convalidaciones_filtradas = [
            c for c in datos["convalidaciones"]
            if familia.upper() in c.get("origen_titulo", "").upper()
        ]
        return {
            **datos,
            "convalidaciones": convalidaciones_filtradas,
            "total_filtradas": len(convalidaciones_filtradas)
        }
    return datos


def generar_reporte(datos: Dict[str, Any], archivo_salida: str = "reporte.json") -> None:
    """
    Genera un reporte estructurado de convalidaciones/equivalencias
    """
    reporte = {
        "rd": datos.get("rd"),
        "fecha_extraccion": "2025-10-01",  # Usar datetime.now() en producción
        "total_registros": datos.get("total_convalidaciones", datos.get("total_equivalencias", 0)),
        "datos": datos
    }

    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(reporte, f, ensure_ascii=False, indent=2)

    print(f"✓ Reporte generado: {archivo_salida}")


# Ejemplo de uso
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 boe_data_parser.py <ruta_pdf> [tipo]")
        print("  tipo: 'convalidaciones' (defecto) o 'equivalencias'")
        print("\nEjemplos:")
        print("  python3 boe_data_parser.py BOE-A-2020-17274.pdf convalidaciones")
        print("  python3 boe_data_parser.py BOE-A-2025-13147.pdf equivalencias")
        sys.exit(1)

    pdf_file = sys.argv[1]
    tipo = sys.argv[2] if len(sys.argv) > 2 else "convalidaciones"

    print(f"Procesando: {pdf_file} ({tipo})")
    procesar_y_guardar(pdf_file, tipo)
