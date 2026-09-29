# Verificación normativa — 20/09/2026

Objeto: comprobar si la normativa que aplica la herramienta de convalidaciones de FP sigue vigente y detectar cambios recientes no recogidos en `research/normativa-general.md` (consulta de 18/09/2026).

Método: descarga directa con `curl -A "Mozilla/5.0"` de los textos consolidados del BOE (`https://www.boe.es/buscar/act.php?id=<ID>`), de la API de datos abiertos del BOE (`/datosabiertos/api/legislacion-consolidada/id/<ID>/analisis`, bloque `<posteriores>`), de las fichas `diario_boe/txt.php?id=<ID>` (bloque "Referencias posteriores"), barrido día a día de los sumarios del BOE (01/05/2026–20/09/2026) y del BOA (01/05/2026–20/09/2026), y lectura de las páginas y PDF de educa.aragon.es y del BOA.

Convenciones: **[L]** = leído hoy en la fuente citada. Todo lo que no lleva [L] está en la sección 4.

---

## 1. Norma → consolidación comprobada hoy → ¿cambios no recogidos?

| Norma | Fecha de consolidación comprobada hoy | Coincide con lo registrado | ¿Cambios no recogidos? | Qué cambia y desde cuándo | URL |
|---|---|---|---|---|---|
| **LO 3/2022** (BOE-A-2022-5139) | «Última actualización, publicada el 08/06/2024» [L] | Sí (08/06/2024) | **No** | Única modificación posterior: Ley 1/2024, de 7 de junio (BOE-A-2024-11613), arts. 55, 113 y 114; en vigor 28/06/2024. Ninguno afecta a convalidaciones. No hay nada posterior | https://www.boe.es/buscar/act.php?id=BOE-A-2022-5139 |
| **RD 659/2023** (BOE-A-2023-16889) | «Última actualización, publicada el 06/05/2025» [L] | Sí (06/05/2025) | **No** (una salvedad menor) | Posteriores en el análisis del BOE: RD 658/2024 (BOE-A-2024-14079, en vigor 11/07/2024); STC 82/2025, de 26 de marzo (BOE-A-2025-8977, 06/05/2025); **corrección de errores BOE-A-2025-10203, de 23/05/2025** — no recogida en el fichero, pero irrelevante: solo corrige el art. 168.1 ("no incorporadas") y una remisión de la DT 8ª ("disposición final quinta") [L]. Nada entre 05/2025 y 09/2026 | https://www.boe.es/buscar/act.php?id=BOE-A-2023-16889 |
| **RD 1085/2020** (BOE-A-2020-17274) | «Última actualización, publicada el 07/04/2026», en vigor desde 27/04/2026 [L] | Sí (07/04/2026) | **No** en cuanto a normas; **sí** en dos detalles de cita | Lista completa de posteriores [L]: RD 393/2022 (anexo III), RD 659/2023 (art. 3 y anexos II y III), RD 500/2024 (anexo III, DA 1ª y nueva DA 6ª), RD 262/2026 (art. 3). Nada posterior al 07/04/2026. Detalles: (a) el **RD 393/2022 es BOE-A-2022-9846**, no BOE-A-2022-8496 (deducción errónea del ELI, duda 17); (b) existe una **corrección de errores del RD 393/2022, BOE-A-2022-10806** (BOE 30/06/2022), que solo rectifica el número de página de la DF 2ª [L]. Verificado además el **art. 3.7 bis** (DLSE B2 → Lengua de Signos) en el consolidado [L] | https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274 |
| **RD 498/2024** (BOE-A-2024-10683) | No tiene texto consolidado en el BOE (act.php devuelve vacío) [L] | — | **No** | Ficha del documento: **sin "Referencias posteriores"** [L]. La DA 3ª sigue siendo la vigente | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10683 |
| **RD 499/2024** (BOE-A-2024-10684) | Sin texto consolidado [L] | — | **Sí (menor)** | Modificado por el **RD 565/2024, de 18 de junio (BOE-A-2024-12502)**: da nueva redacción a tres apartados del artículo séptimo (confirman «1713. Proyecto intermodular») y añade una DA 5ª sobre módulos asignados a personas expertas del sector productivo (art. 165.6 del RD 659/2023) [L]. **No afecta a convalidaciones**; solo confirma el código 1713 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10684 |
| **RD 500/2024** (BOE-A-2024-10685) | Sin texto consolidado [L] | — | **Sí (menor)** | (a) **RD 565/2024** le añade una DA 8ª (personas expertas del sector productivo) [L]; (b) **corrección de errores BOE-A-2025-10205, de 23/05/2025** [L]: rectifica el certificado "Micropigmentación IMP799_3" y sustituye "UC0064_3" por "UC0064_2" (añadiendo UC2670_3 y UC2671_3) **en los anexos IV A) y IV B) del RD 881/2011** (Técnico Superior en Estética Integral y Bienestar), es decir, en una tabla UC→módulos de convalidación. Afecta solo a ese título | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10685 |
| **RD 532/2025** (BOE-A-2025-13147) — estándares de competencias profesionales (ECP) | Sin texto consolidado [L]. BOE nº 155, de 28/06/2025 | No figuraba en la tabla de `normativa-general.md` | **Sí** | Posteriores [L]: corrección de errores BOE-A-2025-23619 (22/11/2025); **Orden EFD/206/2026, de 27 de febrero** (BOE-A-2026-5872, 13/03/2026) y **Orden EFD/374/2026, de 14 de abril** (BOE-A-2026-8957, 24/04/2026), que actualizan ECP del anexo I; y **RD 636/2026, de 29 de julio** (BOE-A-2026-16551, 30/07/2026), que modifica el anexo I. El texto del RD 532/2025 **no contiene la palabra "convalidación"** [L]: integra las antiguas UC en ECP con efectos de acreditación parcial acumulable | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-13147 |
| **RD 1593/2011** — APSD (BOE-A-2011-19542) | Sin consolidado [L] | — | **No** | Últimas referencias posteriores: RD 499/2024 (arts. 2, 6, 10, 12, 15, anexos I, III, V A) y V B)) y la derogación de su anexo de convalidaciones por el RD 1085/2020 [L]. Nada después de 21/05/2024 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-19542 |
| **RD 699/2019** — Termalismo y bienestar (BOE-A-2020-341) | Sin consolidado [L] | — | **No** | Última referencia posterior: RD 500/2024 (arts. 2, 6, 10, 12, 15, anexos I, III y sustitución del anexo V.A y B) [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2020-341 |
| **RD 1691/2007** — SMR (BOE-A-2008-819) | Sin consolidado [L] | — | **No** | Última referencia posterior: RD 499/2024 (arts. 2, 10, 12, 15, anexos I y III) [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2008-819 |
| **RD 256/2011** — Estética y Belleza (BOE-A-2011-6232) | Sin consolidado [L] | — | **No** | Última referencia posterior: RD 499/2024 (arts. 2, 6, 10, 12, 15, anexos I, III, V A) y V B)) [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-6232 |
| **RD 546/1995** — TCAE LOGSE (BOE-A-1995-13533) | Sin consolidado [L] | — | **No** | **Ninguna referencia posterior salvo el RD 558/1995 (currículo)** [L]. Sigue vigente y sin sustituto publicado | https://www.boe.es/diario_boe/txt.php?id=BOE-A-1995-13533 |
| **Orden EFP/892/2023** (BOE-A-2023-17924) | Sin consolidado [L] | — | **No** | **Sin referencias posteriores** [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2023-17924 |
| **Aragón — Decreto 91/2024** | Consolidado publicado por educa.aragon: **"Decreto 91/2024 Consolidado. Actualizado a 09/01/2026"** (PDF *Consolidado Decreto 91_2024 v5 Reducido*, 238 págs.) [L] | **No.** El fichero registra el consolidado a **14/10/2025** | **SÍ — cambio relevante** | El Anexo VIII (convalidaciones) fue modificado por la **Resolución de 3 de diciembre de 2025** (BOA nº 242, 16/12/2025, csv BOA20251216024) y por su **corrección de errores** (BOA nº 10, 16/01/2026, csv BOA20260116015). Detalle en la sección 2 | Consolidado v5: https://educa.aragon.es/documents/20126/6133293/Consolidado+Decreto+91_2024+v5+Reducido.pdf/c2391015-c607-b859-f09b-d30f9fdbcd40?t=1767954063086 · Índice: https://educa.aragon.es/-/formacion-profesional/legislacion/normativa-autonomica |
| **Aragón — Resolución de 14/07/2026** (matrícula a efectos de convalidación 2026/27) | Sigue siendo **la última** publicada [L] | Sí | **No** | La página de convalidaciones de educa.aragon, consultada hoy, no enlaza ninguna resolución posterior. El barrido del BOA (01/05/2026–20/09/2026) no arroja ninguna disposición de convalidaciones ni de exenciones de FP posterior a esa fecha [L] | https://educa.aragon.es/-/formacion-profesional/legislacion-autonomica/convalidaciones |

> **Trampa detectada:** la página de educa.aragon de *Convalidaciones* sigue enlazando el PDF antiguo («Decreto 91_2024 Consolidado con Decreto 107_2025 actualizado 14-10-2025»), mientras que la página de *Normativa autonómica* enlaza el consolidado nuevo (v5). El texto del Anexo VIII difiere entre ambos. El v5, pese a estar rotulado «09/01/2026», ya incorpora también la corrección de errores publicada el 16/01/2026 (contiene el apartado 6.17) [L].

---

## 2. Normas nuevas encontradas y su efecto sobre convalidaciones

### 2.1 Aragón — cambios en el Anexo VIII del Decreto 91/2024 (no recogidos; anteriores a mayo de 2026 pero posteriores a la consolidación registrada)

**a) Resolución de 3 de diciembre de 2025**, del Director General de Planificación, Centros y FP (BOA nº 242, 16/12/2025) — sustituye los anexos I, II, III, IV, V, VII, XI a) y XI b) y **añade al Anexo VIII, apartado 6, los puntos 15 y 16** [L]:
https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1426640110505

