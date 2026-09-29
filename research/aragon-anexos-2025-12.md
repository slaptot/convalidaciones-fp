# Aragón — Anexos del Decreto 91/2024 sustituidos por la Resolución de 3/12/2025 y su corrección de 16/01/2026

Fecha de la consulta: **20/09/2026**.
Convenciones: **[V]** = verificado leyendo el texto íntegro de la fuente citada. **[NV]** = no verificado. **[INF]** = inferencia propia, no literal en la fuente.

**Resultado principal: SÍ he podido abrir los dos documentos alojados en `mia.aragon.es`.** Ambos PDF se han descargado y se ha extraído su texto íntegro. Ver sección 0 para el método y las URLs exactas.

---

## 0. Cómo se ha accedido a los documentos (URLs exactas)

`https://mia.aragon.es/documentos` es una aplicación Angular (SPA) que no expone enlaces directos en el HTML. El HTML servido solo contiene el bundle de arranque. Para llegar al PDF:

1. `https://mia.aragon.es/documentos` → shell HTML (200 OK), sin formulario en el marcado. [V]
2. `https://mia.aragon.es/config/environment.config.json` → configuración de entorno, que declara `"backendUrl": "https://carp-core-mia.aragon.es/rest/"`. [V]
3. Los bundles de la SPA (`main.*.js` y el chunk perezoso del módulo `documentos`) definen cuatro rutas de API: `documentos/{csv}/verificar`, `documentos/firma/{csv}/verificar`, `documentos/firma/{csv}/descargar` y `documentos/{csv}/descargar` (y `documentos/{csv}/pdf`). [V]

| Llamada | URL exacta | Resultado |
|---|---|---|
| Verificación de firma | `https://carp-core-mia.aragon.es/rest/documentos/firma/CSV8R0PFO83I71J0XFIL/verificar` | `{"fecha":1789917458697,"isFirmaValida":true}` [V] |
| Verificación de firma | `https://carp-core-mia.aragon.es/rest/documentos/firma/CSVH42570R2KK1W0XFIL/verificar` | `{"fecha":1789917461902,"isFirmaValida":true}` [V] |
| **Descarga del PDF (doc. de 3/12/2025)** | `https://carp-core-mia.aragon.es/rest/documentos/CSV8R0PFO83I71J0XFIL/descargar` | PDF, **16 páginas**, 779.614 bytes [V] |
| **Descarga del PDF (doc. de 16/01/2026)** | `https://carp-core-mia.aragon.es/rest/documentos/CSVH42570R2KK1W0XFIL/descargar` | PDF, **3 páginas**, 195.059 bytes [V] |
| (equivalente) | `.../rest/documentos/{CSV}/pdf` | Byte a byte idéntico al anterior [V] |

Aviso técnico: el endpoint `.../documentos/firma/{csv}/descargar` **no** devuelve el PDF sino el contenedor de firma CAdES desprendida (`{CSV}_firma.csig`, `application/octet-stream`), que no contiene el documento (`openssl cms -verify` → "no content"). El PDF está en `.../documentos/{csv}/descargar`. [V]

Ambos PDF llevan en el pie de cada página, como texto extraíble: *"Firmado electrónicamente por Luis Mariano Mallada Bolea, Director/a G.Plani.,Centros Form.Profes., DIRECCIÓN GENERAL DE PLANIFICACIÓN, CENTROS Y FORMACIÓN PROFESIONAL el 01/12/2025"* (documento de la Resolución de 3/12/2025) y *"… el 08/01/2026"* (documento de la corrección de 16/01/2026), con la mención *"verificable a través de la dirección https://mia.aragon.es/documentos con CSV …"*. [V]

Texto extraído con `pypdf` 6.19.0 (no había `pdftotext` en el equipo). Descargas con `curl -A "Mozilla/5.0"`.

### Fuente complementaria: el consolidado v5

