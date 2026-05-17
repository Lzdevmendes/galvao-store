// WhatsApp Cloud API — notificações de status de pedido
// Configurar: Meta for Developers → WhatsApp Business API
// Env vars necessárias: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID

const WA_TOKEN    = process.env.WHATSAPP_TOKEN
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID

async function sendWaMessage(to: string, body: string): Promise<void> {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    console.log('[whatsapp] não configurado — mensagem não enviada:', body.slice(0, 60))
    return
  }

  // Remove formatação BR e deixa só dígitos + código do país
  const phone = '55' + to.replace(/\D/g, '').slice(-11)

  const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { preview_url: false, body },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[whatsapp] erro ao enviar:', err)
  }
}

// ── Mensagens por status ──────────────────────────────────

export async function waSendOrderCreated(phone: string | null, orderNumber: string, customerName: string) {
  if (!phone) return
  await sendWaMessage(phone,
    `✅ *Galvão's Store*\n\nOlá, ${customerName.split(' ')[0]}! Seu pedido *${orderNumber}* foi recebido com sucesso.\n\nAcompanhe em: https://galvaosstore.com.br/conta/pedidos\n\n_Dúvidas? Responda esta mensagem._`
  )
}

export async function waSendPaymentConfirmed(phone: string | null, orderNumber: string, customerName: string) {
  if (!phone) return
  await sendWaMessage(phone,
    `💚 *Pagamento confirmado!*\n\nOlá, ${customerName.split(' ')[0]}! O pagamento do pedido *${orderNumber}* foi aprovado.\n\nEstamos preparando sua encomenda. Em breve você recebe o código de rastreio.`
  )
}

export async function waSendOrderShipped(phone: string | null, orderNumber: string, trackingCode: string, carrier: string) {
  if (!phone) return
  await sendWaMessage(phone,
    `🚚 *Pedido enviado!*\n\nSeu pedido *${orderNumber}* saiu para entrega!\n\n📦 Rastreio: *${trackingCode}* (${carrier})\nAcompanhe em: https://rastreamento.correios.com.br/app/index.php?objeto=${trackingCode}`
  )
}

export async function waSendOrderDelivered(phone: string | null, orderNumber: string, customerName: string) {
  if (!phone) return
  await sendWaMessage(phone,
    `🎉 *Pedido entregue!*\n\nOlá, ${customerName.split(' ')[0]}! Seu pedido *${orderNumber}* foi entregue.\n\nGostou? Deixe uma avaliação: https://galvaosstore.com.br/conta/pedidos\n\n⭐ Sua opinião nos ajuda muito!`
  )
}
