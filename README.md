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

## Roles del equipo

| Integrante | Rol | Responsabilidades principales |
|---|---|---|
| Felipe Delgado | Backend — Supabase & API | Base de datos, autenticación, RLS, Storage, triggers y documentación técnica |
| Diego Aido | Frontend — React Native / Expo | Pantallas, navegación, componentes visuales, diseño y experiencia de usuario |
| Diego Jerez | Integración — SDK & QA | Conexión con Supabase, hooks, servicios, pruebas e integración general |