El **texto consolidado oficioso v5** de educa.aragon.es (`Consolidado Decreto 91_2024 v5 Reducido.pdf`, 238 páginas, sello "TEXTO SIN VALOR JURÍDICO") **ya incorpora los dos documentos**: su anexo V contiene la redacción con *"en la modalidad ___ (Presencial / Semipresencial / Virtual / Modular)"* y el encabezado *"Relación de Estándares de Competencias Profesionales acreditados por los módulos profesionales superados incluidos en el título"*, ambos introducidos por la corrección de 16/01/2026. También contiene los puntos 15, 16 y 17 añadidos al anexo VIII y la redacción corregida de su apartado 5. [V]
URL: https://educa.aragon.es/documents/20126/6133293/Consolidado+Decreto+91_2024+v5+Reducido.pdf/c2391015-c607-b859-f09b-d30f9fdbcd40?t=1767954063086

Esto permite **cotejar los anexos nuevos con los inmediatamente anteriores**, que no son los del Decreto 91/2024 original sino los del **Decreto 107/2025** (su apartado final sustituyó ya los anexos I a VII: *"1. El anexo I se sustituye por el que aparece al final del documento"*, y así hasta el 7 para el anexo VII). [V — BOA 18/09/2025 nº 181, https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1411653420404]

---

## 1. Qué es cada anexo sustituido (título y objeto)

Títulos **literales** de los encabezados de cada anexo, leídos en el PDF del CSV y coincidentes con el consolidado v5. El "objeto" se toma del articulado del Decreto 91/2024 que los invoca.

| Anexo | Título literal | Objeto (artículo que lo invoca) | ¿En qué documento aparece? |
|---|---|---|---|
| **I** | "Expediente académico" | Documento oficial de evaluación (art. 51.1.a del Decreto: *"a) El expediente académico (Anexo I)"*). Se inserta "según el modelo … Anexo I de este Decreto" y lo firma la persona titular de la secretaría. Contiene datos personales, datos académicos, antecedentes psicopedagógicos, traslado de centro, solicitud y entrega del título, y **dos cuadros de calificaciones** (módulos/ámbitos y bloques formativos). | CSV8R0PFO83I71J0XFIL, págs. 1-4 |
| **II** | "Acta de evaluación" | Documento oficial de evaluación (art. 51.1.b). Relación alfabética del alumnado con calificaciones por módulo, columna *"Realizada formación en empresa (SÍ/NO/EX)"*, promoción, propuesta de título, firmas del profesorado y resumen estadístico (que incluye una fila **"Convalidados"**). | CSV8R0PFO83I71J0XFIL, págs. 5-8 |
| **III** | "Informe de evaluación individualizado" | Documento oficial de evaluación (art. 51.1.c); se emite en los traslados de centro "acreditando que los datos …". Histórico de calificaciones + resultados del curso en que se traslada. | CSV8R0PFO83I71J0XFIL, págs. 9-10 |
| **IV** | "Boletín de información" | Documento de información a la familia/alumnado (art. 51.2.a). Calificaciones por evaluación y faltas. | CSV8R0PFO83I71J0XFIL, pág. 11 |
| **V** | "Certificado académico oficial" | Art. 51.2.b y art. 53.2: *"Se expedirá el certificado académico de acuerdo con el modelo establecido en el Anexo V"*. Certifica matrícula, requisito de acceso, calificaciones, nota media a efectos de admisión y cumplimiento de requisitos para el título. Segunda página: relación de estándares de competencias profesionales acreditados. | CSV8R0PFO83I71J0XFIL, págs. 12-13 **y sustituido de nuevo** por CSVH42570R2KK1W0XFIL, págs. 1-2 |
| **VII** | "Certificación de bloques formativos" | Art. 53.4: *"La certificación de bloques formativos se expedirá de acuerdo con el modelo del Anexo VII"*. Equivalente al anexo V para la matrícula por bloques formativos de menor duración (art. 9.2). | CSV8R0PFO83I71J0XFIL, pág. 14 **y sustituido de nuevo** por CSVH42570R2KK1W0XFIL, pág. 3 |
| **XI a)** | "Plan de formación" | Modelo del plan de formación en empresa u organismo equiparado: reparto de resultados de aprendizaje y actividades entre empresa y centro, periodos y horario. Invocado por el art. 55 (redacción Decreto 107/2025): *"El Plan de formación seguirá el modelo establecido en el anexo XI a)"*. | CSV8R0PFO83I71J0XFIL, pág. 15 |
| **XI b)** | "Plan de formación (Evaluación)" | Mismo modelo con columnas de evaluación de cada RA y actividad. Invocado por el art. 55 (redacción Decreto 107/2025): *"…la evaluación del Plan de formación se realizará de acuerdo con el modelo establecido…"*. **Es el documento que la Resolución de 24/11/2025, ap. Tercero, exige aportar junto a la solicitud de convalidación o traslado de nota de un módulo dualizado.** | CSV8R0PFO83I71J0XFIL, pág. 16 |

