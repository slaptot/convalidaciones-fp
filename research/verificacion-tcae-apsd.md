# Verificación: ¿qué convalida el título de TCAE (LOGSE) en el ciclo de APSD?

Fecha de la verificación: **29/09/2026**.
Motivo: una resolución de un centro de Aragón (IES de Calatayud, octubre de 2026) convalida a una alumna **cinco** módulos de APSD aportando **únicamente** el título completo de Técnico en Cuidados Auxiliares de Enfermería (LOGSE, RD 546/1995): **0020, 0216, 0213, 0212 y 0211**, y **no** incluye el **0217**. Nuestro `research/apsd.json` dice que ese título convalida **0216, 0217 y 0020**.

Marcas usadas: **[L]** = leído literalmente en la fuente citada. **[I]** = inferencia mía a partir de lo leído.

---

## 0. Veredicto rápido

**Nuestros datos son correctos.** Los tres módulos que recoge `apsd.json` (0216, 0217, 0020) son exactamente los que la norma vigente atribuye al ciclo completo de TCAE. **No existe ninguna tabla, en ninguna de las normas revisadas, que convalide 0211, 0212 o 0213 aportando el título de TCAE**, y **no existe ninguna fila que convalide 0216 sin convalidar a la vez 0217**: ambos códigos están en la misma celda. [L]

La resolución del centro, con los datos aportados (solo el título de TCAE), **convalida de más en tres módulos (0211, 0212, 0213) y de menos en uno (0217)**. [I]

---

## 1. Fuentes consultadas

| Norma | URL | Estado |
|---|---|---|
| RD 1085/2020, texto consolidado (BOE-A-2020-17274) | https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274 | Leído íntegro (85 tablas de los anexos I–IV parseadas) [L] |
| RD 1593/2011, **texto original** (BOE-A-2011-19542) | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-19542 | Leído íntegro: arts. 14 y 15, disp. ad. 3.ª y anexos IV, V A) y V B) [L] |
| RD 499/2024 (BOE-A-2024-10684) | https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10684 | Leído: apartado «Diecinueve» (modificación del RD 1593/2011), artículo sexto (nuevo art. 15) y relación de preceptos modificados [L] |
| RD 659/2023, consolidado (BOE-A-2023-16889) | https://www.boe.es/buscar/act.php?id=BOE-A-2023-16889 | Leídos arts. 125 a 131 [L] |
| Aragón, Decreto 91/2024, **consolidado oficioso v5** (238 págs., sello «TEXTO SIN VALOR JURÍDICO») | https://educa.aragon.es/documents/20126/6133293/Consolidado+Decreto+91_2024+v5+Reducido.pdf/c2391015-c607-b859-f09b-d30f9fdbcd40?t=1767954063086 | Anexo VIII leído íntegro (págs. 175–181) + búsqueda por palabras clave en las 238 páginas [L] |

---

## 2. (a) Filas literales encontradas, con ubicación exacta

He extraído las **85 tablas** de los anexos del RD 1085/2020 y buscado, en ambas columnas, «Cuidados Auxiliares de Enfermería», los códigos 0210–0217, 0831, 0020, «Atención a Personas en Situación de Dependencia» y «Atención Sociosanitaria».

Control de exhaustividad: la expresión «Cuidados Auxiliares de Enfermería» aparece **30 veces** en el texto consolidado completo y **las 30** están dentro de tablas de los anexos, todas capturadas. No hay ninguna mención en el articulado ni en notas al pie. [L]

### 2.1 Filas en las que se APORTA el título de TCAE

Estas son **todas** las filas del RD 1085/2020 en las que el TCAE figura en la columna «Formación aportada» frente a un título LOE.

**ANEXO II — cuadro «Convalidaciones del módulo profesional 0020 Primeros Auxilios»**
(«Formación aportada: Módulos Profesionales de diferentes títulos regulados por la Ley Orgánica 1/1990» → «Formación a convalidar: Módulos profesionales de diferentes títulos regulados por la Ley Orgánica 2/2006»)

| Formación aportada | Formación a convalidar |
|---|---|
| Técnico en Cuidados Auxiliares de Enfermería | Cualquier ciclo formativo de cualquier familia profesional en el que aparezca |
| Ciclo completo | 0020. Primeros auxilios |

[L] — https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274

**ANEXO II — cuadro «Servicios Socioculturales y a la Comunidad», bloque GRADO MEDIO**

