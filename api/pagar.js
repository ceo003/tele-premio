export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  try {
    const token = process.env.PAYSUITE_TOKEN?.trim();

    if (!token) {
      return res.status(500).json({
        error: "Token não configurado"
      });
    }

    // Pegar dados do corpo da requisição
    const { method, amount, description } = req.body || {};
    // Gerar referência única
    const reference = `REC${Date.now()}`;

    // Nomes de exemplo para a descrição
    const weeklyNames = ['Telma Jonnase', 'Carlos Tembe', 'Ana Paula', 'João Manjate'];
    const randomName = weeklyNames[Math.floor(Math.random() * weeklyNames.length)];

    // Identificar o host automaticamente (funciona no .online ou no link da Vercel)
    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const body = {
      amount: amount || 200,
      reference,
      description: description || `Os melhores da semana - ${randomName} - Taxa de entrega Tele Prêmio`,
      method: method === 'emola' ? 'emola' : 'mpesa',
      return_url: `${baseUrl}/obrigado.html`
      // Removido callback_url daqui para evitar conflito com a configuração manual do painel
    };

    console.log("Chamando PaySuite com baseUrl:", baseUrl);

    const response = await fetch("https://paysuite.tech/api/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    console.log("PAYSUITE RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      checkout_url: data.data.checkout_url
    });

  } catch (error) {
    console.error("Erro na API de Pagamento:", error.message);
    return res.status(500).json({
      error: error.message
    });
  }
}
