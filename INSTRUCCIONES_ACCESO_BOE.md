# Instrucciones para Acceder a los Anexos del BOE

## Resumen de Hallazgos

Se han identificado dos Reales Decretos clave en el BOE para tu proyecto:

### 1. RD 1085/2020 (BOE-A-2020-17274)
- **Objeto:** Convalidaciones de módulos profesionales
- **Anexo II:** Convalidaciones LOE ← LOGSE
- **Anexo III:** Convalidaciones LOE ← LOE
- **Estado:** Datos parciales extraídos; tablas completas requieren acceso directo

### 2. RD 532/2025 (BOE-A-2025-13147)
- **Objeto:** Equivalencias UC antiguas → ECP nuevos
- **Anexo II-a:** Equivalencias de UC suprimidas → ECP vigentes
- **Familia:** Energía y Agua (parcialmente extraído)
- **Estado:** Equivalencias de UC0099_2, UC0100_2, UC0101_2 documentadas

---

## Acceso Directo a Documentos

### Opción 1: Acceso vía BOE.es (Recomendado)

#### RD 1085/2020
```
https://www.boe.es/buscar/doc.php?id=BOE-A-2020-17274
```

**Pasos:**
1. Acceder al enlace anterior
2. En la página, buscar sección "PDF" o "Otros formatos"
3. Descargar "PDF CONSOLIDADO" para tener el documento actualizado
4. Navegar a "Anexo II" y "Anexo III"
5. Las tablas contienen:
   - Título LOGSE/LOE de origen
   - Módulo de origen (código)
   - Módulos de destino (códigos)
   - Notas sobre convalidabilidad

#### RD 532/2025
```
https://www.boe.es/buscar/doc.php?id=BOE-A-2025-13147
```

**Pasos similares:**
1. Acceder al enlace
2. Buscar "PDF" o descargar versión completa
3. Navegar a "Anexo II-a"
4. Tabla de equivalencias UC (antiguas) → ECP (nuevas)

### Opción 2: PDFs Directos

**RD 1085/2020:**
- Consolidado: https://www.boe.es/buscar/pdf/2020/BOE-A-2020-17274-consolidado.pdf
- Original: https://www.boe.es/boe/dias/2020/12/30/pdfs/BOE-A-2020-17274.pdf

**RD 532/2025:**
- Página oficial: https://www.boe.es/buscar/doc.php?id=BOE-A-2025-13147
- Con correcciones: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-23619

---

## Estructura de Datos Esperada

### Para RD 1085/2020 (Convalidaciones)

Cada entrada en los Anexos II/III típicamente contiene:
- **Denominación del título origen** (ej: "Técnico en Química Analítica" LOGSE)
- **Módulo origen** (ej: código numérico)
- **Ciclo/Título destino** (ej: "Técnico en Laboratorio de análisis y de control de calidad")
- **Módulos destino** (ej: códigos de módulos actuales)
- **Observaciones** (si la convalidación tiene limitaciones)

### Para RD 532/2025 (Equivalencias UC)

Cada entrada típicamente contiene:
- **UC antigua** (ej: UC0099_2)
- **ECP nuevo equivalente** (ej: ECP2312_2, ECP2314_2, ECP2316_2)
- **Requisitos adicionales** (si requiere acreditación conjunta de varios ECP)
- **Notas** (ej: "Requiere complementación con...")

---

## Fuentes Complementarias

### INCUAL (Instituto Nacional de las Cualificaciones)
- **URL:** https://incual.educacion.gob.es/
- **Base de datos:** CNECP (Catálogo Nacional de Estándares de Competencias Profesionales)
- **Familia ENA:** https://incual.educacion.gob.es/energia-y-agua
- **Utilidad:** Verificar ECP vigentes y sus requisitos

### Educación de Aragón
- **Convalidaciones:** https://educa.aragon.es/-/formacion-profesional/informacion-general/convalidaciones/centro/anexos
- **Currículos ENA:** https://educa.aragon.es/-/formacion-profesional/curriculos/ena
- **Utilidad:** Referencias a anexos y ejemplos de aplicación por comunidad

### TodoFP
- **Convalidaciones:** https://www.todofp.es/convalidaciones-equivalencias-homologaciones/convalidaciones/normativa-de-apoyo.html
- **Utilidad:** Base de datos compilada de convalidaciones

---

## Especificaciones Técnicas

### Ciclos ENA Identificados

**Grado Medio:**
- ENA201: Técnico en Redes y Estaciones de Tratamiento de Aguas (2,182 h)

**Grado Superior:**
- ENA301: Técnico Superior en Eficiencia Energética y Energía Solar Térmica
- ENA302: Técnico Superior en Energías Renovables

### Equivalencias Parciales Extraídas

| UC Antigua | ECP Nuevos | Requisito |
|-----------|-----------|-----------|
| UC0099_2 | ECP2312_2, ECP2314_2, ECP2316_2 | Conjunta |
| UC0100_2 | ECP2312_2, ECP2314_2, ECP2315_2 | Conjunta |
| UC0101_2 | ECP2312_2, ECP2313_2, ECP2314_2 | Conjunta |

---

## Limitaciones Encontradas

1. **Acceso a PDFs:** Los navegadores automatizados tienen restricciones para acceder a PDFs del BOE
2. **Tablas complejas:** Los anexos contienen tablas extensas que requieren procesamiento manual o OCR
3. **Datos dinámicos:** Algunas versiones del BOE cargan contenido con JavaScript
4. **Actualizaciones:** Los datos pueden ser actualizados o corregidos (ej: BOE-A-2025-23619 corrige RD 532/2025)

---

## Próximos Pasos Recomendados

### Para datos completos:
1. Descargar PDFs directamente desde los enlace del BOE
2. Usar herramientas de extracción de datos (pdfrw, PyPDF2, etc.) para procesar tablas
3. Validar datos con INCUAL y comunidades autónomas
4. Implementar en tu aplicación web

### Para tu proyecto convalidaciones-fp:
1. Crear parsers para los anexos en formato PDF
2. Almacenar equivalencias en base de datos estructurada
3. Implementar búsqueda de convalidaciones por:
   - Título origen LOGSE/LOE
   - Código de módulo origen
   - Ciclo/Título destino
4. Integrar datos de INCUAL para verificación de ECP

---

## Datos ya Generados

Se han creado los siguientes archivos en el proyecto:
- `convalidaciones_rd1085_2020.json` - Estructura parcial RD 1085/2020
- `equivalencias_uc_rd532_2025.json` - Equivalencias UC parciales RD 532/2025
- `BOE_EXTRACTION_SUMMARY.md` - Este resumen completo

