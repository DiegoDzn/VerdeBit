# Frontend

App móvil del proyecto Escuela Monteverde. Está hecha con Expo, React Native y Supabase.

## Comandos

```bash
npm install
npm run typecheck
npm run start
```

## Variables

Crear `src/frontend/.env` desde `.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Nota sobre AppEntry

`expo/AppEntry` es el punto de entrada que Expo usa para cargar `App.tsx`.

Si aparece un archivo dentro de `dist/` con nombre parecido a `AppEntry-....js`, es un archivo generado al exportar la app para web. No se edita a mano.
