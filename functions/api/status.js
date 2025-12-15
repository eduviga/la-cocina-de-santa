export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const order_id = url.searchParams.get("order_id");
  if (!order_id) return new Response(JSON.stringify({ error: "missing order_id" }), { status: 400 });

  const raw = await env.PAYMENTS.get(order_id);
  const data = raw ? JSON.parse(raw) : { status: "unknown" };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
}