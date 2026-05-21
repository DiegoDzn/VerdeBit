# Escuela Monteverde

Aplicación móvil para visibilizar y poner en valor los servicios ecosistémicos del humedal Vegas de Chivilcán, promoviendo la educación ambiental, el sentido de pertenencia y la participación activa de estudiantes y familias vinculadas a la Escuela Monteverde.

## Objetivo General

Visibilizar y poner en valor los servicios ecosistémicos del humedal Vegas de Chivilcán mediante una experiencia digital educativa, participativa y cercana a la comunidad escolar.

## Objetivos Específicos

1. **Catastro didáctico:** identificar de manera interactiva los principales servicios ecosistémicos presentes en el humedal, incluyendo flora y fauna.
2. **Materiales educativos:** diseñar estrategias y recursos adaptados a la comunidad escolar que faciliten la comprensión ecológica del entorno.
3. **Vinculación con el entorno:** ejecutar y gestionar actividades como talleres y recorridos de observación que conecten directamente a las familias con el ecosistema.
4. **Protección ambiental:** fomentar prácticas de cuidado desde el núcleo familiar, consolidando a la comunidad como defensora activa del humedal.

### Incluye

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

## Estructura del Proyecto

```text
.
├── data/            # Datos base del humedal, catastros y placeholders
├── docs/            # Documentación del proyecto, objetivos y acuerdos
├── src/
│   └── frontend/    # App móvil React Native / Expo
├── supabase/
│   ├── migrations/  # Migraciones SQL
│   ├── policies/    # Políticas RLS documentadas o versionadas
│   └── seed/        # Datos iniciales o de demostración
└── README.md
```

## Equipo de Desarrollo

| Integrante | Rol |
| --- | --- |
| Felipe Delgado | Backend - Supabase & API |
| Diego Aido | Frontend - React Native / Expo |
| Diego Jerez | Integración - SDK & QA |
