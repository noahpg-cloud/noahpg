# Prompt: sistema de detección de progresión y mesociclos adaptativos (GymTracker AI)

## Rol
Actúa como desarrollador senior de JavaScript y como experto en ciencias del entrenamiento de fuerza e hipertrofia en deportistas naturales (sin dopaje). Vas a añadir a GymTracker AI un sistema que detecte la evolución del rendimiento y programe mesociclos adaptados.

## Antes de escribir código
1. Inspecciona la estructura real del proyecto (archivos, modelo de datos en localStorage, cómo se guardan sesiones, ejercicios y rutinas, navegación). No asumas nada.
2. Resume en pocas líneas cómo vas a integrarlo y qué datos nuevos necesitas. Espera confirmación solo si hay decisiones de diseño ambiguas.
3. Busca y contrasta la evidencia científica indicada abajo. Cita fuente (autor, año) de cada regla que implementes y marca su nivel de evidencia: meta-análisis / ensayo controlado / heurística de práctica (por ejemplo, MEV/MAV/MRV son heurísticas útiles, no leyes). No inventes referencias: si no puedes verificar algo, dilo.

## Objetivo
1. Detectar por ejercicio y por grupo muscular si el usuario está en **progreso**, **estancamiento**, **regresión** o **datos insuficientes**.
2. Una sección nueva **Planes / Mesociclos** donde el usuario introduce datos y responde preguntas de feedback.
3. Generar y programar automáticamente el siguiente mesociclo según el rendimiento detectado y el feedback, explicando cada decisión.

## 1. Detección de progresión
- Calcular el 1RM estimado (e1RM) de cada serie efectiva (fórmulas Epley/Brzycki; solo fiable con pocas repeticiones, ≤10-12) y también el volumen-carga y las repeticiones a carga constante.
- Tendencia sobre una ventana móvil (mínimo 3-4 exposiciones al ejercicio) con umbrales **configurables**. Tolerar ruido normal entre sesiones: no marcar estancamiento por una mala sesión.
- Tener en cuenta factores de confusión: cercanía al fallo (RIR/RPE registrado), sesiones saltadas, cambios de ejercicio o de rango de repeticiones, semanas de descarga. Si faltan datos, estado "datos insuficientes", nunca una conclusión forzada.
- Volumen semanal por grupo muscular (series efectivas) y su relación con el rendimiento.
- Señales de alerta de regresión (caída sostenida de rendimiento + feedback negativo de sueño, fatiga o dolor).

## 2. Motor de mesociclos
Reglas basadas en evidencia, todas parametrizables:
- **Sobrecarga progresiva**: doble progresión (subir repeticiones dentro de un rango y luego carga) como método por defecto.
- **Volumen**: dosis-respuesta con rendimientos decrecientes (p. ej. Schoenfeld 2017; Baz-Valle 2022). Rampa de volumen a lo largo del bloque entre un mínimo efectivo y un máximo recuperable por grupo muscular, con topes de seguridad.
- **Frecuencia**: ≥2 veces por semana por grupo muscular cuando sea posible (Schoenfeld 2016, 2019); el volumen total pesa más que la frecuencia.
- **Intensidad de esfuerzo**: autorregulación por RIR/RPE (Zourdos 2016; Helms), cercanía al fallo (Refalo 2023). Estructura típica: RIR descendente a lo largo del bloque.
- **Rango de repeticiones**: hipertrofia similar en rangos amplios (≈5-30) con esfuerzo cercano al fallo; fuerza máxima favorece cargas altas.
- **Descargas (deload)**: programarlas según fatiga acumulada y duración del bloque, no por calendario fijo. Evidencia limitada: indicarlo en la explicación.
- **Estructura**: bloque de acumulación de 4-6 semanas + semana de descarga, con opción de ajustar duración.

Lógica de adaptación (ejemplos, a refinar con la evidencia):
- Progreso + buena recuperación → mantener o subir ligeramente el volumen.
- Estancamiento → primero revisar feedback (sueño, estrés, calorías, adherencia, técnica); después ajustar volumen (subir si hay buena recuperación, bajar si hay fatiga), cambiar rango de repeticiones o variante del ejercicio.
- Regresión → descarga y reducción de volumen, y comprobar factores externos.
- Ajustes por grupo muscular según estímulo percibido, agujetas/recuperación y rendimiento.

## 3. Sección Planes / Mesociclos (UI)
- Resumen del mesociclo actual: semana, volumen por grupo, estado de progresión por ejercicio con mini-gráficas SVG.
- Formulario de datos opcionales: peso corporal, objetivo (hipertrofia/fuerza/mixto), días disponibles, nivel de experiencia, lesiones o limitaciones.
- Cuestionario de feedback semanal y de fin de bloque: rendimiento percibido, estímulo/pump, fatiga, agujetas, dolor articular, sueño, estrés, motivación, adherencia, tendencia de peso corporal.
- Botón "Generar siguiente mesociclo" que produce el plan, lo guarda como rutinas programadas y muestra **por qué** se tomó cada decisión (regla, dato que la activó y fuente).
- El usuario puede editar o rechazar cualquier ajuste antes de aplicarlo.

## 4. Restricciones técnicas
- Respetar la arquitectura actual: sin backend, persistencia en localStorage, inicialización de estado compatible con datos antiguos (migración sin perder historial), gráficas en SVG.
- No eliminar comentarios existentes; comentar el código nuevo, sobre todo las reglas científicas con su fuente.
- Toda la lógica de decisión en funciones puras y testeables, separada de la UI, con constantes y umbrales en un único objeto de configuración.
- Seguridad: topes máximos de incremento de carga y de volumen semanal, y aviso de que ante dolor o lesión se pare y se consulte a un profesional. La app no da consejo médico.
- Interfaz en español.

## 5. Forma de entrega
- Cambios incrementales por pasos (modelo de datos → detección → motor de mesociclos → UI → feedback), cada paso funcional por separado.
- Código completo y listo para copiar, indicando en qué archivo y posición va cada bloque.
- Al final: lista de las reglas implementadas con su fuente y nivel de evidencia, y casos de prueba con datos de ejemplo (progreso, estancamiento, regresión, datos insuficientes).

## Criterios de aceptación
- Con datos de ejemplo, clasifica correctamente progreso, estancamiento, regresión y datos insuficientes.
- El plan generado cambia de forma coherente según el feedback introducido.
- Cada decisión es explicable en la interfaz.
- Los datos antiguos siguen funcionando.
