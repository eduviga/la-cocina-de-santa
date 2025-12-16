export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const order_id = url.searchParams.get("order_id");
    if (!order_id) {
      return new Response("Missing order_id", { status: 400 });
    }

    // 1) Verificar pago en KV
    const raw = await env.PAYMENTS.get(order_id);
    if (!raw) {
      return new Response("Pago no registrado", { status: 403 });
    }

    const data = JSON.parse(raw);
    if (data.status !== "approved") {
      return new Response("Pago no aprobado", { status: 403 });
    }

    // 2) Traer archivo desde R2
    const key = "Arepa Dominicana.txt"; // EXACTO como está en R2
    const obj = await env.FILES.get(key);
    if (!obj) {
      return new Response("Archivo no encontrado", { status: 404 });
    }

    // 3) Descargar
    return new Response(obj.body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="Arepa Dominicana.txt"'
      }
    });
  } catch (e) {
    return new Response("Error interno: " + e.message, { status: 500 });
  }
}
