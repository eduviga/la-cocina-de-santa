export async function onRequestPost({ request, env }) {
  // Mercado Pago manda notificaciones: nosotros confirmamos consultando el pago.
  const url = new URL(request.url);

  // A veces llega como query: ?data.id=... o ?id=... (varía según configuración)
  const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

  // O a veces viene JSON
  let body = {};
  try { body = await request.json(); } catch {}

  const paymentId = dataId || body?.data?.id || body?.id;

  if (!paymentId) {
    return new Response("ok", { status: 200 });
  }

  // Consultamos el pago para saber status y external_reference
  const payResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}` }
  });

  const pay = await payResp.json();
  if (!payResp.ok) return new Response("ok", { status: 200 });

  const order_id = pay.external_reference;
  if (!order_id) return new Response("ok", { status: 200 });

  const status = pay.status; // approved / pending / rejected etc.
  await env.PAYMENTS.put(order_id, JSON.stringify({
    status,
    payment_id: paymentId,
    updated_at: Date.now()
  }));

  return new Response("ok", { status: 200 });
}