# VerdeBit - Escuela Reducción Monte Verde

Aplicación móvil MVP desarrollada para la Escuela Reducción Monte Verde, orientada a visibilizar y poner en valor los servicios ecosistémicos del Humedal Vegas de Chivilcán.

El proyecto busca conectar a estudiantes de educación básica y sus familias con el ecosistema local mediante recursos educativos digitales, contenido ambiental y elementos de cultura Mapuche.

## Índice

- [Descripción](#descripción)
- [Objetivo del proyecto](#objetivo-del-proyecto)
- [Alcance](#alcance)
- [Estado de implementación](#estado-de-implementación)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Instrucciones de uso](#instrucciones-de-uso)
- [Documentación](#documentación)
- [Roles del equipo](#roles-del-equipo)
- [Distribución del trabajo](#distribución-del-trabajo)

## Descripción

VerdeBit es una aplicación móvil educativa enfocada en el Humedal Vegas de Chivilcán.

El sistema permite que estudiantes, profesores y familias accedan a información sobre flora, fauna, actividades comunitarias, recursos educativos y quizzes interactivos. El objetivo es fortalecer la educación ambiental y el sentido de pertenencia con el entorno natural de la Escuela Reducción Monte Verde.

Este proyecto corresponde a un MVP universitario, por lo que está orientado a una entrega funcional demostrable, sin publicación en tiendas de aplicaciones en esta etapa.

## Objetivo del proyecto

Desarrollar una aplicación móvil que permita visibilizar los servicios ecosistémicos del Humedal Vegas de Chivilcán, promoviendo la educación ambiental, la participación de la comunidad escolar y el aprendizaje interactivo mediante recursos digitales.

## Alcance

### Funcionalidades incluidas

- Autenticación de usuarios con roles:
  - Estudiante
  - Profesor
- Catálogo de flora y fauna del humedal.
- Aula virtual con recursos educativos subidos por profesores.
- Quizzes interactivos.
- Sistema de gamificación con puntos y medallas.
- Calendario comunitario de actividades.
- Módulo "¿Sabías que...?".
- Sección de cultura Mapuche.
- Perfil del estudiante con progreso acumulado.

## Estado de Implementación

Esta primera versión integra la app móvil con Supabase. Casos de uso conectados a datos reales:

| Caso de uso | Estado |
| --- | --- |
| Autenticación con roles (login, sesión persistente, cierre de sesión) | ✅ Integrado |
| Catálogo de flora y fauna | ✅ Integrado |
| Quizzes interactivos (jugar, puntos y medallas) | ✅ Integrado |
| Gestión de quizzes del profesor (crear, editar, estadísticas) | ✅ Integrado |
| Perfil y gamificación (puntos, nivel, medallas) | ✅ Integrado |
| Aula virtual con recursos educativos | ⏳ Interfaz lista, pendiente de conexión |
| Calendario comunitario de actividades | ⏳ Interfaz lista, pendiente de conexión |
| Módulo "Sabías que..." y cultura Mapuche | ⏳ Interfaz lista, pendiente de conexión |

El backend (migraciones, RLS y triggers) cubre los ocho casos de uso; las tres pantallas pendientes ya tienen su capa de API lista y se conectarán en una próxima iteración.

## Tecnologías utilizadas

| Capa | Tecnología |
| --- | --- |
| Frontend / App móvil | React Native + Expo |
| Navegación | Expo Router |
| Backend / Base de datos | Supabase (PostgreSQL) |
| Integración | supabase-js + TypeScript |
| Lógica de negocio | Triggers y Row Level Security |
| Control de versiones | Git + GitHub |

## Estructura del Proyecto

```text
.
├── data/            # Datos base del humedal, catastros y placeholders
├── docs/            # Documentación del proyecto, objetivos y acuerdos
├── src/
│   └── frontend/    # App móvil React Native / Expo
├── supabase/
│   ├── migrations/  # Migraciones SQL
│   └── seed/        # Datos iniciales para poblar la base
└── README.md
```

## Instrucciones de Uso

### 1. Configurar Supabase

Crear un proyecto en Supabase y ejecuta los scripts SQL en este orden desde el SQL Editor:

```text
supabase/migrations/0001_schema.sql
supabase/migrations/0002_functions_triggers.sql
supabase/migrations/0003_rls_policies.sql
supabase/migrations/0004_security_hardening.sql
supabase/migrations/0005_award_threshold_badges.sql
```

Opcional (datos de ejemplo para el catálogo, medallas y quizzes):

```text
supabase/seed/seed.sql
```

### 2. Configurar variables del frontend

Crear el archivo local de entorno:

```bash
cd src/frontend
cp .env.example .env
```

Completar en `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

### 3. Instalar y ejecutar la app

```bash
cd src/frontend
npm install
npm run lint
npm run start
```

Con `npm run start`, Expo permite abrir la app en Expo Go.

### 4. Acceso a la app

El ingreso es por correo y contraseña; el rol (estudiante o profesor) se determina automáticamente desde `profiles.role`. Todo usuario registrado nace como `student`; para convertir una cuenta en profesor se actualiza el rol desde Supabase (ver [Contrato API](docs/CONTRATO_API.md)).

## Documentación

- [Contrato API](docs/CONTRATO_API.md)
- [Estado del proyecto y plan de cierre](docs/ESTADO_PROYECTO.md)

## Roles del equipo

| Integrante | Rol | Responsabilidades principales |
|---|---|---|
| Felipe Delgado | Backend — Supabase & API | Base de datos, autenticación, RLS, Storage, triggers y documentación técnica |
| Diego Aido | Frontend — React Native / Expo | Pantallas, navegación, componentes visuales, diseño y experiencia de usuario |
| Diego Jerez | Integración — SDK & QA | Conexión con Supabase, hooks, servicios, pruebas e integración general |

## Distribución del trabajo

La organización del desarrollo se realizó considerando el rol de cada integrante, el historial de implementación del proyecto y la reutilización de componentes ya desarrollados.

El objetivo es mantener una distribución coherente con las responsabilidades técnicas de cada área, evitando duplicar trabajo ya implementado y concentrando las tareas restantes en la integración de funcionalidades pendientes.

### Casos de uso y responsables

| Caso de uso                              | Responsable principal | Apoyo          |
| ---------------------------------------- | --------------------- | -------------- |
| Autenticación con roles                  | Felipe Delgado        | -              |
| Catálogo de flora y fauna                | Felipe Delgado        | Diego Jerez    |
| Quizzes interactivos                     | Felipe Delgado        | Diego Jerez    |
| Gestión de quizzes del profesor          | Felipe Delgado        | Diego Aido     |
| Perfil y gamificación                    | Felipe Delgado        | Diego Jerez    |
| Aula virtual                             | Diego Jerez           | Felipe Delgado |
| Calendario comunitario                   | Diego Jerez           | Diego Aido     |
| Módulo "Sabías que..." y Cultura Mapuche | Diego Aido            | Diego Jerez    |
| Gestión de estudiantes                   | Diego Aido            | Felipe Delgado |
| Integración final y pruebas              | Diego Jerez           | Todo el equipo |

### Tareas pendientes — Prioridad alta

| # | Tarea | Responsable | Estimación |
|---|---|---|---|
| 1 | Conectar **Aula** a `recursos/api.ts` (quitar mock + wirear FAB → create) | Diego Jerez | 1 día |
| 2 | Conectar **Eventos** a `calendario/api.ts` (quitar mock, formatear fechas) | Diego Jerez | 0.5 día |
| 3 | Crear pantalla **"Sabías que / Mapuche"** usando `contenido/api.ts` | Diego Aido | 1.5 días |
| 4a | **Edge Function** `gestionar-estudiantes` (crear/eliminar, validando rol teacher) | Felipe | 1.5 días |
| 4b | Policy RLS: `teacher` puede leer perfiles de estudiantes; `enable_signup = false` | Felipe | 0.5 día |
| 4c | Pantalla profesor: **lista de estudiantes + crear + eliminar** | Diego Aido | 2 días |
| 4d | `lib/estudiantes/api.ts` que invoca la Edge Function (`functions.invoke`) | Diego Jerez | 0.5 día |
| 5 | **Anti-farmeo de puntos**: premiar solo el primer intento por quiz (o tope), en el trigger | Felipe | 0.5 día |

### Tareas pendientes — Prioridad media

| # | Tarea | Responsable | Estimación |
|---|---|---|---|
| 6 | Atar puntos al `score` | Felipe | 0.5 día |
| 7 | Corregir `getQuizStats`| Felipe | 0.5 día |
| 8 | Manejar errores visibles en el flujo de quiz | Diego Jerez | 0.5 día |
| 9 | **QA / pruebas manuales** de los casos de uso + permisos RLS por rol | Diego Jerez | 1.5 días |
| 10 | Seeds de demo: `events`, `educational_resources`, `did_you_know`, `mapuche_content` | Felipe | 0.5 día |

### Carga estimada por persona

- **Diego Jerez (Integración/QA):** tareas 1, 2, 4d, 8, 9 → ~**4 días**.
- **Diego Aido (Frontend):** tareas 3, 4c → ~**3.5 días**.
- **Felipe (Backend):** tareas 4a, 4b, 5, 6, 7, 10 → ~**4 días**.

### Participación estimada del desarrollo

La siguiente distribución considera tanto el trabajo ya implementado como las tareas pendientes hasta el cierre del MVP.

| Integrante     | Participación estimada |
| -------------- | ---------------------: |
| Felipe Delgado |                   45 % |
| Diego Aido     |                   30 % |
| Diego Jerez    |                   25 % |

La mayor participación corresponde al desarrollo de la arquitectura base del proyecto, diseño del modelo de datos, implementación de migraciones, autenticación, políticas de seguridad (RLS), triggers, APIs de negocio e integración principal con Supabase, componentes que sustentan el funcionamiento del resto de los módulos de la aplicación.