| Formación aportada | Formación a convalidar |
|---|---|
| Técnico en Cuidados Auxiliares de Enfermería (RD 546/1995, 7 de abril) (Sanidad) | Técnico en Atención a personas en situación de Dependencia (RD 1593/2011, de 4 de noviembre) |
| Ciclo completo | 0216. Atención sanitaria. 0217. Atención higiénica. |

[L] — https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274

> **Nota sobre la celda.** En el HTML del BOE, «0216. Atención sanitaria.» y «0217. Atención higiénica.» están **en una sola celda** de la columna «Formación a convalidar», separadas por un salto de línea, frente a la única celda «Ciclo completo». Es decir: el ciclo completo de TCAE convalida **los dos módulos a la vez**. No hay forma de leer esta fila como si diera 0216 y no 0217. [L]

**ANEXO II — cuadro «Sanidad», bloque GRADO MEDIO**

| Formación aportada | Formación a convalidar |
|---|---|
| Técnico en Cuidados Auxiliares de Enfermería (RD 546/1995, 7 de abril) | Técnico en Farmacia y Parafarmacia (RD 1689/2007, de 14 de diciembre) |

(Fila de encabezado de bloque; irrelevante para APSD.) [L]

**ANEXO I — cuadro «Servicios Socioculturales y a la Comunidad», bloque GRADO MEDIO** (LOGSE → LOGSE)

| Formación aportada | Formación a convalidar |
|---|---|
| Técnico en Cuidados Auxiliares de Enfermería (RD 546/1995, de 7 de abril) (Sanidad) | Técnico en Atención Sociosanitaria (RD 496/2003, de 2 de mayo) |
| Ciclo completo. | Atención sanitaria. Higiene. |

[L] — Nótese que el TCAE completo convalida **solo dos módulos** del título LOGSE de Atención Sociosanitaria, no el título entero.

### 2.2 Filas en las que se CONVALIDA algo en APSD

**ANEXO II — cuadro «Servicios Socioculturales y a la Comunidad», GRADO MEDIO** (LOGSE → LOE)

| Formación aportada | Formación a convalidar |
|---|---|
| **Técnico en Atención Sociosanitaria (RD 496/2003, de 2 de mayo)** | **Técnico en Atención a Personas en Situación de Dependencia (RD 1593/2011, de 4 de noviembre)** |
| Planificación y control de las intervenciones. | 0210. Organización de la atención a personas en situación de dependencia. |
| Atención sanitaria. | 0216. Atención sanitaria. |
| Higiene. | 0217. Atención higiénica. |
| Atención y apoyo psicosocial. | 0213. Atención y apoyo psicosocial. |
| Apoyo domiciliario. | 0215. Apoyo domiciliario. |
| Necesidades físicas y psicosociales de colectivos específicos. | 0212. Características y necesidades de las personas en situación de dependencia. |
| Comunicación alternativa. | 0214. Apoyo a la comunicación. |

| Formación aportada | Formación a convalidar |
|---|---|
| **Técnico en Cuidados Auxiliares de Enfermería (RD 546/1995, 7 de abril) (Sanidad)** | **Técnico en Atención a personas en situación de Dependencia (RD 1593/2011, de 4 de noviembre)** |
| Ciclo completo | 0216. Atención sanitaria. 0217. Atención higiénica. |

| Formación aportada | Formación a convalidar |
|---|---|
| **Técnico Superior en Integración Social (RD 2061/1995, de 22 de diciembre)** | **Técnico en Atención a Personas en Situación de Dependencia (RD 1593/2011, de 4 de noviembre)** |
| Pautas básicas y sistemas alternativos de comunicación. | 0214. Apoyo a la comunicación. |

[L] — https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274

**ANEXO III — cuadro «Servicios Socioculturales y a la Comunidad», GRADO MEDIO** (LOE → LOE)

