# Búsqueda en Estadísticas

La página de estadísticas ahora incluye una funcionalidad de búsqueda completa que carga dinámicamente todos los ciclos del catálogo.

## Características

### 1. Búsqueda por nombre, código o módulos
- Busca en el nombre completo del ciclo
- Busca en el código del ciclo (ej: ADG201, IFC303)
- Busca en los nombres de los módulos del ciclo
- Búsqueda en tiempo real mientras escribes

### 2. Filtro por familia profesional
- Selecciona de un dropdown cargado dinámicamente con todas las familias del catálogo
- Se filtran automáticamente los resultados según la familia seleccionada
- Opciones:
  - Administración y Gestión
  - Agraria
  - Comercio y Marketing
  - Electricidad y Electrónica
  - Energía y Agua
  - Hostelería y Turismo
  - Informática y Comunicaciones
  - Sanidad
  - Y muchas más...

### 3. Filtro por grado
- Grado Básico
- Grado Medio
- Grado Superior

### 4. Resultados dinámicos
- Muestra los 165 ciclos documentados del catálogo
- Las tarjetas de ciclos se generan dinámicamente
- Cada tarjeta muestra:
  - Nombre completo del ciclo
  - Código único (ej: ADG201)
  - Familia profesional
  - Número de módulos
  - Plan de estudios (LOE, LO 3/2022)
  - Badge con el grado (Grado Básico, Grado Medio, Grado Superior)

### 5. Contador de resultados
- Se actualiza automáticamente según los filtros aplicados
- Muestra cuántos ciclos coinciden con los criterios de búsqueda

## Fuente de datos

Los datos de los ciclos se cargan desde:
- `data/ciclos_index.js` - Índice de todos los ciclos con información básica
- Este archivo se generó a partir de todos los archivos individuales de ciclos en `data/ciclos/`

## Cómo usar

1. Accede a la página de estadísticas
2. (Opcional) Escribe en el campo "Buscar ciclo o módulo" para buscar por nombre, código o módulos
3. (Opcional) Selecciona una familia profesional del dropdown
4. (Opcional) Selecciona un grado (Básico, Medio, Superior)
5. Los resultados se actualizan automáticamente

## Nota técnica

Para que la búsqueda funcione correctamente:
- El archivo debe servirse a través de HTTP (no como file://)
- Esto es necesario porque los navegadores modernos requieren protocolos HTTP/HTTPS para cargar archivos JavaScript externos

Para servir localmente:
```bash
# En el directorio del proyecto
python3 -m http.server 8000
# Luego accede a http://localhost:8000/estadisticas.html
```