- **Punto 15 (nuevo — sentido IPE I → FOL):**
  - Mientras se sigan impartiendo ciclos **LOE**, el módulo de **FOL de grado medio y de grado superior será convalidado cuando se aporte el módulo 1709 IPE I**.
  - Mientras se sigan impartiendo ciclos **LOGSE**, **FOL de grado medio** será convalidado aportando 1709 IPE I.
  - **FOL de grado superior LOGSE NO se convalida** aportando 1709 IPE I.
- **Punto 16 (nuevo — sentido IPE II → EIE, prohibitivo):**
  - **EIE** de títulos de grado medio y superior **LOE NO será convalidado** por la dirección del centro **cuando se aporte 1710 IPE II**.
  - Tampoco procede convalidar, aportando 1710 IPE II, los módulos LOGSE de «Administración, gestión y comercialización en la pequeña empresa» y similares que el Anexo II del RD 1085/2020 permite canjear por EIE.

**b) Corrección de errores de la Resolución de 3/12/2025** (BOA nº 10, 16/01/2026) [L]:
https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1430811130505

- **Reescribe el Anexo VIII, apartado 5** ("No son susceptibles de convalidación"). Nueva redacción, ya asimétrica:
  - el periodo de formación en empresa (solo exención total o parcial);
  - el módulo de Proyecto intermodular;
  - **el módulo de Inglés Profesional (0179) cuando se aporte Inglés Profesional (0156)**;
  - **el módulo de Digitalización aplicada a los sectores productivos (1665) cuando se aporte Digitalización (1664)**.
  - Es decir: desaparece la prohibición genérica "entre grado medio y grado superior" y se prohíbe **solo el sentido medio → superior**.