| Formación aportada | Formación a convalidar |
|---|---|
| Técnico Superior en Animación Sociocultural y Turística (RD 1684/2011, de 18 de noviembre) → APSD | 1124. Dinamización grupal. → **0211. Destrezas sociales.** |
| Técnico Superior en Mediación Comunicativa (RD 831/2014, de 3 de octubre) → APSD | 0017. Habilidades sociales. → **0211. Destrezas sociales.** |
| Técnico Superior en Educación Infantil (RD 1394/2007, de 29 de octubre) → APSD | 0017. Habilidades sociales. → **0211. Destrezas sociales.** |
| Técnico Superior en Integración Social (RD 1074/2012, de 13 de julio) → APSD | 0017. Habilidades sociales. → **0211. Destrezas sociales.** |
| Técnico Superior en Integración Social (RD 1074/2012, de 13 de julio) → APSD | 0343. Sistemas aumentativos y alternativos de comunicación. → 0214. Apoyo a la comunicación. |
| Técnico Superior en Mediación Comunicativa (RD 831/2014 de 3 de octubre) → APSD | 0343. Sistemas aumentativos y alternativos de comunicación. → 0214. Apoyo a la comunicación. |
| Técnico Superior en Promoción de Igualdad de Género (RD 779/2013, de 11 de octubre) → APSD | 0017. Habilidades sociales. → **0211. Destrezas sociales.** |
| Técnico Superior en Educación y Control Ambiental (RD 384/2011, de 18 de marzo) (Seguridad y Medio-Ambiente) → APSD | 0017. Habilidades sociales. → **0211. Destrezas sociales.** |

[L] — https://www.boe.es/buscar/act.php?id=BOE-A-2020-17274

**ANEXO III — cuadro «Sanidad»**: la única fila con 0020 es «Técnico en Emergencias Sanitarias (RD 1397/2007) → Técnico en Farmacia y Parafarmacia: Ciclo completo → 0020. Primeros auxilios». **ANEXO III — cuadro «Para determinados ciclos formativos»**: «Técnico en Emergencias Sanitarias → Para cualquier ciclo formativo: Ciclo completo → 0020 Primeros auxilios». Ninguna menciona el TCAE. [L]

**ANEXO IV** (títulos publicados a partir del 5/3/2017): contiene **tres tablas** — una de «Cualquier ciclo formativo» (1124↔0017, 1124→1328), una de Comercio y Marketing/Hostelería y Turismo y otra de Transporte y Mantenimiento de Vehículos. **Ninguna menciona el TCAE, el APSD ni ningún módulo 0210–0217, 0831 o 0020.** [L]

---

## 3. (b) Respuestas concretas a las tres preguntas

### ¿Qué convalida el ciclo completo de TCAE en APSD según la norma?

Exactamente tres módulos:

- **0216. Atención sanitaria** — RD 1085/2020, anexo II, cuadro «Servicios Socioculturales y a la Comunidad», GRADO MEDIO. [L]
- **0217. Atención higiénica** — misma fila, misma celda que el 0216. [L]
- **0020. Primeros auxilios** — RD 1085/2020, anexo II, cuadro «Convalidaciones del módulo profesional 0020 Primeros Auxilios» («Cualquier ciclo formativo de cualquier familia profesional en el que aparezca»). [L]

**Es exactamente lo que dice `research/apsd.json`.** [L]

### ¿Hay alguna fila que dé 0211, 0212 o 0213?

Sí, pero **ninguna de ellas se activa con el título de TCAE**:

- **0211. Destrezas sociales**: solo desde módulos de **ciclos LOE de grado superior** (0017 Habilidades sociales o 1124 Dinamización grupal), RD 1085/2020 anexo III. **No hay ninguna vía LOGSE hacia el 0211**, ni por título ni por módulo, en ninguno de los cuatro anexos. [L]
- **0212. Características y necesidades de las personas en situación de dependencia**: una única fila en toda la norma, desde el módulo «Necesidades físicas y psicosociales de colectivos específicos» del título LOGSE de **Atención Sociosanitaria** (RD 496/2003). [L]
- **0213. Atención y apoyo psicosocial**: una única fila en toda la norma, desde el módulo «Atención y apoyo psicosocial» del título LOGSE de **Atención Sociosanitaria**. [L]

Ni el 0211 ni el 0212 ni el 0213 tienen **ninguna** correspondencia con unidades de competencia: el anexo V A) del RD 1593/2011, en su redacción dada por el RD 499/2024, solo asocia UC a los módulos 0210, 0216, 0217, 0213+0214, 0215 y 0831. El 0211 y el 0212 no aparecen. [L] — Por tanto el 0211 y el 0212 **no son convalidables por certificado de profesionalidad ni por acreditación de competencias**, y el 0213 solo lo es aportando la UC2260_2 (antes UC1019_2 / UC0250_2), que además arrastra también el 0214. [L]

