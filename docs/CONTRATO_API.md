# Contrato API

Este documento define como se conectara la app movil de Escuela Monteverde con Supabase. La app no tendra un backend propio por ahora, usara los endpoints que Supabase entrega para autenticacion y para consultar las tablas creadas en las migraciones SQL del proyecto

## Base de la API

La URL base se obtiene desde el panel de Supabase:

```text
https://<ref-del-proyecto>.supabase.co
```

Para datos se usa PostgREST:

```text
/rest/v1/<tabla>
```

Para autenticacion se usa Supabase Auth:

```text
/auth/v1/<recurso>
```

En el frontend estas credenciales van en `src/frontend/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<ref-del-proyecto>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<clave-anonima>
```

Todas las peticiones protegidas deben incluir:

```http
apikey: <clave-anonima>
Authorization: Bearer <token-de-sesion>
Content-Type: application/json
```

Cuando se quiere que Supabase devuelva el registro creado o editado:

```http
Prefer: return=representation
```

## Roles

| Rol | Uso en la app |
| --- | --- |
| `student` | Puede revisar contenidos, responder quizzes y ver su avance |
| `teacher` | Puede crear y administrar recursos, quizzes, eventos y contenidos educativos |

El rol se guarda en `profiles.role` las politicas RLS revisan este dato para permitir o bloquear operaciones

el rol no se define desde la app, todo usuario registrado desde la app se crea como `student`, para convertir una cuenta en `teacher`, se debe realizar una operacion administrativa desde Supabase

Ejemplo:

```sql
update public.profiles
   set role = 'teacher'
 where id = '<user_id>';
```


## Codigos de Respuesta

| Codigo | Significado en el proyecto |
| --- | --- |
| `200 OK` | Consulta o modificacion correcta |
| `201 Created` | Registro creado correctamente |
| `204 No Content` | Operacion correcta sin devolver datos |
| `400 Bad Request` | Faltan datos o el formato enviado no corresponde |
| `401 Unauthorized` | No hay sesion activa o el token no sirve |
| `403 Forbidden` | RLS bloqueo la accion por permisos |
| `404 Not Found` | La ruta no existe |
| `406 Not Acceptable` | Se pidio una fila unica con `.single()` |
| `409 Conflict` | Se intento repetir un dato unico |
| `500 Internal Server Error` | Error de una funcion SQL |

## Autenticacion

### Registrar usuario

```http
POST /auth/v1/signup
```

Body:

```json
{
  "email": "estudiantecolegio@gmail.com",
  "password": "123456",
  "data": {
    "full_name": "juan perez"
  }
}
```

Respuesta esperada:

- usuario creado;
- sesion iniciada;
- creacion automaetica de `profiles` mediante el trigger `handle_new_user`;
- perfil creado con rol `student`

### Iniciar sesion

```http
POST /auth/v1/token?grant_type=password
```

Body:

```json
{
  "email": "estudiantecolegio@gmail.com",
  "password": "123456"
}
```

Respuesta esperada:

```json
{
  "access_token": "token",
  "refresh_token": "refresh-token",
  "user": {
    "id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111",
    "email": "estudiantecolegio@gmail.com"
  }
}
```

### Obtener usuario actual

```http
GET /auth/v1/user
```

Requiere `Authorization: Bearer <token-de-sesion>`.

### Cerrar sesion

```http
POST /auth/v1/logout
```

Respuesta esperada: `204 No Content`.

## Endpoints de Datos

Los filtros se escriben con el formato de Supabase:

```text
?campo=eq.valor
?select=*
?order=created_at.desc
```

### Perfiles

Tabla: `profiles`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar perfiles | `GET /rest/v1/profiles?select=*` | Usuario autenticado | `Profile[]` |
| Obtener mi perfil | `GET /rest/v1/profiles?id=eq.{user_id}&select=*` | Usuario autenticado | `Profile[]` |
| Actualizar mi perfil | `PATCH /rest/v1/profiles?id=eq.{user_id}` | Dueno del perfil, solo datos editables | `Profile[]` |

