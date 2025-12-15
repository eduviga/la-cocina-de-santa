exports.handler = async (event) => {
  try {
    const { title, price, successUrl, pendingUrl, failureUrl } = JSON.parse(event.body || "{}");

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return { statusCode: 500, body: "Falta MP_ACCESS_TOKEN en variables de entorno de Netlify" };
    }

    // Preferencia de Checkout Pro
    const preference = {
      items: [
        {
          title: title || "Receta completa - La Cocina de Santa",
          quantity: 1,
          currency_id: "ARS",
          unit_price: Number(price || 10),
        },
      ],
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      auto_return: "approved",
    };

    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preference),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status, body: JSON.stringify(data) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: data.init_point, // URL para iniciar el pago
      }),
    };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};