# Escuela Monteverde

Aplicación móvil para visibilizar y poner en valor los servicios ecosistémicos del humedal Vegas de Chivilcán, promoviendo la educación ambiental, el sentido de pertenencia y la participación activa de estudiantes y familias vinculadas a la Escuela Monteverde.

## Objetivo General

Visibilizar y poner en valor los servicios ecosistémicos del humedal Vegas de Chivilcán mediante una experiencia digital educativa, participativa y cercana a la comunidad escolar.

## Objetivos Específicos

1. **Catastro didáctico:** identificar de manera interactiva los principales servicios ecosistémicos presentes en el humedal, incluyendo flora y fauna.
2. **Materiales educativos:** diseñar estrategias y recursos adaptados a la comunidad escolar que faciliten la comprensión ecológica del entorno.
3. **Vinculación con el entorno:** ejecutar y gestionar actividades como talleres y recorridos de observación que conecten directamente a las familias con el ecosistema.
4. **Protección ambiental:** fomentar prácticas de cuidado desde el núcleo familiar, consolidando a la comunidad como defensora activa del humedal.

## Alcance

- Autenticación con roles de estudiante y profesor
- Catálogo de flora y fauna del humedal
- Aula virtual con recursos educativos subidos por profesores
- Quizzes interactivos con puntos y medallas
- Calendario comunitario de actividades
- Módulo "Sabías que..." y sección de cultura Mapuche
- Perfil del estudiante con progreso acumulado

## Stack

| Capa | Tecnología |
| --- | --- |
| App móvil | React Native + Expo |
| UI | React Native Paper |
| Navegación | React Navigation |
| Backend / base de datos | Supabase |
| Integración | supabase-js + TypeScript |
| Lógica de negocio | PostgreSQL, triggers y Row Level Security |

## Documentación

- [Contrato API](docs/CONTRATO_API.md)

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
```

Opcional:

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
npm run typecheck
npm run start
```

Con `npm run start`, Expo permite abrir la app en Expo go

## Equipo de Desarrollo

| Integrante | Rol |
| --- | --- |
| Felipe Delgado | Backend - Supabase & API |
| Diego Aido | Frontend - React Native / Expo |
| Diego Jerez | Integración - SDK & QA |