Campos principales:

```json
{
  "id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111",
  "role": "student",
  "full_name": "juan perez",
  "avatar_url": null,
  "total_points": 0
}
```

Body permitido para actualizar perfil:

```json
{
  "full_name": "Juan Perez",
  "avatar_url": "https://example.com/avatar.png"
}
```

### Catalogo de especies

Tabla: `species`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar flora y fauna | `GET /rest/v1/species?select=*&order=common_name.asc` | Usuario autenticado | `Species[]` |
| Filtrar flora | `GET /rest/v1/species?kind=eq.flora&select=*` | Usuario autenticado | `Species[]` |
| Filtrar fauna | `GET /rest/v1/species?kind=eq.fauna&select=*` | Usuario autenticado | `Species[]` |
| Ver especie | `GET /rest/v1/species?id=eq.{species_id}&select=*` | Usuario autenticado | `Species[]` |
| Crear especie | `POST /rest/v1/species` | Profesor | `Species[]` |
| Editar especie | `PATCH /rest/v1/species?id=eq.{species_id}` | Profesor | `Species[]` |
| Eliminar especie | `DELETE /rest/v1/species?id=eq.{species_id}` | Profesor | `204 No Content` |

Body para crear una especie:

```json
{
  "common_name": "Piden",
  "scientific_name": "Pardirallus sanguinolentus",
  "kind": "fauna",
  "description": "ave acuatica que habita zonas humedas y juncales.",
  "habitat": "humedal",
  "conservation_status": "Preocupacion menor",
  "mapuche_name": "Piden"
}
```

### Aula virtual

Tabla: `educational_resources`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar recursos | `GET /rest/v1/educational_resources?select=*&order=created_at.desc` | Usuario autenticado | `EducationalResource[]` |
| Filtrar por tipo | `GET /rest/v1/educational_resources?resource_type=eq.pdf&select=*` | Usuario autenticado | `EducationalResource[]` |
| Crear recurso | `POST /rest/v1/educational_resources` | Profesor autor | `EducationalResource[]` |
| Editar recurso | `PATCH /rest/v1/educational_resources?id=eq.{resource_id}` | Profesor autor | `EducationalResource[]` |
| Eliminar recurso | `DELETE /rest/v1/educational_resources?id=eq.{resource_id}` | Profesor autor | `204 No Content` |

Body para crear un recurso:

```json
{
  "author_id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111",
  "title": "Guia de observacion de aves",
  "description": "Material para reconocer aves del humedal durante una salida pedagogica.",
  "resource_type": "pdf",
  "url": "https://escuela-monteverde.cl/recursos/guia-aves.pdf",
  "subject_area": "fauna"
}
```

### Quizzes

Tabla: `quizzes`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar quizzes publicados | `GET /rest/v1/quizzes?is_published=eq.true&select=*` | Usuario autenticado | `Quiz[]` |
| Ver quiz | `GET /rest/v1/quizzes?id=eq.{quiz_id}&select=*` | Publicado o profesor autor | `Quiz[]` |
| Crear quiz | `POST /rest/v1/quizzes` | Profesor autor | `Quiz[]` |
| Editar quiz | `PATCH /rest/v1/quizzes?id=eq.{quiz_id}` | Profesor autor | `Quiz[]` |
| Eliminar quiz | `DELETE /rest/v1/quizzes?id=eq.{quiz_id}` | Profesor autor | `204 No Content` |

Body para crear quiz:

```json
{
  "author_id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111",
  "title": "Quiz de flora y fauna",
  "description": "Preguntas sobre especies vistas en el humedal.",
  "topic": "catalogo",
  "points_reward": 10,
  "is_published": true
}
```

### Preguntas de quiz

