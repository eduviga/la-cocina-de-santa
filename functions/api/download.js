export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const order_id = url.searchParams.get("order_id");
  if (!order_id) return new Response("Missing order_id", { status: 400 });

  const raw = await env.PAYMENTS.get(order_id);
  const data = raw ? JSON.parse(raw) : null;

  if (!data || data.status !== "approved") {
    return new Response("Pago no aprobado", { status: 403 });
  }

  // Archivo “de prueba”
  const key = "Arepa Dominicana.txt";

  const obj = await env.FILES.get(key);
  if (!obj) return new Response("Archivo no encontrado", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${key}"`
    }
  });

}