Anexos **no** sustituidos por estos documentos, a efectos de contraste: **VI** ("Documento de evaluación provisional"), **VIII** ("Indicaciones en materia de convalidaciones"), **IX** y **X** (modelos de autorización —del Servicio Provincial y de la dirección del centro, respectivamente— para la realización de la formación en empresa u organismo equiparado). [V — índice y encabezados del consolidado v5]

---

## 2. Contenido de los documentos abiertos

### 2.1 Documento CSV `CSV8R0PFO83I71J0XFIL` (Resolución de 3/12/2025) — 16 páginas

Es **un único PDF con los ocho modelos formales encadenados**, en el orden I, II, III, IV, V, VII, XI a), XI b). No contiene articulado, ni preámbulo, ni instrucciones generales: **son exclusivamente formularios en blanco** (plantillas con campos y notas al pie explicativas). [V]

Cambios sustantivos respecto de la versión inmediatamente anterior (la del **Decreto 107/2025**), obtenidos por cotejo línea a línea. Todo lo demás es reordenación de maquetación y correcciones tipográficas: [V]

1. **Leyenda de calificaciones (anexos I, II, III, IV, V, VII)** — se amplía para recoger las calificaciones cualitativas de los ámbitos de Grado Básico. Antes: *"Módulo/Ámbito/Proyecto suspenso 1,2,3 o 4"* / *"superado 5,6,7,8,9 o 10"*. Ahora: *"suspenso 1,2,3,4 o IN"* / *"superado 5,6,7,8,9 o 10 SU, BI, NT o SB"*. Paralelamente, en los anexos III y IV se añade a la nota explicativa *"…o en el caso del Ámbito de Comunicación y Ciencias Sociales y del Ámbito de Ciencias Aplicadas de los Ciclos Formativos de Grado Básico: 'Insuficiente (IN)', 'Suficiente (SU)', 'Bien (BI)', 'Notable (NT)' o 'Sobresaliente (SB)'"*. Lo mismo en la nota 15 del anexo I, para bloques formativos.
2. **La línea de convalidaciones de esa misma leyenda NO cambia.** En los seis anexos sigue diciendo, literalmente: *"Módulo/Ámbito convalidado — **CV o CV-Nota**"*; y en los anexos III y IV: *"…también se establecerán la renuncia de convocatoria (RC), mención honorífica (10-MH), no evaluado (NE), **las convalidaciones (CV) o las convalidaciones con nota (CV-Nota)**"*. Esta redacción es idéntica a la del Decreto 107/2025 **y a la del Decreto 91/2024 original de 06/06/2024**. [V — cotejado con https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1336515330404]
3. **Anexo I** — el bloque "Antecedentes de escolarización" ya había desaparecido en el Decreto 107/2025; aquí se consolida el bloque "Datos académicos". Se traslada el "Año Académico: 20__/20__" al encabezado del cuadro de módulos.
4. **Anexo II** — se corrige el rótulo "FIRMAS DEL PROFESORADO II" → "FIRMAS DEL PROFESORADO". La columna *"Realizada formación en empresa (SÍ/NO/EX)"* y el epígrafe "Convalidados" del resumen estadístico se mantienen sin cambios (ya existían en el Decreto 91/2024 original).
5. **Anexos XI a) y XI b)** — único añadido de fondo: una nota al pie nueva, idéntica en ambos: *"Nota: Una vez cumplimentado y firmado este Anexo se expedirán tres ejemplares: para el centro de formación, para la empresa u organismo equiparado y **para el/la alumno/a**"*. Se mantienen las notas al pie de XI b): *"Superado / No Superado. Se considerará 'Superado' cuando el valor medio de la evaluación de las actividades de cada RA sea superior a 2"* y *"De 1 a 4"* (ambas ya venían del Decreto 107/2025).