Tabla: `quiz_questions`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar preguntas | `GET /rest/v1/quiz_questions?quiz_id=eq.{quiz_id}&select=*&order=position.asc` | Quiz visible | `QuizQuestion[]` |
| Crear pregunta | `POST /rest/v1/quiz_questions` | Profesor autor del quiz | `QuizQuestion[]` |
| Editar pregunta | `PATCH /rest/v1/quiz_questions?id=eq.{question_id}` | Profesor autor del quiz | `QuizQuestion[]` |
| Eliminar pregunta | `DELETE /rest/v1/quiz_questions?id=eq.{question_id}` | Profesor autor del quiz | `204 No Content` |

Body para crear pregunta:

```json
{
  "quiz_id": "b427111d-c21c-4b0d-8b30-7fd306042222",
  "prompt": "¿Que tipo de especie es el piden?",
  "position": 1
}
```

### Alternativas de quiz

Tabla: `quiz_options`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar alternativas | `GET /rest/v1/quiz_options?question_id=eq.{question_id}&select=*&order=position.asc` | Quiz visible | `QuizOption[]` |
| Crear alternativa | `POST /rest/v1/quiz_options` | Profesor autor del quiz | `QuizOption[]` |
| Editar alternativa | `PATCH /rest/v1/quiz_options?id=eq.{option_id}` | Profesor autor del quiz | `QuizOption[]` |
| Eliminar alternativa | `DELETE /rest/v1/quiz_options?id=eq.{option_id}` | Profesor autor del quiz | `204 No Content` |

Body para crear alternativa:

```json
{
  "question_id": "a2b89432-3687-4f2e-9aa9-3d7c15763333",
  "label": "Fauna",
  "is_correct": true,
  "position": 1
}
```

### Intentos de quiz

Tabla: `quiz_attempts`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Crear intento | `POST /rest/v1/quiz_attempts` | Estudiante dueño | `QuizAttempt[]` |
| Ver mis intentos | `GET /rest/v1/quiz_attempts?student_id=eq.{user_id}&select=*` | Estudiante dueño | `QuizAttempt[]` |
| Ver intentos de un quiz | `GET /rest/v1/quiz_attempts?quiz_id=eq.{quiz_id}&select=*` | Profesor autor del quiz | `QuizAttempt[]` |
| Completar intento | `PATCH /rest/v1/quiz_attempts?id=eq.{attempt_id}` | Estudiante dueno | `QuizAttempt[]` |

Crear intento:

```json
{
  "quiz_id": "b427111d-c21c-4b0d-8b30-7fd306042222",
  "student_id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111"
}
```

Completar intento:

```json
{
  "score": 4,
  "completed_at": "2026-05-21T15:30:00.000Z"
}
```

Al completar un intento el trigger `award_quiz_points()` suma puntos al perfil y entrega la medalla `first_quiz` si corresponde

### Respuestas de quiz

Tabla: `quiz_answers`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Guardar respuesta | `POST /rest/v1/quiz_answers` | Estudiante dueno del intento | `QuizAnswer[]` |
| Ver respuestas | `GET /rest/v1/quiz_answers?attempt_id=eq.{attempt_id}&select=*` | Estudiante dueno o profesor autor | `QuizAnswer[]` |

Body:

```json
{
  "attempt_id": "d53c078c-6bcb-4c26-823e-1ca5b79a4444",
  "question_id": "a2b89432-3687-4f2e-9aa9-3d7c15763333",
  "option_id": "efdbb6a4-a1b0-4988-9317-f1b88bd65555"
}
```


### Medallas

Tabla: `badges`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar medallas | `GET /rest/v1/badges?select=*&order=points_required.asc` | Usuario autenticado | `Badge[]` |
| Crear medalla | `POST /rest/v1/badges` | Profesor | `Badge[]` |
| Editar medalla | `PATCH /rest/v1/badges?id=eq.{badge_id}` | Profesor | `Badge[]` |
| Eliminar medalla | `DELETE /rest/v1/badges?id=eq.{badge_id}` | Profesor | `204 No Content` |

### Medallas de estudiantes

