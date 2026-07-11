// /api/order.js — Vercel serverless function.
// Принимает заявку/чат с сайта и отправляет в Telegram.
// Токен и chat_id хранятся в переменных окружения Vercel (НЕ в коде).
module.exports = async (req, res) => {
  // CORS / preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });

  const body = req.body || {};
  const { name, contact, service, comment, type } = body;

  const token = process.env.BOT_TOKEN;
  const chat = process.env.CHAT_ID;
  if (!token || !chat) {
    return res.status(500).json({ ok: false, error: "Не настроены BOT_TOKEN/CHAT_ID" });
  }
  if (!name || !contact) {
    return res.status(400).json({ ok: false, error: "Заполните имя и контакт" });
  }

  const text = type === "chat"
    ? `💬 Чат на сайте: ${comment || ""}`
    : `🔔 Новая заявка с сайта!\n👤 Имя: ${name}\n📱 Контакт: ${contact}\n💼 Услуга: ${service || "—"}\n💬 Комментарий: ${comment || "—"}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
    const data = await r.json();
    if (!data.ok) return res.status(502).json({ ok: false, error: data.description || "Telegram error" });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e && e.message || e) });
  }
};