**No aparece en el documento** ninguna regla de convalidación o exención, ningún plazo, ningún órgano competente, ninguna lista de documentación exigible al alumnado ni la expresión "CV-5". Búsqueda por palabras clave sobre el texto extraído: "exención"/"exento" → 0 apariciones; "plazo" → 0; "experiencia laboral" → 0; "dos meses" → 0; "convalid*" → solo en las leyendas de calificaciones, en el epígrafe "Convalidados" del resumen estadístico del anexo II y en el rótulo "Módulo/Ámbito convalidado". [V]

### 2.2 Documento CSV `CSVH42570R2KK1W0XFIL` (Corrección de errores de 16/01/2026) — 3 páginas

Contiene solo los anexos **V** (págs. 1-2) y **VII** (pág. 3), en su redacción definitiva. Diferencias respecto de la versión de 3/12/2025: [V]

1. **Se añade la modalidad de enseñanza al cuerpo del certificado**, en ambos anexos: *"…regulado por el Real Decreto ____ y por la Orden ____, **en la modalidad ___________________ (Presencial / Semipresencial / Virtual / Modular)**, que:"*. En la versión de 3/12/2025 esa mención no existía.
2. **Se reescribe la segunda página del anexo V.** Antes (3/12/2025): *"Relación de Estándares de Competencias Profesionales del Catálogo Nacional de Estándares de Competencias Profesionales incluidas en el título (extracto del Anexo del Real Decreto ____ (BOE ____) …)"*, con un cuadro de cuatro columnas *"Módulos profesionales superados (Código, Denominación, RD) | Estándares de competencias acreditables (Código, Denominación)"*. Ahora: *"Relación de Estándares de Competencias Profesionales **acreditados por los módulos profesionales superados** incluidos en el título (según el Anexo del Real Decreto ____ …)"*, con un cuadro simple de dos columnas *"Código | Denominación"*.
3. Ajuste tipográfico de la leyenda (*"5,6,7,8,9,10 o SU, BI, NT o SB"* → *"5,6,7,8,9 o 10 / SU, BI, NT o SB"*).
4. **La línea "Módulo/Ámbito convalidado — CV o CV-Nota" se mantiene idéntica** en ambos anexos. [V]

Búsqueda por palabras clave: "exención", "plazo", "CV-5", "documentación" → 0 apariciones. [V]

---

## 3. Conclusión: impacto sobre la herramienta

### 3.1 ¿Contienen reglas de convalidación, exención, calificación, plazos o documentación?

| Pregunta | Respuesta | Fundamento |
|---|---|---|
| ¿Reglas de **convalidación**? | **NO.** Los ocho anexos sustituidos son modelos formales (expediente, actas, informes, certificados, plan de formación). La normativa material de convalidaciones está en el **anexo VIII** ("Indicaciones en materia de convalidaciones"), que **no** figura entre los anexos sustituidos por ninguno de los dos documentos. | Encabezados e índice del consolidado v5 [V]; texto íntegro de ambos PDF [V] |
| ¿Reglas de **exención**? | **NO.** La única huella de la exención es la columna del anexo II *"Realizada formación en empresa (SÍ/NO/EX)"*, que ya existía en el Decreto 91/2024 original y no se modifica. Los requisitos de la exención siguen en los arts. 49-51 del Decreto. | Cotejo con el texto original [V] |
| ¿Reglas de **calificación ("CV", "CV-5")**? | **NO cambian.** Los anexos solo recogen la *leyenda* "CV o CV-Nota", con redacción idéntica a la de 2024 y a la del Decreto 107/2025. La expresión **"CV-5" no aparece en ninguno de los dos documentos**: vive exclusivamente en el anexo VIII (puntos 17, 18, 19, 22, 23 y 24), no tocado. | Texto íntegro de ambos PDF [V]; anexo VIII del consolidado v5 [V] |
| ¿**Plazos**? | **NO.** Ninguno de los documentos menciona plazos. Los del procedimiento siguen en los arts. 50 y 52-53. | [V] |
| ¿**Documentación exigible al alumno**? | **Un único matiz, indirecto** (ver 3.2). Los anexos no enumeran documentación; pero el anexo XI b) *es* un documento que el alumnado debe aportar, por remisión de otra norma. | [V] |