- **Añade el Anexo VIII, apartado 6.17:** «El módulo **Digitalización aplicada a los sectores productivos (1664)**, en cualquier Ciclo Formativo de Grado Medio, a aquellas personas que tengan superado el módulo profesional **Digitalización aplicada a los sectores productivos (1665)**». Lo resuelve la dirección del centro. **No menciona el requisito de misma familia profesional.**

Ambos cambios están ya incorporados en el consolidado v5 (Anexo VIII, págs. 175-179 del PDF) [L], donde además se confirman sin cambios los apartados 6.6, 6.7 y 6.8 (Inglés) y 6.9-6.12 (optativos y grado básico).

**c) Resolución de 24 de noviembre de 2025** (periodos y duración de la formación en empresa en ciclos de más de 2.000 horas), enlazada en el índice de normativa autonómica y no recogida en el fichero. No leída — ver sección 4.
https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1425315820606

**d) Corrección de errores del Decreto 107/2025** (BOA 19/01/2026), enlazada en el índice y no recogida. No leída — ver sección 4.
https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1431015170404

### 2.2 Estado — mayo a septiembre de 2026

Barrido completo de los sumarios diarios del BOE del 01/05/2026 al 20/09/2026 (los únicos días sin sumario fueron domingos) [L]. **Ninguna norma modifica el RD 1085/2020, el RD 659/2023 ni la LO 3/2022.** Lo publicado con alguna relación con la materia:

