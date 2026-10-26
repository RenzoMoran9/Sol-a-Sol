// Envía el recordatorio de la noche al celular guardado en el secreto PUSH_SUBSCRIPTION.
// Lo ejecuta .github/workflows/recordatorio.yml todos los días.
import webpush from "web-push";

const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_SUBSCRIPTION, APP_URL } = process.env;

// Mientras no estén los secretos, no se marca como error para no llenar tu correo de avisos.
if (!VAPID_PRIVATE_KEY || !PUSH_SUBSCRIPTION) {
  console.log("::warning::Faltan los secretos VAPID_PRIVATE_KEY o PUSH_SUBSCRIPTION. Revisa el README.");
  process.exit(0);
}

const mensajes = [
  "¿Cuánto gastaste hoy? Anótalo en 1 minuto y cierra tu día.",
  "Hora del cierre: revisa tus gastos de hoy y mantén tu racha.",
  "Antes de dormir: ¿Yape, efectivo o tarjeta? Anota lo de hoy.",
  "Un minuto hoy te ahorra sorpresas a fin de mes. Haz tu cierre.",
  "Tu racha te espera. Registra lo que gastaste hoy."
];
const body = mensajes[new Date().getUTCDate() % mensajes.length];

webpush.setVapidDetails(APP_URL || "https://renzomoran9.github.io/sol-a-sol/", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

try {
  const res = await webpush.sendNotification(
    JSON.parse(PUSH_SUBSCRIPTION),
    JSON.stringify({ title: "Sol a Sol", body, url: "./?cierre=1" }),
    { TTL: 4 * 60 * 60, urgency: "high" }
  );
  console.log("Recordatorio enviado:", res.statusCode);
} catch (err) {
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.log("El celular ya no acepta avisos con este código. Abre la app → Ajustes, vuelve a activar las notificaciones y actualiza el secreto PUSH_SUBSCRIPTION.");
  } else {
    console.log("No se pudo enviar el recordatorio:", err.statusCode || "", err.body || err.message);
  }
  process.exit(1);
}