### 3.2 El único punto con relevancia práctica: el anexo XI b)

La **Resolución de 24/11/2025** (ya documentada como regla E16 en `aragon-formacion-empresa-2025.md`) exige, para reducir proporcionalmente las horas de formación en empresa por convalidación o traslado de nota de un módulo dualizado, aportar *"junto a la solicitud de convalidación o traslado de nota, una **copia del Plan de formación (Evaluación) de las enseñanzas aportadas, de acuerdo con el anexo XI b) del Decreto 91/2024**"*.

El nuevo anexo XI b) **añade** la nota: *"Una vez cumplimentado y firmado este Anexo se expedirán tres ejemplares: para el centro de formación, para la empresa u organismo equiparado y para el/la alumno/a"*. [V]

Es un dato útil para la herramienta, pero **no altera ninguna regla**: confirma que el alumnado dispone de un ejemplar propio del documento que se le pide, es decir, que el requisito documental de E16 es materialmente exigible. Se puede incorporar como texto de ayuda en el checklist, no como regla nueva. [INF en cuanto al uso; el texto de la nota es [V]]

### 3.3 ¿Hay que cambiar algo en la herramienta?

**No.** La herramienta usa el **anexo VIII** para las tablas de convalidación (`data/normativa.js`, con citas del tipo "Aragón Anexo VIII ap. 3" y "Anexo VIII ap. 21") y los **arts. 48-53** para el procedimiento. Ninguna de las dos cosas se ve afectada:

- El anexo VIII **no está** entre los anexos sustituidos. Sus modificaciones reales (puntos 15, 16 y 17 del apartado 6, y la nueva redacción del apartado 5) vienen **en el propio texto** de la Resolución de 3/12/2025 y de la corrección de 16/01/2026, ya leídas y documentadas en `aragon-formacion-empresa-2025.md` §3.4. **Ese sigue siendo el trabajo pendiente sobre la herramienta (reglas C3, C6, C12, C20)**, y este informe no lo cambia ni lo amplía. He confirmado de paso que el consolidado v5 recoge esos tres puntos y la redacción corregida del apartado 5. [V]
- El mapa de calificaciones de `data/normativa.js` (`tabla: 'CV-nota …'`, `uc: 'CV-5 (computa como 5)'`, `sin_nota: 'CV (sin nota, no computa en la media)'`, `loe_logse: 'CV-nota (Aragón, Anexo VIII ap. 21)'`) es **coherente** con lo leído: los anexos formales admiten "CV o CV-Nota" como leyenda genérica, y el anexo VIII —no tocado— sigue diciendo que las convalidaciones por acreditación de competencias o certificado de profesionalidad se registran como *"'Convalidado' con la expresión 'CV-5'"* (punto 19) y que *"En aquellos casos en los que se haya convalidado un módulo con la expresión 'CV-5', éste computará como 5 a efectos de cálculo de la nota media"* (punto 24). [V]
- Los arts. 48-53 no se modifican por estos documentos, que solo sustituyen modelos formales. [V]

**Impacto neto de los anexos sustituidos sobre el motor de reglas: ninguno.** Son cambios de formulario (leyenda ampliada para los ámbitos de Grado Básico, mención de la modalidad de enseñanza en los certificados, reestructuración de la relación de estándares de competencias y maquetación).

---

## 4. Qué NO he podido comprobar