| Norma | Fecha BOE | Efecto sobre convalidaciones | URL |
|---|---|---|---|
| **RD 488/2026, de 17 de junio** — Certificado profesional en Procedimientos y técnicas de micropigmentación (Imagen Personal), grados B y A | 19/06/2026 | Trae su propia tabla de correspondencia ECP ↔ módulos para convalidación (anexos VI A y VI B) y su art. 13 remite la exención de la formación en empresa al art. 131 del RD 659/2023 [L]. **No altera reglas generales**; solo añade un certificado profesional nuevo aportable por la vía R8 | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-13294 |
| **RD 535/2026, de 30 de junio** — modifica los RD de títulos de Técnico Deportivo Superior y el RD 243/2022 | 02/07/2026 | Cambia el **bloque común** de las enseñanzas deportivas de grado superior (modifica el art. 23.4 del RD 243/2022, el art. 23.2 del RD 534/2024 y el art. 4 y anexos II/III de once RD de títulos deportivos) [L]. **Implantación en el curso 2027-2028** (DF 2ª), anticipable a 2026-2027. Es el bloque común al que se refiere la Orden EFP/892/2023 (ítem 13 del fichero), que no ha sido modificada. Efecto **futuro** sobre las convalidaciones con la familia Actividades Físicas y Deportivas | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-14333 |
| **RD 587/2026, de 15 de julio** — CE de grado medio en Montaje integral y mantenimiento de bicicletas y VMP | 21/07/2026 | Curso de especialización nuevo, con tabla ECP→módulos propia (anexo IV A) y exención de FFE por el art. 131 del RD 659/2023 [L]. **No modifica el RD 1085/2020** | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-15852 |
| **RD 588/2026, de 15 de julio** — CE de grado superior en Desarrollo de equipos y sistemas electrónicos | 21/07/2026 | Igual que el anterior; además asigna 45 ECTS "a efectos de facilitar el régimen de convalidaciones" (art. 14) [L]. **No modifica el RD 1085/2020** | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-15853 |
| **RD 636/2026, de 29 de julio** — establece y suprime ECP de las familias Administración y Gestión; Agraria; Artes Gráficas; Edificación y Obra Civil; Energía y Agua; Industrias Alimentarias; Fabricación Mecánica; Textil, Confección y Piel; Seguridad y Medio Ambiente; y Transporte y Mantenimiento de Vehículos | 30/07/2026 (en vigor 31/07/2026) | **No contiene la palabra "convalidación"** [L]. Pero su **DA 2ª** fija «las correspondencias y los requisitos adicionales» (anexo XXX-a) entre los **ECP suprimidos** y sus equivalentes actuales del Catálogo. Afecta indirectamente a la regla R7 (ECP/UC acreditadas → módulos) en esas diez familias. **Ninguna de las familias de los títulos que usa la herramienta** (Sanidad, Servicios Socioculturales, Imagen Personal, Informática y Comunicaciones) está en la lista | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16551 |
| **RD 722/2026, de 9 de septiembre** — Reglamento del Consejo General de FP | 11/09/2026 | Sin efecto sobre convalidaciones [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-18998 |
| **Resoluciones de la SGFP de 13/05/2026 y 18/06/2026** — incorporan «Marketing para nuevos proyectos empresariales» y «Profundización en el proceso de construcción industrializada en la vivienda» al repertorio de módulos optativos (art. 96.1.b del RD 659/2023) | 25/05/2026 y 27/06/2026 | Amplían el catálogo de optativos; relevante para la regla C24 (optativos) pero no cambian su régimen [L] | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-11281 · https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-13993 |

### 2.3 Título de "Técnico en Cuidados de Enfermería"

**No se ha publicado.** Está en fase de **consulta pública previa, ya cerrada** (10/06/2026 a 25/06/2026): «Proyecto de Real Decreto por el que se establece el título de Formación Profesional de Grado Medio de Técnico en Cuidados de enfermería y se fijan los aspectos básicos del currículo» [L]. No ha pasado aún por el trámite de audiencia e información pública ni se ha publicado en el BOE (barridos del BOE 01/01/2025–20/09/2026 sin resultado) [L]. El **RD 546/1995 (TCAE LOGSE) sigue siendo el título vigente y no ha sido modificado**.
https://www.educacionfpydeportes.gob.es/servicios-al-ciudadano/informacion-publica/consulta-publica-previa/cerrados/2026/prd-tecnicos-cuidados-enfermeria.html

---

## 3. Conclusión: qué reglas de la herramienta habría que corregir

**Estado: ningún cambio.** Las tres normas troncales (LO 3/2022, RD 659/2023 y RD 1085/2020) conservan exactamente la fecha de consolidación registrada y no tienen modificaciones posteriores. Las reglas G1-G16, R1-R10, E1-E13 y los plazos de origen estatal **no necesitan corrección**.

**Aragón: sí hay que corregir.** Por orden de importancia:

1. **G7 / C20 (Digitalización).** En Aragón ya **no** rige la prohibición simétrica. Hay que:
   - permitir **1665 (GS) → 1664 (GM)**, resuelto por el centro (Anexo VIII ap. 6.17);
   - mantener prohibido **1664 → 1665** (ap. 5);
   - revisar si se exige "misma familia profesional": el ap. 6.17 aragonés **no** lo exige, mientras el art. 126.3.b del RD 659/2023 sí. Conviene dejar la condición de familia como aviso, no como bloqueo, y documentar la divergencia.
2. **Regla nueva (no existía): IPE I → FOL.** Aportando **1709 IPE I** se convalida **FOL** de ciclos LOE (grado medio y superior) y **FOL LOGSE de grado medio**; **no** FOL LOGSE de grado superior. Resuelve el centro (Anexo VIII ap. 6.15).
3. **Regla nueva prohibitiva: IPE II NO convalida EIE.** Aportando **1710 IPE II** **no** se convalida EIE (LOE, GM y GS) ni los módulos LOGSE del cuadro de EIE del Anexo II del RD 1085/2020 (Anexo VIII ap. 6.16). La herramienta debe devolver "no procede" y no aplicar la simetría de C3 en sentido inverso.
4. **C12 (Inglés).** El sentido 0179 → 0156 ya está bien, pero la cita debe actualizarse: en Aragón la base es ahora el Anexo VIII ap. 5 (redacción de la corrección de errores de 16/01/2026) además del ap. 6.8.
5. **Fuente del Decreto 91/2024.** Sustituir en la herramienta y en `normativa-general.md` el PDF consolidado de **14/10/2025** por el **v5 ("actualizado a 09/01/2026")**, y advertir que la página de *Convalidaciones* de educa.aragon todavía enlaza el antiguo.
6. **C8 (1227 Gestión de un pequeño comercio → EIE).** En el consolidado del RD 1085/2020 a 07/04/2026, la cadena «Gestión de un pequeño comercio» aparece **una sola vez y en el Anexo II** (LOGSE «Administración y gestión de un pequeño establecimiento comercial» → 1227), **no** como formación aportada para EIE. La tabla «Para todos los ciclos formativos con empresa e iniciativa emprendedora» del Anexo III contiene hoy solo dos filas: «EIE → EIE» y «Cualquier ciclo de grado medio o superior de las familias Comercio y Marketing o Administración y Gestión / ciclo completo → EIE» [L]. **C8, tal como está redactada (tomada de todofp), no se sostiene en el texto consolidado**; conviene reformularla como C7 o retirarla.
7. **Correcciones de cita menores:** RD 393/2022 = **BOE-A-2022-9846** (cierra la duda 17); añadir su corrección de errores BOE-A-2022-10806; añadir la corrección de errores del RD 659/2023 (BOE-A-2025-10203) y la del RD 500/2024 (BOE-A-2025-10205); añadir el **RD 565/2024** (BOE-A-2024-12502) como modificador de los RD 499/2024 y 500/2024; añadir el **RD 532/2025** y el **RD 636/2026** a la tabla de normas, por su efecto sobre los ECP usados en R7/R8.
8. **Si la herramienta cubre la familia Actividades Físicas y Deportivas:** anotar el **RD 535/2026** (bloque común de enseñanzas deportivas), aplicable desde el curso 2027-2028 y anticipable a 2026-2027.
9. **Estética Integral y Bienestar (RD 881/2011):** si la herramienta usa su tabla UC→módulos, aplicar la corrección de errores BOE-A-2025-10205 (UC0064_**2**, más UC2670_3 y UC2671_3 para Micropigmentación).

Las dudas 1 a 16 de `normativa-general.md` siguen abiertas salvo la 17 (resuelta) y, parcialmente, la 16 (esta verificación cubre el periodo mayo-septiembre de 2026 en el BOE y en el BOA).

---

## 4. Qué no he podido comprobar

1. **Textos que no he leído en la fuente:** la Resolución de 24/06/2021 de Aragón y su corrección (ciclos LOE); la Orden de 11/11/2014 y la Resolución de 11/06/2025 (MCER); la Orden EFP/892/2023 (solo he comprobado que no tiene referencias posteriores, no su contenido); el RD 498/2024 (solo su ficha, sin referencias posteriores); el texto completo de la Resolución de 14/07/2026 a partir del apartado quinto y su Anexo III (2ª convocatoria).
2. **Aragón, normas nuevas detectadas pero no leídas:** la **Resolución de 24/11/2025** (periodos y duración de la formación en empresa en ciclos de más de 2.000 h) y la **corrección de errores del Decreto 107/2025** (BOA 19/01/2026). Pueden afectar a E12/E3.
3. **Anexos I a V, VII y XI del Decreto 91/2024** sustituidos por la Resolución de 3/12/2025: su contenido está en un documento con CSV alojado en https://mia.aragon.es/documentos y no lo he abierto. Solo he verificado el Anexo VIII.
4. **Alcance de las familias del RD 636/2026:** he leído el objeto, la DA 2ª y la DF 1ª, pero **no** el anexo XXX-a de correspondencias entre ECP suprimidos y vigentes (213 páginas). Si la herramienta usa títulos de esas diez familias, hay que revisarlo.
5. **Órdenes EFD/206/2026 y EFD/374/2026** (actualización de ECP): solo he leído sus títulos y su relación con el RD 532/2025, no su contenido.
6. **Barrido del BOE:** cubre 01/05/2026–20/09/2026 por título de la disposición. Una norma cuyo título no contuviera ninguna de las palabras clave usadas (convalidación, exención, estándares de competencia, formación profesional, título de Técnico, curso de especialización, enseñanzas mínimas, módulo) podría haberse escapado. Las modificaciones de las normas troncales, en cambio, están descartadas por la vía del análisis jurídico del BOE, que es exhaustivo.
7. **Barrido del BOA:** mismo método y mismo periodo, limitado a los títulos que empiezan por ORDEN/DECRETO/RESOLUCIÓN/CORRECCIÓN/LEY/ACUERDO.
8. **Otras comunidades autónomas:** no comprobadas (la verificación se ha limitado al Estado y a Aragón, como el fichero de origen).
9. **todofp.es:** no lo he vuelto a consultar en esta verificación, así que no sé si ha actualizado las contradicciones señaladas en las dudas 6 y 9.
10. **El rótulo "09/01/2026" del consolidado v5 de Aragón** es incoherente con su contenido (incluye la corrección publicada el 16/01/2026). No he podido determinar la fecha real de la versión; me he basado en lo que el PDF dice.