### ¿Hay alguna fila que NO dé 0217?

**No**, ninguna en la que intervenga el TCAE. Las dos únicas filas de toda la norma que dan el 0216 (la del TCAE y la de Atención Sociosanitaria) dan el 0217 en el mismo acto:

- TCAE: una sola celda con «0216. Atención sanitaria. 0217. Atención higiénica.» [L]
- Atención Sociosanitaria: dos filas independientes, «Atención sanitaria. → 0216» y «Higiene. → 0217», ambas presentes. [L]
- Anexo V A) del RD 1593/2011 (vía UC): la celda es también conjunta, «0217. Atención higiénica. / 0216. Atención sanitaria.» [L]

**En ninguna fuente aparece el 0216 disociado del 0217.** [L]

---

## 4. (c) Explicación más probable de la resolución del centro

Antes de nada, lo que **he podido descartar leyendo el texto**:

1. **No es la tabla antigua.** El **anexo IV del RD 1593/2011 en su texto original** (hoy derogado) contiene **nueve filas y una sola pareja de títulos**: Atención Sociosanitaria (LOGSE) → APSD. Sus filas son idénticas a las que el RD 1085/2020 recogió después, más dos que este suprimió: «Administración, gestión y comercialización en la pequeña empresa → 0219. Empresa e iniciativa emprendedora» y «Formación en centro de trabajo del título de Técnico en Atención Sociosanitaria → 0218. Formación en centros de trabajo». **El TCAE no aparece ni una sola vez en ese anexo IV.** Aplicar la tabla antigua daría *menos*, no más. [L] — https://www.boe.es/diario_boe/txt.php?id=BOE-A-2011-19542
   (Ese anexo está expresamente derogado: RD 1085/2020, disposición derogatoria única, apartado 2, que cita nominalmente el «Real Decreto 1593/2011, de 4 de noviembre» entre los reales decretos cuyo anexo de convalidaciones queda derogado. [L])

2. **No es la disposición adicional tercera del RD 1593/2011.** Su apartado 1 dice literalmente: «*El título de Técnico en Atención Sociosanitaria, establecido por el Real Decreto 496/2003, de 2 de mayo, tendrá los mismos efectos profesionales y académicos que el título de Técnico en Atención a Personas en Situación de Dependencia establecido en el presente real decreto.*» [L] Habla del título de **Atención Sociosanitaria**, no del de TCAE, y establece una **equivalencia de títulos**, no una tabla de convalidación de módulos. Además, el propio anexo VIII de Aragón, punto 1, cierra esa puerta: «*Los estudios que tengan concedida la equivalencia específica o genérica, a efectos académicos y/o profesionales, con títulos de Formación Profesional… no podrán ser aportados a su vez para la convalidación de módulos profesionales.*» [L]

3. **No es el RD 499/2024.** Este real decreto, en su apartado «Diecinueve», modifica del RD 1593/2011 únicamente el **artículo 6** y sustituye los **anexos V A) y V B)** (correspondencias con unidades de competencia). La relación final de preceptos modificados lo confirma: «*los arts. 2, 6, 10, 12, 15, las referencias indicadas, los anexos I, III, V A) y V B) del Real Decreto 1593/2011*». **No crea ninguna tabla de convalidación entre títulos.** [L] Y el nuevo artículo 15.2.a), en su redacción dada por el artículo sexto del RD 499/2024, remite expresamente: «*Para aquellos títulos establecidos con anterioridad al 5 de marzo de 2017, será de aplicación lo dispuesto en el Real Decreto 1085/2020*». [L] — https://www.boe.es/diario_boe/txt.php?id=BOE-A-2024-10684

4. **No es Aragón.** El **anexo VIII del Decreto 91/2024** («Indicaciones en materia de convalidaciones»), en el consolidado v5 que ya incorpora la Resolución de 3/12/2025 y la corrección de 16/01/2026, **no contiene ninguna tabla por títulos**: es articulado general y procedimiento. Búsqueda por palabras clave sobre las 238 páginas del PDF: «Cuidados Auxiliares» → **0 apariciones**; «situación de dependencia» → **0**; «Sociosanitaria» → **0**; «0211»/«0212»/«0213»/«0216»/«0217» → **0**. [L] Su punto 2 dice: «*Las convalidaciones recogidas en los Anexos I, II, III y IV del Real Decreto 1085/2020… serán de aplicación a los módulos profesionales incluidos en cualquier Ciclo Formativo, con independencia del título de Formación Profesional en el que se reconoce*» — es decir, **remite al RD 1085/2020 y lo extiende a otros ciclos, pero no añade filas nuevas**. [L] Su punto 6.2 atribuye a la dirección del centro la resolución de las convalidaciones LOGSE→LOE «*según se recoge en el Anexo II del Real Decreto 1085/2020*», y el punto 14 precisa que el órgano competente resuelve «*a partir de lo establecido en la normativa vigente*». [L]

