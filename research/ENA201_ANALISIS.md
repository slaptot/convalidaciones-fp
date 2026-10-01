# Extracción de Convalidaciones para ENA201 (RD 114/2017, BOE-A-2017-2310)

## Documento Principal
- **Título**: RD 114/2017, de 17 de febrero
- **BOE**: BOE-A-2017-2310 (Sábado 4 de marzo de 2017, Sec. I. Pág. 15679)
- **Ciclo**: Técnico en redes y estaciones de tratamiento de aguas (ENA201)
- **Nivel**: Grado Medio (CINE-3 b)
- **Familia**: Energía y Agua
- **Duración**: 2.000 horas

## Cualificaciones Profesionales Incluidas (Artículo 6)

### Cualificaciones Completas:

1. **ENA191_2: Montaje y mantenimiento de redes de agua** (RD 1228/2006)
   - UC0606_2: Replantear redes de distribución de agua y saneamiento
   - UC0607_2: Montar redes de distribución de agua y saneamiento
   - UC0608_2: Poner en servicio y operar redes de distribución de agua y saneamiento
   - UC0609_2: Mantener redes de distribución de agua y saneamiento

2. **SEA026_2: Operación de estaciones de tratamiento de aguas** (RD 295/2004)
   - UC0073_2: Operar los procesos de tratamiento y depuración del agua
   - UC0074_2: Realizar las operaciones de mantenimiento de equipos e instalaciones de plantas de tratamiento o depuración del agua
   - UC0075_2: Adoptar las medidas de prevención de riesgos laborales en el puesto de trabajo

### Cualificación Incompleta:

3. **EOC586_2: Pavimentos y albañilería de urbanización** (RD 1548/2011)
   - UC1929_2: Ejecutar pavimentos de urbanización
   - UC1360_2: Controlar a nivel básico riesgos en construcción

## Módulos Profesionales vs. Convalidaciones

### Módulos con UC (ANEXO V B - Acreditación):

| Módulo | Nombre | UC Acredita |
|--------|--------|------------|
| 1560 | Estaciones de tratamiento de aguas | UC0073_2 |
| 1562 | Técnicas de mecanizado y unión | UC0607_2 |
| 1563 | Montaje y puesta en servicio de redes de agua | UC0608_2 |
| 1564 | Calidad del agua | UC0073_2 |
| 1565 | Construcción en redes y estaciones de tratamiento de agua | UC1929_2, UC1360_2 |
| 1566 | Mantenimiento de equipos e instalaciones | UC0074_2 |
| 1567 | Hidráulica y redes de agua | UC0606_2 |
| 1568 | Mantenimiento de redes | UC0609_2 |

### Módulos SIN correspondencia UC:

- **0310**: Montaje y mantenimiento de instalaciones de agua (NO en convalidaciones)
- **1559**: Replanteo en redes de agua (NO en convalidaciones)
- **1561**: Instalaciones eléctricas en redes de agua (NO en convalidaciones)

## Tablas de Convalidación (ANEXO V)

### ANEXO V A) - UC → Módulos (Convalidación de módulos por UC):

Permite a personas con UC acreditadas convalidar (exemption) módulos:

| UC | Módulos Convalidables |
|----|----------------------|
| UC0606_2 | 1567 |
| UC0607_2 | 1562 |
| UC0608_2 | 1563 |
| UC0609_2 | 1568 |
| UC0073_2 | 1560, 1564 |
| UC0074_2 | 1566 |
| UC0075_2 | 1566 |
| UC1929_2 | 1565 |
| UC1360_2 | 1565 |

### ANEXO V B) - Módulos → UC (Acreditación de UC por módulos):

Permite a personas que superan módulos acreditar UC para certificados de profesionalidad:

| Módulo | UC Acredita |
|--------|------------|
| 1560 | UC0073_2 |
| 1562 | UC0607_2 |
| 1563 | UC0608_2 |
| 1564 | UC0073_2 |
| 1565 | UC1360_2, UC1929_2 |
| 1566 | UC0074_2 |
| 1567 | UC0606_2 |
| 1568 | UC0609_2 |

## Hallazgos Clave

### 1. Módulo 0310 - Situación Especial

- **Existe en**: RD 114/2017, Artículo 10.1.b (lista de módulos)
- **Nombre**: Montaje y mantenimiento de instalaciones de agua
- **Tipo**: Módulo específico heredado del sistema LOE
- **En convalidaciones UC**: NO
- **Conclusión**: Es un módulo de transferencia que podría permitir convalidación de competencias anteriores (LOGSE), pero no aparece en los anexos de UC del RD 114/2017

### 2. Módulos solicitados (1559-1568)

- **1559**: Existe, NO convalida UC
- **1560-1568**: Todos existen
  - 1560-1568 excepto 1561: Aparecen en convalidaciones UC
  - 1561 (Instalaciones eléctricas): No aparece en convalidaciones
- **Módulos adicionales en convalidaciones**: 1565, 1566, 1567, 1568 (no fueron solicitados pero están en las tablas)

### 3. Niveles de Unidades de Competencia

- Todas las UC en ENA201 tienen nivel 2 (sufijo _2)
- Niveles disponibles: 1 (Básico), 2 (Medio), 3 (Superior)
- ENA201 = Grado Medio = UC nivel 2 únicamente
- Ciclos superiores (ENA301, ENA302) incluyen UC nivel 3

### 4. Distribución de Cualificaciones

- **Cualificaciones completas en ENA201**: 2
  - ENA191_2 (4 UC sobre redes de agua)
  - SEA026_2 (3 UC sobre tratamiento de aguas)
- **Cualificaciones incompletas**: 1
  - EOC586_2 (2 UC sobre construcción)

### 5. UC Reutilizadas

- **UC0073_2** aparece en:
  - Módulo 1560 (acredita)
  - Módulo 1564 (acredita)
  - Convalida ambos módulos

## Estructura JSON Generada

El archivo `ena201.json` contiene:

```
- uc_a_modulos: Tabla ANEXO V A) con correspondencia UC → módulos
- modulos_a_uc: Tabla ANEXO V B) con correspondencia módulos → UC
- uc_descripciones: Descripciones oficiales de cada UC
- cualificaciones: 3 cualificaciones con sus UC incluidas
- modulos_ena201: Información de cada módulo del ciclo
- ciclo: Metadatos del ciclo ENA201
- notas: Observaciones importantes
```

## Conclusiones para Integración

1. **Datos completos extraídos**: Se tiene toda la información de convalidaciones UC → módulos y módulos → UC del RD 114/2017

2. **Módulo 0310 requiere atención especial**: Probablemente requiera búsqueda en RD 1085/2020 para convalidaciones LOE/LOGSE

3. **Información de UC disponible**: 9 UC descritas, todas nivel 2 (Grado Medio)

4. **No hay equivalencias ECP en RD 114/2017**: Para equivalencias UC → Códigos ECP profesionales, verificar RD 532/2025 Anexo II-a

## Archivos Generados

- `/research/ena201.json` - Estructura JSON completa
- `/research/ENA201_ANALISIS.md` - Este documento
