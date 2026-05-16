import crypto from "crypto";

export const config = {
  api: {
    bodyParser: false
  }
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers["x-webhook-signature"];
    const secret = process.env.PAYSUITE_WEBHOOK_SECRET?.trim();

    if (!secret) {
      console.error("Webhook Secret não configurado!");
      return res.status(500).send("Secret missing");
    }

    const calculatedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Validar assinatura para segurança profissional
    if (signature !== calculatedSignature) {
      console.log("Assinatura inválida detectada");
      return res.status(401).send("Invalid signature");
    }

    const data = JSON.parse(rawBody);
    console.log("WEBHOOK DATA:", data);

    // Evento de sucesso
    if (data.event === "payment.success") {
      const payment = data.data;
      console.log(`PAGAMENTO APROVADO: Referência ${payment.reference}`);
      
      // Notificação Telegram
      await sendTelegramNotification(payment);
    }

    return res.status(200).send("OK");

  } catch (error) {
    console.error("Erro no Webhook:", error.message);
    return res.status(500).send(error.message);
  }
}

async function sendTelegramNotification(payment) {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Telegram Token ou Chat ID não configurado!");
    return;
  }

  const message = `
✅ *Nova Venda Aprovada!*
━━━━━━━━━━━━━━━━━━
💰 *Valor:* ${payment.amount} ${payment.currency || 'MZN'}
📝 *Descrição:* ${payment.description || 'Sem descrição'}
🆔 *Referência:* \`${payment.reference}\`
👤 *Método:* ${payment.method}
📅 *Data:* ${new Date().toLocaleString('pt-MZ')}
━━━━━━━━━━━━━━━━━━
🚀 Parabéns por mais uma venda!
  `;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    console.log("Notificação Telegram enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar notificação para o Telegram:", error.message);
  }
}