1. **El texto dispositivo de la Resolución de 3/12/2025 y de la corrección de 16/01/2026 no se ha releído en esta consulta.** Doy por buenas las citas de `aragon-formacion-empresa-2025.md` §3.4, que las declara leídas íntegras [V allí]. Lo que sí he verificado de forma independiente es que el consolidado v5 incorpora los puntos 15, 16 y 17 del anexo VIII y la redacción corregida de su apartado 5, lo que concuerda con esas citas. [V]
2. **No he localizado un enlace de descarga directa "oficial"** del tipo formulario web: la SPA de `mia.aragon.es` no lo expone en el HTML y he tenido que reconstruir las rutas de la API a partir de sus bundles JavaScript. Las URLs de la sección 0 funcionan hoy sin autenticación, pero **no son URLs publicadas ni documentadas** y podrían cambiar. No he probado el flujo interactivo del formulario de verificación por CSV en navegador. [NV]
3. **No he buscado estos anexos en educa.aragon.es.** No hizo falta, porque la descarga desde `mia.aragon.es` funcionó; y el consolidado v5 de educa.aragon.es ya contiene la versión final de los anexos. No he revisado la sección de "formación dual / documentación de la formación en empresa" de educa.aragon.es por si publica los anexos en formato editable. [NV]
4. **El cotejo se ha hecho sobre el texto extraído del PDF, no sobre la imagen renderizada.** Los cambios que sean puramente de formato gráfico (bordes, sombreados, orden de columnas dentro de una tabla, casillas de verificación) pueden no reflejarse en el diff. Los cambios de contenido textual sí. [NV en cuanto a lo puramente gráfico]
5. **La versión "anterior" usada para el cotejo es la del Decreto 107/2025** (BOA 18/09/2025), porque el consolidado de 14/10/2025 de educa.aragon.es trae los anexos como **imagen** y de él no se puede extraer texto (la extracción devuelve solo los títulos "ANEXO I — Expediente académico", etc.). Si entre el Decreto 107/2025 y la Resolución de 3/12/2025 hubiera habido alguna otra modificación de estos anexos, se me habría atribuido erróneamente a la Resolución. No he buscado normas intermedias. [NV]
6. **No he comprobado si existe una versión consolidada posterior a la v5** ni si algún anexo ha vuelto a sustituirse después del 16/01/2026. La búsqueda de vigencia documentada en `aragon-formacion-empresa-2025.md` §1 llega hasta 20/09/2026, pero se basó en búsquedas por título del BOA, no por texto completo. [NV]
7. **No he leído el documento "FAQs en relación a la nueva LFP"** de educa.aragon.es (versión 07/01/2026), que sigue pendiente desde el informe anterior. [NV]

---

## 5. Fuentes

| Documento | URL |
|---|---|
| **Anexos I, II, III, IV, V, VII, XI a) y XI b) — Resolución de 3/12/2025, CSV `CSV8R0PFO83I71J0XFIL`** (16 págs., leído íntegro) | https://carp-core-mia.aragon.es/rest/documentos/CSV8R0PFO83I71J0XFIL/descargar |
| **Anexos V y VII — Corrección de errores de 16/01/2026, CSV `CSVH42570R2KK1W0XFIL`** (3 págs., leído íntegro) | https://carp-core-mia.aragon.es/rest/documentos/CSVH42570R2KK1W0XFIL/descargar |
| Verificación de firma de ambos CSV (`isFirmaValida: true`) | https://carp-core-mia.aragon.es/rest/documentos/firma/{CSV}/verificar |
| Sede de verificación por CSV (SPA Angular) | https://mia.aragon.es/documentos |
| Configuración de entorno de la SPA (de donde sale `backendUrl`) | https://mia.aragon.es/config/environment.config.json |
| Decreto 91/2024 consolidado v5 (enero 2026, sin valor jurídico) — índice de anexos, anexos I-XI y anexo VIII leídos | https://educa.aragon.es/documents/20126/6133293/Consolidado+Decreto+91_2024+v5+Reducido.pdf/c2391015-c607-b859-f09b-d30f9fdbcd40?t=1767954063086 |
| Decreto 107/2025, de 10/09 (BOA 18/09/2025 nº 181, csv BOA20250918002) — anexos I-VII y XI a)/b) usados como versión anterior | https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1411653420404 |
| Decreto 91/2024, texto original (BOA 06/06/2024 nº 109, csv BOA20240606002) — anexos I-XI usados como referencia de origen | https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VEROBJ&MLKOB=1336515330404 |
| Decreto 91/2024 consolidado a 14/10/2025 — **anexos en imagen, sin texto extraíble** | https://educa.aragon.es/documents/20126/5929931/Decreto+91_2024+Consolidado+con+Decreto+107_2025+actualizado+14-10-2025.pdf/4b22b836-0390-1e9b-baf6-d55a27bc6532 |
| Informe previo sobre la Resolución de 24/11/2025 (contexto y reglas E14-E18) | `research/aragon-formacion-empresa-2025.md` |
