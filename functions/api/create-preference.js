export async function onRequestPost({ request, env }) {
  const { title = "Empanada casera", price = 10 } = await request.json().catch(() => ({}));

  const order_id = crypto.randomUUID();

  const baseUrl = "https://la-cocina-de-santa.pages.dev";
  const payload = {
    items: [{ title, quantity: 1, unit_price: Number(price) }],
    external_reference: order_id,
    back_urls: {
      success: `${baseUrl}/gracias/?order_id=${order_id}`,
      pending: `${baseUrl}/gracias/?order_id=${order_id}`,
      failure: `${baseUrl}/gracias/?order_id=${order_id}`
    },
    auto_return: "approved",
    notification_url: `${baseUrl}/api/webhook`
  };

  const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await resp.json();
  if (!resp.ok) {
    return new Response(JSON.stringify({ error: data }), { status: 500 });
  }

  // guardamos estado inicial
  await env.PAYMENTS.put(order_id, JSON.stringify({ status: "created", created_at: Date.now() }));

  return new Response(JSON.stringify({
    order_id,
    init_point: data.init_point
  }), {
    headers: { "Content-Type": "application/json" }
  });

}
