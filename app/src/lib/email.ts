// ============================================
// Email Notification Service
// Sends order confirmations and notifications
// Uses Resend API (easily swappable)
// ============================================

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    downloadLink?: string | null;
  }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!resend) {
    console.warn('⚠️ Email service not configured. Skipping email.');
    return null;
  }

  try {
    const itemsHtml = data.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.price.toFixed(2)}</td>
          </tr>`
      )
      .join('');

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Portfolio Store <noreply@resend.dev>',
      to: data.customerEmail,
      subject: `Order Confirmation - #${data.orderNumber}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Thank you for your purchase</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="color: #374151; font-size: 16px;">Hi ${data.customerName},</p>
            <p style="color: #6b7280;">Your order <strong>#${data.orderNumber}</strong> has been received and is being processed.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Subtotal:</span>
                <span style="color: #374151;">$${data.subtotal.toFixed(2)}</span>
              </div>
              ${data.discount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #059669;">Discount:</span>
                <span style="color: #059669;">-$${data.discount.toFixed(2)}</span>
              </div>` : ''}
              <div style="display: flex; justify-content: space-between; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px;">
                <span style="color: #111827; font-weight: 700; font-size: 18px;">Total:</span>
                <span style="color: #111827; font-weight: 700; font-size: 18px;">$${data.total.toFixed(2)}</span>
              </div>
            </div>

            ${data.items.some((item) => item.downloadLink) ? `
            <div style="background: #ecfeff; border: 1px solid #a5f3fc; padding: 16px; border-radius: 8px; margin-top: 20px;">
              <h3 style="margin: 0 0 10px; color: #0f766e; font-size: 16px;">Your Download Links</h3>
              <ul style="margin: 0; padding-left: 18px;">
                ${data.items
                  .filter((item) => item.downloadLink)
                  .map(
                    (item) => `<li style="margin-bottom: 6px;"><a href="${item.downloadLink}" style="color: #0e7490; text-decoration: none;" target="_blank" rel="noopener noreferrer">${item.name} - Download App</a></li>`
                  )
                  .join('')}
              </ul>
            </div>` : ''}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              Payment via ${data.paymentMethod === 'stripe' ? 'Credit Card' : 'Bank Transfer (VietQR)'}
            </p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Portfolio Store. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    console.log('✅ Order confirmation email sent:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    return null;
  }
}
