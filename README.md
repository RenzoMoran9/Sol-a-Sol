# Sol a Sol

App minimalista de finanzas personales: lo libre del mes, gastos fijos, cierre del día con racha y fondo de emergencia. Se instala en el celular y manda un recordatorio cada noche.

**App:** https://renzomoran9.github.io/sol-a-sol/

## Cómo está armada

- `index.html`, `sw.js`, `manifest.json`, íconos: la app (PWA). Los datos se guardan solo en el celular.
- `.github/workflows/publicar.yml`: publica la app en GitHub Pages en cada cambio a `main`.
- `.github/workflows/recordatorio.yml`: todos los días a las 8:50 pm (Lima) envía la notificación con `recordatorio/enviar.mjs`.

## Configuración (una sola vez)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.** Luego, en **Actions → Publicar app → Run workflow**.
2. **Settings → Secrets and variables → Actions → New repository secret**:
   - `VAPID_PRIVATE_KEY`: la llave privada de las notificaciones.
   - `PUSH_SUBSCRIPTION`: el código que muestra la app en **Ajustes → Recordatorio de cada noche** después de activar las notificaciones.
3. Prueba: **Actions → Recordatorio de la noche → Run workflow**. Debe llegarte el aviso al celular.

Para cambiar la hora, edita la línea `cron` de `recordatorio.yml` (está en hora UTC: Lima es UTC−5).

Si cambias de celular o reinstalas la app, vuelve a activar las notificaciones y actualiza el secreto `PUSH_SUBSCRIPTION`.