5. **El centro no tiene margen de apreciación.** RD 1085/2020, art. 8.1: la resolución de las convalidaciones «*cuyas correspondencias están recogidas en los Anexos I, II, III, y IV*» corresponde a la dirección del centro; art. 10.1: «*resolverán de forma favorable o desfavorable la convalidación solicitada, a partir de lo establecido en este real decreto*». [L] Y el RD 659/2023, art. 127.b).2.º: la convalidación aportando estudios LOGSE «*se solicitará en el centro de formación profesional donde se haya formalizado la matrícula, que resolverá de acuerdo con los anexos del Real Decreto 1085/2020*». [L] No hay ninguna cláusula de similitud de contenidos que permita al centro ampliar la lista.

### Hipótesis [I]

Dado que la alumna aportó **solo** el título de TCAE, y que **no existe ninguna tabla que produzca ese resultado**, la explicación más probable es una de estas dos, ambas inferencias mías:

- **Hipótesis A (la más probable): confusión entre el título de TCAE y el de Técnico en Atención Sociosanitaria.** La lista del centro (0211 aparte) se parece mucho a un subconjunto de la fila de **Atención Sociosanitaria → APSD** del anexo II, que sí da 0212 y 0213. Es un error clásico: los dos títulos son de grado medio, ambos «sanitarios» en sentido amplio, y el propio anexo I del RD 1085/2020 los pone en relación. Posiblemente se aplicó la fila de Atención Sociosanitaria a un título de TCAE. Esto explicaría 0216, 0213 y 0212; el 0020 saldría de la fila transversal; y el 0211 sería un error adicional, porque **ni siquiera la fila de Atención Sociosanitaria da el 0211**. La ausencia del 0217 seguiría sin explicación normativa. [I]
- **Hipótesis B: el 0217 no se convalidó porque ya estaba resuelto por otra vía.** Si la alumna ya tenía el 0217 superado, trasladado o convalidado en una matrícula anterior, no habría nada que convalidar y no figuraría en la resolución. Esto explicaría el hueco del 0217 sin que sea un error, pero **no explica 0211, 0212 ni 0213**. [I]

En cualquier caso, **con solo el título de TCAE, los módulos 0211, 0212 y 0213 no son convalidables**, y eso se puede demostrar con el texto literal: son filas que exigen aportar otra cosa (Atención Sociosanitaria LOGSE para 0212/0213; un módulo 0017 o 1124 de un ciclo LOE de grado superior para 0211). [L]

### Cómo se demuestra en una alegación

1. RD 659/2023, art. 127.b).2.º → el centro resuelve «de acuerdo con los anexos del RD 1085/2020». [L]
2. RD 1085/2020, art. 10.1 → resuelve «a partir de lo establecido en este real decreto». [L]
3. RD 1085/2020, anexo II, cuadro «Servicios Socioculturales y a la Comunidad» → la única fila del TCAE da «0216. Atención sanitaria. 0217. Atención higiénica.», en una sola celda. [L]
4. RD 1085/2020, anexo II y anexo III → el 0212 y el 0213 solo se obtienen aportando módulos del título LOGSE de Atención Sociosanitaria; el 0211 solo aportando 0017 o 1124 de ciclos LOE de grado superior. [L]
5. Aragón, anexo VIII, puntos 1, 2, 6.2 y 14 → Aragón remite al RD 1085/2020 y no añade filas; la equivalencia de títulos no sirve para convalidar módulos. [L]

---

## 5. (d) Cambios a aplicar en `research/apsd.json`

**No hay que corregir ni añadir ninguna fila de convalidación.** El array `convalidaciones_titulos_anteriores` coincide fila a fila con lo leído en el BOE, incluidas las dos filas del TCAE (0216+0217 y 0020) y las ocho filas LOE→LOE del anexo III. [L]

