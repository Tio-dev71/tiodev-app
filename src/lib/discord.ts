export async function sendDiscordNotification(order: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const formatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    const paymentTime = formatter.format(new Date());

    const items = order.items?.map((i: any) => `- ${i.quantity}x ${i.product?.name || 'Sản phẩm'} (${i.price}$)`) || [];
    
    const isPending = order.status === 'PENDING';
    const title = isPending ? "⏳ Đơn hàng mới (Đang chờ thanh toán VietQR)" : "🎉 Đơn hàng đã thanh toán thành công!";
    const color = isPending ? 16753920 : 3066993; // Orange / Green

    const embed = {
      title,
      color,
      fields: [
        { name: "Mã Đơn", value: order.orderNumber || order.id, inline: true },
        { name: "Khách hàng", value: order.customerName || 'N/A', inline: true },
        { name: "Email", value: order.customerEmail || 'N/A', inline: true },
        { name: "Tổng tiền", value: `${order.total}$`, inline: true },
        { name: "TradingView User", value: order.tradingViewUser || 'Không có', inline: true },
        { name: "Trạng thái", value: order.status || 'N/A', inline: true },
        { name: "Thời gian (VN)", value: paymentTime, inline: false },
        { name: "Sản phẩm", value: items.join('\n') || 'Không rõ', inline: false }
      ],
      footer: { text: "Portfolio System Notification" }
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Failed to send Discord webhook:', error);
  }
}
