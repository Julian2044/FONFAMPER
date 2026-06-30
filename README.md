# FONFAMPER

Aplicación web para FONFAMPER, un Fondo de Ahorro Familiar.

## Descripción

Primera fase visual navegable del portal para ahorradores y administración. No incluye backend, base de datos ni autenticación real. Todos los datos son locales de demostración.

## Tecnologías usadas

- Next.js con App Router
- TypeScript
- Tailwind CSS
- ESLint
- lucide-react
- recharts

## Instalar dependencias

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Luego abre `http://localhost:3000`.

## Variables de entorno

Para activar acceso de usuarios internos desde administracion se requiere una llave server-only en `.env.local` y en Vercel:

```bash
SUPABASE_SERVICE_ROLE_KEY=...
```

Esta variable no debe usar prefijo `NEXT_PUBLIC_`.

## Rutas principales

- `/login`
- `/ahorrador/inicio`
- `/ahorrador/movimientos`
- `/ahorrador/utilidades`
- `/ahorrador/estado-cuenta`
- `/ahorrador/perfil`
- `/admin/dashboard`
- `/admin/usuarios`
- `/admin/movimientos`
- `/admin/importaciones`
- `/admin/utilidades`
- `/admin/auditoria`

## Nota

Primera fase visual con datos de demostración.
