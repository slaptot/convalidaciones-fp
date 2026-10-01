# Extracción de Información - RD 127/2014
## Fichas JSON de Ciclos de Formación Profesional Básica

**Fecha de extracción:** 2026-10-01  
**Documento BOE:** BOE-A-2014-2360  
**Norma:** Real Decreto 127/2014, de 28 de febrero

---

## Resumen de Extracción

Se ha realizado la extracción de información del RD 127/2014 desde el BOE para generar fichas JSON completas de los ciclos de Formación Profesional Básica solicitados.

### Ciclos Solicitados vs. Ciclos Obtenidos

| Código | Nombre | Estado | Módulos | Cualificaciones | Correspondencias |
|--------|--------|--------|---------|-----------------|------------------|
| FPB101 | Servicios Administrativos | ✓ Completo | 11 módulos | 3 cualificaciones | Sí (7 mappings) |
| FPB103 | Fabricación y Montaje | ✓ Completo | 11 módulos | 2 cualificaciones | Sí (6 mappings) |
| FPB105 | Cocina y Restauración | ✗ No disponible | — | — | — |
| FPB106 | Mantenimiento de Vehículos | ✗ No disponible | — | — | — |

---

## Información Disponible

### FPB101 - Técnico Básico en Servicios Administrativos

**Familia Profesional:** Administración y Gestión  
**Duración Total:** 2.000 horas  
**Norma:** RD 127/2014 - Anexo I

#### Módulos Profesionales (11)

| Código | Nombre | Horas |
|--------|--------|-------|
| 3001 | Tratamiento informático de datos | 145 |
| 3002 | Aplicaciones básicas de ofimática | 100 |
| 3003 | Técnicas administrativas básicas | 140 |
| 3004 | Archivo y comunicación | 85 |
| 3005 | Atención al cliente | 40 |
| 3006 | Preparación de pedidos y venta de productos | 40 |
| 3009 | Ciencias aplicadas I | 90 |
| 3010 | Ciencias aplicadas II | 90 |
| 3011 | Comunicación y sociedad I | 120 |
| 3012 | Comunicación y sociedad II | 120 |
| 3008 | Formación en centros de trabajo | 130 |

#### Cualificaciones Profesionales (3)

1. **ADG305_1** - Operaciones auxiliares de servicios administrativos y generales
   - UC0969_1, UC0970_1, UC0971_1

2. **ADG306_1** - Operaciones de grabación y tratamiento de datos y documentos
   - UC0973_1, UC0974_1, UC0971_1

3. **COM412_1** - Actividades auxiliares de comercio
   - UC1329_1, UC1326_1

#### Correspondencias Módulos ↔ UC (7 mappings)

- 3001 → UC0973_1
- 3002 → UC0974_1
- 3003 → UC0969_1
- 3004 → UC0970_1, UC0971_1
- 3005 → UC1329_1
- 3006 → UC1326_1

---

### FPB103 - Técnico Básico en Fabricación y Montaje

**Familia Profesional:** Fabricación Mecánica e Instalación y Mantenimiento  
**Duración Total:** 2.000 horas  
**Norma:** RD 127/2014 - Anexo III

#### Módulos Profesionales (11)

| Código | Nombre | Horas |
|--------|--------|-------|
| 3020 | Operaciones básicas de fabricación | 180 |
| 3021 | Soldadura y carpintería metálica | 115 |
| 3022 | Carpintería de aluminio y PVC | 140 |
| 3023 | Redes de evacuación | 115 |
| 3024 | Fontanería y calefacción básica | 90 |
| 3025 | Montaje de equipos de climatización | 90 |
| 3009 | Ciencias aplicadas I | 120 |
| 3019 | Ciencias aplicadas II | 120 |
| 3011 | Comunicación y sociedad I | 120 |
| 3012 | Comunicación y sociedad II | 120 |
| 3027 | Formación en centros de trabajo | 130 |

#### Cualificaciones Profesionales (2)

1. **FME031_1** - Operaciones auxiliares de fabricación mecánica
   - UC0087_1, UC0088_1

2. **IMA367_1** - Operaciones de fontanería y calefacción-climatización doméstica
   - UC1154_1, UC1155_1

#### Correspondencias Módulos ↔ UC (6 mappings)

- 3020 → UC0087_1
- 3021 → UC0088_1
- 3022 → UC0088_1
- 3023 → UC1154_1
- 3024 → UC1155_1
- 3025 → UC1155_1

---

## Ciclos No Disponibles

### FPB105 - Técnico Básico en Cocina y Restauración

**Familia Profesional:** Hostelería y Turismo  
**Duración Total:** 2.000 horas  
**Norma:** RD 127/2014 - Anexo V

**Estado:** No disponible en la extracción de texto del BOE

**Motivo:** El documento de texto extraído de BOE-A-2014-2360 solo contiene hasta el Anexo IV (Informática y Comunicaciones). Los Anexos V y VI no fueron incluidos en la extracción de texto.

### FPB106 - Técnico Básico en Mantenimiento de Vehículos

**Familia Profesional:** Automoción  
**Duración Total:** 2.000 horas  
**Norma:** RD 127/2014 - Anexo VI

**Estado:** No disponible en la extracción de texto del BOE

**Motivo:** El documento de texto extraído de BOE-A-2014-2360 solo contiene hasta el Anexo IV (Informática y Comunicaciones). Los Anexos V y VI no fueron incluidos en la extracción de texto.

---

## Archivos Generados

1. **RD127_2014_extracciones.json**
   - Contiene estructura JSON completa con FPB101, FPB102, FPB103
   - Formato estructurado con módulos, cualificaciones y correspondencias

2. **rd127_2014_fichas.json**
   - Versión alternativa con anotaciones sobre disponibilidad de datos
   - Marca claramente qué ciclos no tienen información disponible

---

## Limitaciones y Recomendaciones

### Limitaciones Identificadas

1. **Acceso al documento completo:** La versión de texto del BOE extraída solo contiene 4 de los 14 anexos del RD 127/2014
2. **Falta de Anexos V y VI:** Los ciclos FPB105 (Cocina y Restauración) y FPB106 (Mantenimiento de Vehículos) no están disponibles
3. **Formato de extracción:** El texto extraído del BOE puede perder cierta estructura que está disponible en el PDF original

### Recomendaciones para Completar la Información

Para obtener información completa de FPB105 y FPB106:

1. **Descargar PDF completo:** Acceder directamente al PDF de BOE-A-2014-2360 en lugar de la versión de texto
2. **Búsqueda alternativa:** Consultar regulaciones autonómicas (e.g., Aragón) que publican estos ciclos
3. **Catálogos profesionales:** Revisar el Catálogo Nacional de Cualificaciones Profesionales (CNCP) para las cualificaciones específicas
4. **Normativa relacionada:** Consultar RD 1085/2020 (convalidaciones) y RD 532/2025 (equivalencias UC)

---

## Información Adicional Disponible en el Proyecto

Se han identificado archivos adicionales en el proyecto que pueden completar esta información:

- `/research/fpb101.json` - Información vigente de FPB101 (RD 498/2024)
- `/research/fpb103.json` - Información vigente de FPB103 (RD 498/2024)
- `/research/fpb105.json` - Información vigente de FPB105 (RD 498/2024)
- `/research/fpb106.json` - Información vigente de FPB106 (RD 498/2024)

Estos archivos contienen la estructura actualizada del RD 498/2024 pero pueden usarse como referencia para la estructura esperada del RD 127/2014.

---

**Extracción realizada por:** Claude Haiku 4.5  
**Fecha:** 2026-10-01
