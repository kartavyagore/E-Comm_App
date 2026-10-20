import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

/**
 * Initializes and retrieves the nodemailer transporter.
 * If SMTP credentials are provided in .env, connects to real SMTP server.
 * Otherwise, creates an Ethereal test account with browser-inspectable preview URLs.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (ENV.EMAIL.HOST && ENV.EMAIL.USER && ENV.EMAIL.PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.EMAIL.HOST,
      port: ENV.EMAIL.PORT,
      secure: ENV.EMAIL.SECURE,
      auth: {
        user: ENV.EMAIL.USER,
        pass: ENV.EMAIL.PASS
      }
    });
    console.log(`✓ Real SMTP Email transporter initialized (${ENV.EMAIL.HOST})`);
    return transporter;
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`ℹ Ethereal Email test account initialized for customer order receipts`);
    return transporter;
  } catch (err) {
    console.warn(`⚠ Failed to initialize Ethereal email transporter: ${err.message}`);
    return null;
  }
};

/**
 * Generates modern, luxury-styled HTML email template for AURA order confirmation
 */
const generateOrderHtml = (order) => {
  const itemsHtml = (order.items || [])
    .map((item) => `
      <tr style="border-bottom: 1px solid #232733;">
        <td style="padding: 16px 8px; width: 64px;">
          ${
            item.image_url
              ? `<img src="${item.image_url}" alt="${item.title}" width="56" height="56" style="border-radius: 8px; object-fit: cover; border: 1px solid #2a2e3d; display: block;" />`
              : `<div style="width: 56px; height: 56px; background: #161922; border-radius: 8px; border: 1px solid #2a2e3d;"></div>`
          }
        </td>
        <td style="padding: 16px 12px; vertical-align: middle;">
          <div style="font-size: 11px; text-transform: uppercase; color: #d4a373; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px;">
            ${item.category_name || 'Studio Instrument'}
          </div>
          <div style="font-size: 14px; font-weight: 600; color: #f0f2f8; line-height: 1.4;">
            ${item.title}
          </div>
          <div style="font-size: 12px; color: #8a90a4; margin-top: 4px;">
            Quantity: <strong style="color: #f0f2f8;">${item.quantity}</strong> &times; $${Number(item.price).toFixed(2)}
          </div>
        </td>
        <td style="padding: 16px 8px; text-align: right; vertical-align: middle; font-size: 15px; font-weight: 700; color: #d4a373;">
          $${Number(item.item_subtotal || (item.price * item.quantity)).toFixed(2)}
        </td>
      </tr>
    `)
    .join('');

  const shipping = Number(order.shipping) === 0 ? 'Complimentary' : `$${Number(order.shipping).toFixed(2)}`;
  const dateFormatted = new Date(order.created_at || Date.now()).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const street = order.shipping_address?.street || order.shippingAddress?.street || 'Studio Reference Address';
  const city = order.shipping_address?.city || order.shippingAddress?.city || 'Metropolis';
  const country = order.shipping_address?.country || order.shippingAddress?.country || 'United States';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Acoustic Commission Confirmed #${order.id}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #08090d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f2f8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #08090d; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #0f1117; border: 1px solid #1f2330; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #141720 0%, #0d0f15 100%); padding: 32px 36px; border-bottom: 1px solid #1f2330; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.15em; color: #f0f2f8; text-transform: uppercase; font-family: 'Outfit', sans-serif;">
                    AURA
                  </div>
                  <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.25em; color: #d4a373; text-transform: uppercase; margin-top: 4px;">
                    Sound & Living &bull; Acoustic Precision
                  </div>
                </td>
              </tr>

              <!-- Hero Confirmation -->
              <tr>
                <td style="padding: 36px 36px 20px 36px; text-align: center;">
                  <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; background: rgba(122, 158, 126, 0.15); border: 1px solid #7a9e7e; color: #8bd396; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
                    &bull; Commission Confirmed &bull;
                  </div>
                  <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">
                    Commission #${order.id}
                  </h1>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a0a6b8;">
                    Thank you, <strong style="color: #f0f2f8;">${order.customer_name || 'Acoustic Patron'}</strong>. Your transducer commission has been confirmed and logged into our real-time studio dispatch queue.
                  </p>
                </td>
              </tr>

              <!-- Order Info Metadata -->
              <tr>
                <td style="padding: 10px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #141722; border: 1px solid #232733; border-radius: 12px; padding: 16px 20px;">
                    <tr>
                      <td style="font-size: 12px; color: #8a90a4;">
                        Date: <strong style="color: #f0f2f8;">${dateFormatted}</strong>
                      </td>
                      <td style="text-align: right; font-size: 12px; color: #8a90a4;">
                        Status: <strong style="color: #8bd396; text-transform: uppercase;">${order.status || 'Confirmed'}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items List -->
              <tr>
                <td style="padding: 24px 36px 10px 36px;">
                  <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a90a4; margin-bottom: 12px;">
                    Allocated Reference Instruments (${order.items?.length || 0})
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Financial Breakdown -->
              <tr>
                <td style="padding: 16px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #141722; border: 1px solid #232733; border-radius: 12px; padding: 20px;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #8a90a4;">Instruments Subtotal</td>
                      <td style="padding: 6px 0; text-align: right; font-size: 13px; font-weight: 600; color: #f0f2f8;">$${Number(order.subtotal).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #8a90a4;">Insured Express Freight</td>
                      <td style="padding: 6px 0; text-align: right; font-size: 13px; font-weight: 600; color: ${order.shipping === 0 ? '#8bd396' : '#f0f2f8'};">${shipping}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 13px; color: #8a90a4;">Estimated Sales Tax (8%)</td>
                      <td style="padding: 6px 0; text-align: right; font-size: 13px; font-weight: 600; color: #f0f2f8;">$${Number(order.tax).toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 1px solid #2a2f40;">
                      <td style="padding: 14px 0 4px 0; font-size: 15px; font-weight: 700; color: #ffffff;">Total Remitted</td>
                      <td style="padding: 14px 0 4px 0; text-align: right; font-size: 20px; font-weight: 800; color: #d4a373;">$${Number(order.total).toFixed(2)} USD</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Address Box -->
              <tr>
                <td style="padding: 10px 36px 30px 36px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background: #141722; border: 1px solid #232733; border-radius: 12px; padding: 18px 20px;">
                    <tr>
                      <td style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #8a90a4; padding-bottom: 6px;">
                        Delivery & Studio Destination
                      </td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; line-height: 1.5; color: #f0f2f8;">
                        <strong>${order.customer_name}</strong><br />
                        ${street}<br />
                        ${city}, ${country}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Studio Assurance Footer -->
              <tr>
                <td style="background: #0a0b10; padding: 28px 36px; border-top: 1px solid #1f2330; text-align: center;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #8a90a4; line-height: 1.6;">
                    30-Day in-studio audition period. Real-time serial tracking and insured signature freight upon dispatch.
                  </p>
                  <div style="font-size: 11px; color: #585e72;">
                    &copy; ${new Date().getFullYear()} AURA Sound & Living. All acoustic designs reserved.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const emailService = {
  /**
   * Dispatches order confirmation email to the customer.
   * Runs asynchronously without blocking the user response.
   */
  async sendOrderConfirmationEmail(order) {
    if (!order || !order.customer_email) {
      console.warn('Cannot send order email: missing customer email address');
      return null;
    }

    try {
      const mailTransporter = await getTransporter();
      if (!mailTransporter) {
        console.warn('Email transporter not ready, skipping dispatch');
        return null;
      }

      const htmlContent = generateOrderHtml(order);

      const mailOptions = {
        from: ENV.EMAIL.FROM,
        to: order.customer_email,
        subject: `Commission Confirmed #${order.id} | AURA Sound & Living`,
        html: htmlContent,
        text: `Thank you for your order #${order.id}, ${order.customer_name}. Total paid: $${order.total} USD. Delivery to: ${order.shipping_address?.street || 'Studio Address'}, ${order.shipping_address?.city || ''}.`
      };

      const info = await mailTransporter.sendMail(mailOptions);
      console.log(`✉ Order confirmation email dispatched to ${order.customer_email} (MessageID: ${info.messageId})`);

      // If Ethereal test account was used, generate and log clickable browser preview URL!
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Preview customer email in browser: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || null
      };
    } catch (err) {
      console.error(`⚠ Error sending order confirmation email to ${order.customer_email}:`, err.message);
      return null;
    }
  }
};

export default emailService;