Tabla: `student_badges`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Ver mis medallas | `GET /rest/v1/student_badges?student_id=eq.{user_id}&select=*,badges(*)` | Estudiante dueno | `StudentBadge[]` |
| Ver medallas asignadas | `GET /rest/v1/student_badges?select=*,badges(*)` | Profesor | `StudentBadge[]` |
| Asignar medalla | `POST /rest/v1/student_badges` | Profesor | `StudentBadge[]` |

### Calendario

Tabla: `events`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar eventos | `GET /rest/v1/events?select=*&order=starts_at.asc` | Usuario autenticado | `Event[]` |
| Listar proximos eventos | `GET /rest/v1/events?starts_at=gte.{fecha_iso}&select=*&order=starts_at.asc` | Usuario autenticado | `Event[]` |
| Crear evento | `POST /rest/v1/events` | Profesor autor | `Event[]` |
| Editar evento | `PATCH /rest/v1/events?id=eq.{event_id}` | Profesor autor | `Event[]` |
| Eliminar evento | `DELETE /rest/v1/events?id=eq.{event_id}` | Profesor autor | `204 No Content` |

Body para crear evento:

```json
{
  "author_id": "7a78f4c6-8c3f-4b95-8f1b-9b5d42d2b111",
  "title": "Recorrido",
  "description": "Salida al humedal para observar aves y plantas",
  "location": "Acceso norte del humedal",
  "starts_at": "2026-06-05T14:00:00.000Z",
  "ends_at": "2026-06-05T16:00:00.000Z"
}
```

### Sabias que

Tabla: `did_you_know`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar publicados | `GET /rest/v1/did_you_know?is_published=eq.true&select=*` | Usuario autenticado | `DidYouKnow[]` |
| Crear dato | `POST /rest/v1/did_you_know` | Profesor | `DidYouKnow[]` |
| Editar dato | `PATCH /rest/v1/did_you_know?id=eq.{item_id}` | Profesor | `DidYouKnow[]` |
| Eliminar dato | `DELETE /rest/v1/did_you_know?id=eq.{item_id}` | Profesor | `204 No Content` |

### Cultura Mapuche

Tabla: `mapuche_content`

| Accion | Metodo y URI | Permiso | Respuesta |
| --- | --- | --- | --- |
| Listar publicados | `GET /rest/v1/mapuche_content?is_published=eq.true&select=*` | Usuario autenticado | `MapucheContent[]` |
| Filtrar por categoria | `GET /rest/v1/mapuche_content?category=eq.vocabulario&is_published=eq.true&select=*` | Usuario autenticado | `MapucheContent[]` |
| Crear contenido | `POST /rest/v1/mapuche_content` | Profesor | `MapucheContent[]` |
| Editar contenido | `PATCH /rest/v1/mapuche_content?id=eq.{content_id}` | Profesor | `MapucheContent[]` |
| Eliminar contenido | `DELETE /rest/v1/mapuche_content?id=eq.{content_id}` | Profesor | `204 No Content` |

## Modelos Principales

| Modelo | Tabla | Uso |
| --- | --- | --- |
| `Profile` | `profiles` | Datos del usuario, rol y puntaje |
| `Species` | `species` | Catalogo de flora y fauna |
| `EducationalResource` | `educational_resources` | Materiales del aula virtual |
| `Quiz` | `quizzes` | Evaluaciones publicadas por profesores |
| `QuizQuestion` | `quiz_questions` | Preguntas de cada quiz |
| `QuizOption` | `quiz_options` | Alternativas de cada pregunta |
| `QuizAttempt` | `quiz_attempts` | Intentos realizados por estudiantes |
| `QuizAnswer` | `quiz_answers` | Respuestas individuales de cada intento |
| `Badge` | `badges` | Catalogo de medallas |
| `StudentBadge` | `student_badges` | Medallas ganadas por estudiantes |
| `Event` | `events` | Calendario comunitario |
| `DidYouKnow` | `did_you_know` | Datos curiosos del humedal |
| `MapucheContent` | `mapuche_content` | Contenido cultural Mapuche |
