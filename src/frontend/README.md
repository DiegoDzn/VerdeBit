# Frontend

App móvil del MVP Escuela Monteverde, construida con Expo, React Native y Supabase.

## Estructura

```text
src/
├── app/          # Entrada de la app, providers y navegación.
├── components/   # Componentes reutilizables.
├── features/     # Secciones del MVP.
├── lib/          # Clientes externos, Supabase y entorno.
└── theme/        # Colores y tema visual.
```

## Comandos

```bash
npm install
npm run typecheck
npm run start
```

## AppEntry

`expo/AppEntry` es el punto de entrada interno de Expo definido en `package.json`. Expo lo usa para cargar `App.tsx` y montar la aplicación.

Si ves un archivo como `dist/_expo/static/js/web/AppEntry-....js`, es un bundle generado para web. No es una clase del proyecto y no se edita a mano.

La carpeta `dist/` se genera al exportar/buildar la app para web. No se edita ni se versiona.
