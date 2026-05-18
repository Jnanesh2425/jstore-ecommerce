const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const fs = require('fs');
const path = require('path');

// Initialize SES Client
const sesClient = new SESClient({ 
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Read and encode logo as base64
const logoPath = path.join(__dirname, '../logo/logo.png');
let logoBase64 = '';

try {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  console.log('[EMAIL] Logo loaded successfully');
} catch (error) {
  console.log('[EMAIL] Logo not found, emails will proceed without logo');
}

// Verify AWS credentials are configured
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('[EMAIL] ⚠️ AWS credentials not configured!');
}
if (!process.env.AWS_SES_FROM_EMAIL) {
  console.error('[EMAIL] ⚠️ AWS_SES_FROM_EMAIL not configured!');
}

console.log('[EMAIL] SES Client initialized for region:', process.env.AWS_REGION || 'ap-south-1');
console.log('[EMAIL] From email:', process.env.AWS_SES_FROM_EMAIL);

const sendOrderConfirmationEmail = async (userEmail, userName, order) => {
  try {
    // Generate order items HTML - use 'products' instead of 'items'
    const itemsHtml = (order.products || []).map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; font-weight: 500;">
          ${item.productName}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center; font-weight: 500;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: 500;">
          ₹${item.sellingPrice?.toFixed(2) || '0.00'}
        </td>
      </tr>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0;
              color: white;
            }
            .header h1 { 
              color: #ffffff; 
              margin: 0;
              font-size: 28px;
            }
            .checkmark {
              font-size: 40px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
            }
            .order-info { 
              background-color: #f8f9fa; 
              padding: 20px; 
              margin: 20px 0; 
              border-left: 4px solid #667eea;
              border-radius: 4px;
            }
            .order-info p { 
              margin: 8px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: 600;
              color: #333;
            }
            .value {
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              background-color: #fafafa;
              border-radius: 4px;
              overflow: hidden;
            }
            table thead {
              background-color: #667eea;
              color: white;
            }
            table th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            .address-box {
              background-color: #f8f9fa; 
              padding: 20px; 
              border-radius: 4px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
              line-height: 1.8;
            }
            .address-box strong {
              color: #333;
            }
            .delivery-info {
              background-color: #e7f3ff; 
              padding: 15px; 
              margin: 20px 0; 
              border-radius: 4px; 
              border-left: 4px solid #2196F3;
            }
            .cta-button {
              display: inline-block;
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer { 
              background-color: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #999;
              border-top: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
            .total-row {
              background-color: #667eea;
              color: white;
            }
            .total-row td {
              padding: 15px 12px;
              font-weight: 700;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- LOGO SECTION -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 20px;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Store Logo" style="max-width: 200px; height: auto;" />` : '<p style="color: #999;">Welcome</p>'}
            </div>
            
            <div class="header">
              <div class="checkmark">✅</div>
              <h1>Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your payment has been received</p>
            </div>

            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Thank you for your order! Your payment has been successfully received and your order is being prepared for shipment.</p>

              <div class="order-info">
                <p><span class="label">Order ID:</span> <span class="value">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
                <p><span class="label">Order Date:</span> <span class="value">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p><span class="label">Total Amount:</span> <span class="value" style="font-weight: 700; color: #667eea;">₹${order.totalAmount?.toFixed(2) || '0.00'}</span></p>
                <p><span class="label">Payment Status:</span> <span class="value" style="color: #28a745; font-weight: 600;">✓ Completed</span></p>
              </div>

              <h3 style="margin-top: 30px; margin-bottom: 15px; color: #333;">Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr class="total-row">
                    <td colspan="2" style="text-align: right;">Total:</td>
                    <td style="text-align: right;">₹${order.totalAmount?.toFixed(2) || '0.00'}</td>
                  </tr>
                </tbody>
              </table>

              <h3 style="margin-top: 30px; margin-bottom: 15px; color: #333;">Delivery Address</h3>
              <div class="address-box">
                <strong>${order.address?.name}</strong><br/>
                ${order.address?.address}<br/>
                ${order.address?.city}, ${order.address?.state} ${order.address?.pincode}<br/>
                <strong>Phone:</strong> ${order.address?.mobile}
              </div>

              <div class="delivery-info">
                <strong>📦 Expected Delivery: 3-5 Business Days</strong><br/>
                <p style="margin: 10px 0 0 0; font-size: 14px;">We'll send you a shipping update with tracking details soon. You can track your order anytime from your account.</p>
              </div>

              <p style="background-color: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107; margin-top: 20px;">
                <strong>Need Help?</strong> If you have any questions, please visit our support page or reply to this email.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0; padding: 0;">This is an automated email. Please do not reply directly to this email.</p>
              <p style="margin: 10px 0 0 0; padding: 0;">&copy; 2026 Your E-Commerce Store. All rights reserved.</p>
              <p style="margin: 10px 0 0 0; padding: 0; color: #ccc;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: {
          Data: `Order Confirmed - Order #${order._id.toString().slice(-8).toUpperCase()}`
        },
        Body: {
          Html: {
            Data: htmlBody
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`[SUCCESS] Order confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to send order confirmation email:');
    console.error('  To:', userEmail);
    console.error('  From:', process.env.AWS_SES_FROM_EMAIL);
    console.error('  Error:', error.message);
    console.error('  Code:', error.$metadata?.httpStatusCode);
    if (error.Code) console.error('  AWS Error Code:', error.Code);
    return false;
  }
};

const sendOrderDeliveredEmail = async (userEmail, userName, order) => {
  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #ffffff;
            }
            .header { 
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              padding: 30px; 
              text-align: center; 
              border-radius: 8px 8px 0 0;
              color: white;
            }
            .header h1 { 
              color: #ffffff; 
              margin: 0;
              font-size: 28px;
            }
            .checkmark {
              font-size: 40px;
              margin-bottom: 10px;
            }
            .content {
              padding: 30px;
            }
            .order-info { 
              background-color: #f8f9fa; 
              padding: 20px; 
              margin: 20px 0; 
              border-left: 4px solid #28a745;
              border-radius: 4px;
            }
            .order-info p { 
              margin: 8px 0;
              display: flex;
              justify-content: space-between;
            }
            .label {
              font-weight: 600;
              color: #333;
            }
            .value{
              color: #666;
            }
            .review-box {
              background-color: #fff3cd; 
              padding: 20px; 
              border-radius: 4px; 
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
            .review-box h3 {
              margin-top: 0;
              color: #856404;
            }
            .cta-button {
              display: inline-block;
              background-color: #ffc107;
              color: #333;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 4px;
              margin: 15px 0;
              font-weight: 600;
              text-align: center;
            }
            .footer { 
              background-color: #f8f9fa; 
              padding: 20px; 
              text-align: center; 
              font-size: 12px; 
              color: #999;
              border-top: 1px solid #ddd;
              border-radius: 0 0 8px 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- LOGO SECTION -->
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; margin-bottom: 20px;">
              ${logoBase64 ? `<img src="${logoBase64}" alt="Store Logo" style="max-width: 200px; height: auto;" />` : '<p style="color: #999;">Welcome</p>'}
            </div>
            
            <div class="header">
              <div class="checkmark">🎉</div>
              <h1>Order Delivered!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your package has arrived safely</p>
            </div>

            <div class="content">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>Great news! Your order has been delivered successfully. We hope you're excited to use your purchase!</p>

              <div class="order-info">
                <p><span class="label">Order ID:</span> <span class="value">#${order._id.toString().slice(-8).toUpperCase()}</span></p>
                <p><span class="label">Delivered on:</span> <span class="value">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                <p><span class="label">Total Amount:</span> <span class="value">₹${order.totalPrice?.toFixed(2) || '0.00'}</span></p>
              </div>

              <div class="review-box">
                <h3>⭐ Share Your Experience</h3>
                <p>We'd love to hear what you think about your purchase! Your feedback helps us improve and helps other customers make informed decisions.</p>
                <a href="${process.env.FRONTEND_URL}/orders" class="cta-button">Write a Review</a>
              </div>

              <div style="background-color: #e7f3ff; padding: 15px; border-radius: 4px; border-left: 4px solid #2196F3; margin: 20px 0;">
                <strong>📞 Need Help?</strong><br/>
                <p style="margin: 10px 0 0 0; font-size: 14px;">If there's any issue with your order or product, please don't hesitate to contact our support team.</p>
              </div>

              <p style="font-size: 13px; color: #666; margin-top: 20px;">
                Thank you for shopping with us! We hope to see you again soon.
              </p>
            </div>

            <div class="footer">
              <p style="margin: 0; padding: 0;">This is an automated email. Please do not reply directly to this email.</p>
              <p style="margin: 10px 0 0 0; padding: 0;">&copy; 2026 Your E-Commerce Store. All rights reserved.</p>
              <p style="margin: 10px 0 0 0; padding: 0; color: #ccc;">Order #${order._id.toString().slice(-8).toUpperCase()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: {
          Data: `Order Delivered - Order #${order._id.toString().slice(-8).toUpperCase()}`
        },
        Body: {
          Html: {
            Data: htmlBody
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`[SUCCESS] Order delivered email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to send order delivered email:');
    console.error('  To:', userEmail);
    console.error('  From:', process.env.AWS_SES_FROM_EMAIL);
    console.error('  Error:', error.message);
    console.error('  Code:', error.$metadata?.httpStatusCode);
    if (error.Code) console.error('  AWS Error Code:', error.Code);
    return false;
  }
};

module.exports = { 
  sendOrderConfirmationEmail, 
  sendOrderDeliveredEmail 
};