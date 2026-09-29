# Convalidaciones FP

Web local para analizar la documentación de solicitudes de convalidación de FP.
Aplica reglas y tablas normativas, sin IA. Ciclos incluidos:

| Ciclo | Código | Grado | Plan |
|---|---|---|---|
| Atención a Personas en Situación de Dependencia | SSC201 | Medio | LO 3/2022 |
| Sistemas Microinformáticos y Redes | IFC201 | Medio | LO 3/2022 |
| Estética y Belleza | IMP202 | Medio | LO 3/2022 |
| Cuidados Auxiliares de Enfermería | SAN201 | Medio | LOGSE |
| Peluquería y Cosmética Capilar | IMP203 | Medio | LO 3/2022 |
| Termalismo y Bienestar | IMP304 | Superior | LO 3/2022 |

Cada ciclo se puede analizar con tres planes: LO 3/2022 en Aragón, LO 3/2022 del Ministerio y LOE a extinguir (con FOL, EIE y FCT). Los cuatro ciclos LOE tienen datos del plan antiguo; TCAE es LOGSE y no lo tuvo.

## Uso

- Abrir `index.html` en el navegador (funciona sin servidor), o bien `python3 -m http.server 8765`.
- El expediente se guarda automáticamente en el navegador. "Guardar expediente" lo exporta a JSON y "Abrir…" lo recupera.
- Cinco documentos imprimibles:
  - "Imprimir anexo": análisis completo con fundamentos y documentación que falta (uso interno).
  - "Imprimir resolución": convalidación de módulos, con apartados separados para convalidación y traslado de nota.
  - "Imprimir exención": formación en empresa.
  - "Solicitudes": una hoja por módulo, con su documentación y el registro de entrada.
  - "Listado provisional": estado por módulo, con el DNI parcialmente oculto.
  Las resoluciones llevan base legal, modo de impugnación y pie de notificación.
- Los datos del membrete, la localidad, la directora o director y la fecha se rellenan en "Datos para la resolución de dirección".
- En `ejemplos/` hay expedientes de muestra: ábrelos con "Abrir…".

## Estructura

- `research/`: investigación normativa con fuentes (BOE, BOA, todofp, CATEDU). Es la fuente de verdad de los datos.
  - `normativa-general.md`: reglas generales con cita de artículo y dudas abiertas.
  - `verificacion-2026-09.md`: comprobación de vigencia a 20/09/2026 y correcciones aplicadas.
  - `certificados.json`: MF/UF por certificado y régimen jurídico de la acreditación parcial acumulable.
  - `aragon-anexos-2025-12.md`: anexos del Decreto 91/2024 sustituidos en 12/2025 (solo modelos; sin efecto en las reglas).
  - `aragon-formacion-empresa-2025.md`: Resolución de 24/11/2025 (duración de la formación en empresa en ciclos de más de 2.000 h; no afecta a la exención).
- `tools/build_data.py`: convierte `research/*.json` en `data/ciclos/*.js`. Hay que ejecutarlo tras editar la investigación.
- `data/normativa.js`: reglas generales (IPE, inglés, formación en empresa, universidad…), documentos y calificaciones.
- `data/certificados.js`: catálogo de certificados de profesionalidad con sus módulos formativos (MF) y unidades formativas (UF), y la UC que acredita cada MF.
- `js/engine.js`: motor de reglas.
- `js/app.js`: interfaz.
- `tests/motor.test.js`: pruebas del motor (`node tests/motor.test.js`).

## Añadir un ciclo

1. Crear `research/<ciclo>.json` con la misma estructura que `apsd.json`.
2. Añadir una llamada `build(...)` en `tools/build_data.py`.
3. Incluir el `<script>` en `index.html`.