Dos observaciones menores, ambas opcionales:

1. **Recomendado.** La fila del TCAE con `destino_modulos: ["0216","0217"]` debería llevar explícito que ambos códigos van en la **misma celda** del anexo, para que la herramienta nunca los ofrezca por separado. Sugerencia de parche, aplicable tal cual sobre el objeto correspondiente:

```json
{
  "origen_titulo": "Técnico en Cuidados Auxiliares de Enfermería (LOGSE, RD 546/1995)",
  "origen_modulo": "Ciclo completo",
  "destino_modulos": ["0216", "0217"],
  "conjunta": true,
  "fuente": "RD 1085/2020 anexo II, cuadro 'Servicios Socioculturales y a la Comunidad', grado medio. Celda única: '0216. Atención sanitaria. 0217. Atención higiénica.' Verificado 29/09/2026."
}
```

2. **Opcional.** Añadir a `notas` una advertencia para el caso concreto que motivó esta verificación:

```json
"Aportando SOLO el título de TCAE (LOGSE, RD 546/1995) se convalidan únicamente 0216, 0217 y 0020. Los módulos 0211, 0212 y 0213 NO son convalidables con ese título: el 0212 y el 0213 solo se obtienen aportando módulos del título LOGSE de Técnico en Atención Sociosanitaria (RD 496/2003), y el 0211 solo aportando 0017 Habilidades sociales o 1124 Dinamización grupal de un ciclo LOE de grado superior (RD 1085/2020 anexo III). Además, ninguna fila de la norma da el 0216 sin el 0217. Verificado sobre el consolidado del RD 1085/2020 el 29/09/2026."
```

3. **Opcional, para `no_verificado`.** La entrada actual sobre la presunta errata «FCT → 0218» del anexo IV original del RD 1593/2011 queda **confirmada como lectura correcta del BOE**: el texto original dice literalmente «*Formación en centro de trabajo del título de Técnico en Atención Sociosanitaria.*» → «*0218. Formación en centros de trabajo.*», mientras que el anexo I del mismo RD numera el 0218 como Formación y orientación laboral y el 0220 como FCT. [L] Sigue siendo razonable calificarlo de errata del BOE; lo que ya no procede es dudar de la transcripción. Es un punto discutible y, en todo caso, irrelevante hoy: ese anexo está derogado.

---

## 6. (e) Qué no he podido comprobar

- **La resolución del IES de Calatayud.** No la he visto. Todo lo que digo sobre ella procede del enunciado que se me ha dado. No sé si menciona una norma concreta, si distingue entre módulos convalidados y módulos trasladados/ya superados, ni si la alumna tenía matrícula previa. Sin ese documento, las hipótesis A y B no se pueden discriminar.
- **El texto dispositivo de la Resolución de 3/12/2025 de Aragón y su corrección de 16/01/2026.** No los he releído en esta consulta. He trabajado sobre el **consolidado oficioso v5** de educa.aragon.es, que los incorpora pero lleva el sello «TEXTO SIN VALOR JURÍDICO». La afirmación «Aragón no añade tablas propias entre Sanidad y Servicios Socioculturales» está verificada sobre ese consolidado, no sobre el BOA. Para una alegación formal convendría citar el BOA.
- **Instrucciones de inicio de curso o circulares del Servicio Provincial de Zaragoza** para 2026/2027. No las he buscado. Es el hueco más plausible si existiera algún criterio interno; dicho esto, una instrucción autonómica no podría ampliar las tablas del RD 1085/2020, que es norma básica.
- **El currículo aragonés de APSD (Orden ECD/842/2024)**, por si renumerase o refundiese módulos. No lo he abierto en esta verificación; los códigos 0211–0217 que usa la resolución son los estatales.
- **La versión consolidada del RD 1593/2011 en el BOE** (`act.php?id=BOE-A-2011-19542`) devolvió respuesta vacía en dos intentos. He trabajado sobre el **texto original** (`txt.php`), suficiente para el anexo IV original, más el RD 499/2024 para las modificaciones vigentes.
- **Correcciones de errores posteriores al RD 1085/2020** distintas de la de BOE-A-2021-979 (que afecta al apartado 2 de la disposición derogatoria) y de las modificaciones ya incorporadas al consolidado (RD 659/2023 y RD 262/2026). El consolidado que he leído está actualizado a 07/04/2026, en vigor desde 27/04/2026.
