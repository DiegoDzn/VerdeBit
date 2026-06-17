# Estado del proyecto y plan de cierre

Este documento resume el estado de avance de VerdeBit y las tareas pendientes
para cerrar el MVP. Complementa la [distribución del trabajo](../README.md#distribución-del-trabajo)
y el [Contrato API](CONTRATO_API.md)

## Resumen

VerdeBit cuenta con su backend completo en Supabase (migraciones, RLS, triggers y
seed) cubriendo los ocho casos de uso. La app móvil integra cinco de ellos contra
datos reales; los tres restantes tienen su capa de API lista y quedan pendientes de
conexión en el frontend

## Casos de uso

| Caso de uso | Backend | Frontend |
| --- | --- | --- |
| Autenticación con roles | ✅ | ✅ |
| Catálogo de flora y fauna | ✅ | ✅ |
| Quizzes interactivos | ✅ | ✅ |
| Gestión de quizzes del profesor | ✅ | ✅ |
| Perfil y gamificación | ✅ | ✅ |
| Aula virtual con recursos | ✅ | ⏳ pendiente de conexión |
| Calendario comunitario | ✅ | ⏳ pendiente de conexión |
| "Sabías que..." y cultura Mapuche | ✅ |  pendiente de conexión |
| Gestión de estudiantes | ✅ Edge Function |  pantalla pendiente |

## Backend

- Migraciones `0001`–`0006` aplicadas: esquema, funciones y triggers, políticas
  RLS, hardening de seguridad, medallas por umbral y puntos justos por quiz
- Gamificación: los puntos se otorgan una sola vez por quiz y se
  escalan según el desempeño del estudiante
- Edge Function `gestionar-estudiantes`: permite a un profesor crear y eliminar
  cuentas de estudiante
- Registro público de usuarios deshabilitado (`enable_signup = false`): las cuentas
  de estudiante se crean a través de la Edge Function.
- Seed con datos de demo para catálogo, medallas, quizzes, eventos, recursos
  educativos, "Sabías que..." y contenido Mapuche

## Tareas pendientes para el cierre

| # | Tarea | Responsable |
| --- | --- | --- |
| 1 | Conectar Aula a `recursos/api.ts` (quitar mock, wirear FAB → crear) | Diego Jerez |
| 2 | Conectar Eventos a `calendario/api.ts` (quitar mock, formatear fechas) | Diego Jerez |
| 3 | Pantalla "Sabías que / Mapuche" usando `contenido/api.ts` | Diego Aido |
| 4 | Pantalla profesor: lista de estudiantes + crear + eliminar | Diego Aido |
| 5 | `lib/estudiantes/api.ts` que invoca la Edge Function | Diego Jerez |
| 6 | Manejo de errores visibles en el flujo de quiz | Diego Jerez |
| 7 | QA / pruebas manuales de los casos de uso + permisos RLS por rol | Diego Jerez |

## Cómo levantar el proyecto

Ver [Instrucciones de uso](../README.md#instrucciones-de-uso) en el README
