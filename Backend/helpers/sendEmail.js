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

// Logo URL - Use a hosted URL instead of base64 (email clients block embedded base64 for security)
// Change this to your actual logo URL or upload to AWS S3
const logoURL = process.env.LOGO_URL || 'https://via.placeholder.com/180x180?text=JStore';
console.log('[EMAIL] Logo URL configured:', logoURL);

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
        <td style="padding: 14px 16px; border-bottom: 1px solid #e0e0e0; font-weight: 500; color: #333;">
          ${item.productName}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e0e0e0; text-align: center; color: #666;">
          ${item.quantity}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e0e0e0; text-align: right; color: #333; font-weight: 500;">
          ₹${item.sellingPrice?.toFixed(2) || '0.00'}
        </td>
      </tr>
    `).join('');

    const subtotal = (order.products || []).reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const discount = order.totalAmount ? (subtotal - order.totalAmount) : 0;

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table width="100%" maxwidth="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- HEADER WITH LOGO -->
                  <tr>
                    <td style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid #1a73e8;">
                      <img src="${logoURL}" alt="Store Logo" style="max-width: 180px; height: auto; margin-bottom: 15px;" />
                      <h1 style="margin: 0; font-size: 32px; color: #1a73e8; font-weight: 700;">Order Confirmed! ✅</h1>
                      <p style="margin: 8px 0 0 0; color: #666; font-size: 16px;">Thank you for your order</p>
                    </td>
                  </tr>

                  <!-- GREETING -->
                  <tr>
                    <td style="padding: 30px 30px 10px 30px;">
                      <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                    </td>
                  </tr>

                  <!-- MAIN MESSAGE -->
                  <tr>
                    <td style="padding: 10px 30px 25px 30px;">
                      <p style="margin: 0; font-size: 15px; color: #666; line-height: 1.6;">
                        Your order has been successfully placed and payment has been received. We're now preparing your order for shipment and will update you soon with tracking details.
                      </p>
                    </td>
                  </tr>

                  <!-- ORDER DETAILS CARD -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%); border-left: 4px solid #1a73e8; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px 20px 10px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Order ID</span><br>
                                  <span style="font-size: 18px; color: #1a73e8; font-weight: 700;">
                                    #${order._id.toString().slice(-8).toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Order Date</span><br>
                                  <span style="font-size: 14px; color: #333; font-weight: 500;">
                                    ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Payment Status</span><br>
                                  <span style="font-size: 14px; color: #28a745; font-weight: 600;">✓ Successfully Received</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- ORDER ITEMS SECTION -->
                  <tr>
                    <td style="padding: 25px 30px 10px 30px;">
                      <h2 style="margin: 0; font-size: 18px; color: #333; font-weight: 700;">Order Items</h2>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 30px 20px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <thead>
                          <tr style="background-color: #f5f7fa; border-bottom: 2px solid #1a73e8;">
                            <th style="padding: 14px 16px; text-align: left; font-weight: 700; color: #333; font-size: 13px; text-transform: uppercase;">Product</th>
                            <th style="padding: 14px 16px; text-align: center; font-weight: 700; color: #333; font-size: 13px; text-transform: uppercase;">Qty</th>
                            <th style="padding: 14px 16px; text-align: right; font-weight: 700; color: #333; font-size: 13px; text-transform: uppercase;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <!-- PRICING SUMMARY -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px;">
                        <tr>
                          <td style="padding: 14px 16px; text-align: right; color: #666; font-size: 14px;">
                            Subtotal:
                          </td>
                          <td style="padding: 14px 16px; text-align: right; color: #666; font-size: 14px; min-width: 100px;">
                            ₹${subtotal.toFixed(2)}
                          </td>
                        </tr>
                        ${discount > 0 ? `
                        <tr>
                          <td style="padding: 8px 16px; text-align: right; color: #28a745; font-size: 14px;">
                            Discount:
                          </td>
                          <td style="padding: 8px 16px; text-align: right; color: #28a745; font-size: 14px; font-weight: 600;">
                            -₹${discount.toFixed(2)}
                          </td>
                        </tr>
                        ` : ''}
                        <tr style="border-top: 2px solid #ddd;">
                          <td style="padding: 16px; text-align: right; color: #333; font-size: 16px; font-weight: 700;">
                            Total Amount:
                          </td>
                          <td style="padding: 16px; text-align: right; color: #1a73e8; font-size: 20px; font-weight: 700;">
                            ₹${order.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- DELIVERY ADDRESS -->
                  <tr>
                    <td style="padding: 25px 30px 10px 30px;">
                      <h2 style="margin: 0; font-size: 18px; color: #333; font-weight: 700;">📦 Delivery Address</h2>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <div style="background-color: #f5f7fa; padding: 18px; border-left: 4px solid #28a745; border-radius: 4px; line-height: 1.8;">
                        <p style="margin: 0 0 4px 0; font-weight: 700; color: #333; font-size: 16px;">
                          ${order.address?.name || 'N/A'}
                        </p>
                        <p style="margin: 0; color: #666; font-size: 14px;">
                          ${order.address?.address || 'N/A'}
                        </p>
                        <p style="margin: 0; color: #666; font-size: 14px;">
                          ${order.address?.city || 'N/A'}, ${order.address?.state || 'N/A'} ${order.address?.pincode || 'N/A'}
                        </p>
                        <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                          <strong>Phone:</strong> ${order.address?.mobile || 'N/A'}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- DELIVERY TIMELINE -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <div style="background-color: #e3f2fd; padding: 18px; border-left: 4px solid #2196F3; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; font-weight: 700; color: #1565c0; font-size: 15px;">
                          ⏱️ Expected Delivery: 3-5 Business Days
                        </p>
                        <p style="margin: 0; color: #0d47a1; font-size: 13px; line-height: 1.6;">
                          Your order is being prepared for shipment. We'll send you a shipping confirmation with tracking details within 24 hours. You can track your order status anytime from your account.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- HELP SECTION -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #fffbea; padding: 18px; border-left: 4px solid #ffc107; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; font-weight: 700; color: #856404; font-size: 15px;">
                          ❓ Need Help?
                        </p>
                        <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
                          If you have any questions about your order or need assistance, please don't hesitate to contact our customer support team. We're here to help!
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 25px 30px; border-top: 1px solid #ddd; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 13px; color: #888; line-height: 1.6;">
                        This is an automated email. Please do not reply directly to this email.<br>
                        For support, contact our help center or reply through our website.
                      </p>
                      <p style="margin: 12px 0 0 0; font-size: 12px; color: #aaa;">
                        &copy; 2026 JStore. All rights reserved.<br>
                        <strong>Order Reference: #${order._id.toString().slice(-8).toUpperCase()}</strong>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
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
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
            <tr>
              <td align="center" style="padding: 20px 0;">
                <table width="100%" maxwidth="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- HEADER WITH LOGO -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #28a745;">
                      <img src="${logoURL}" alt="Store Logo" style="max-width: 180px; height: auto; margin-bottom: 15px; filter: brightness(1.1);" />
                      <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700;">Order Delivered! 🎉</h1>
                      <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 16px;">Your package has arrived safely</p>
                    </td>
                  </tr>

                  <!-- GREETING -->
                  <tr>
                    <td style="padding: 30px 30px 10px 30px;">
                      <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                    </td>
                  </tr>

                  <!-- MAIN MESSAGE -->
                  <tr>
                    <td style="padding: 10px 30px 25px 30px;">
                      <p style="margin: 0; font-size: 15px; color: #666; line-height: 1.6;">
                        Great news! Your order has been successfully delivered. We hope you're excited about your purchase and enjoying your new item(s)!
                      </p>
                    </td>
                  </tr>

                  <!-- ORDER DETAILS CARD -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%); border-left: 4px solid #28a745; border-radius: 4px;">
                        <tr>
                          <td style="padding: 20px 20px 10px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; width: 50%;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Order ID</span><br>
                                  <span style="font-size: 18px; color: #28a745; font-weight: 700;">
                                    #${order._id.toString().slice(-8).toUpperCase()}
                                  </span>
                                </td>
                                <td style="padding: 8px 0 8px 20px; border-bottom: 1px solid #e0e0e0;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Delivered On</span><br>
                                  <span style="font-size: 14px; color: #333; font-weight: 500;">
                                    ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding: 12px 0;">
                                  <span style="font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase;">Total Amount</span><br>
                                  <span style="font-size: 18px; color: #28a745; font-weight: 700;">
                                    ₹${order.totalPrice?.toFixed(2) || order.totalAmount?.toFixed(2) || '0.00'}
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- SATISFACTION SECTION -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <div style="background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%); padding: 20px; border-left: 4px solid #ffc107; border-radius: 4px; text-align: center;">
                        <p style="margin: 0 0 12px 0; font-size: 24px;">⭐</p>
                        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; font-weight: 700;">Share Your Experience</h3>
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 13px; line-height: 1.6;">
                          Your feedback is invaluable to us! Share your experience and help other customers discover great products.
                        </p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${process.env.FRONTEND_URL}/orders" style="display: inline-block; background-color: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 700; font-size: 14px;">
                                Write a Review
                              </a>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- NEXT STEPS -->
                  <tr>
                    <td style="padding: 0 30px 25px 30px;">
                      <div style="background-color: #f5f7fa; padding: 20px; border-radius: 4px; border-top: 3px solid #1a73e8;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333; font-weight: 700;">What's Next?</h3>
                        <ul style="margin: 0; padding: 0 0 0 20px; color: #666; font-size: 14px; line-height: 2;">
                          <li>Inspect your product for any damage during delivery</li>
                          <li>Share your honest review to help other customers</li>
                          <li>Keep your tracking number for reference: <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong></li>
                          <li>Contact us if you have any issues with your order</li>
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <!-- SUPPORT SECTION -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <div style="background-color: #e3f2fd; padding: 18px; border-left: 4px solid #2196F3; border-radius: 4px;">
                        <p style="margin: 0 0 8px 0; font-weight: 700; color: #1565c0; font-size: 15px;">
                          📞 Need Assistance?
                        </p>
                        <p style="margin: 0; color: #0d47a1; font-size: 13px; line-height: 1.6;">
                          If there's any issue with your order or product, our customer support team is always ready to help. Don't hesitate to reach out!
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 25px 30px; border-top: 1px solid #ddd; text-align: center;">
                      <p style="margin: 0 0 10px 0; font-size: 13px; color: #888; line-height: 1.6;">
                        Thank you for shopping with us! We truly appreciate your business and look forward to serving you again.
                      </p>
                      <p style="margin: 12px 0 0 0; font-size: 12px; color: #aaa;">
                        &copy; 2026 JStore. All rights reserved.<br>
                        <strong>Order Reference: #${order._id.toString().slice(-8).toUpperCase()}</strong>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
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

const sendPasswordResetEmail = async (userEmail, resetCode) => {
  const htmlBody = `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table width="100%" maxwidth="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- HEADER -->
                <tr>
                  <td style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 3px solid #d32f2f;">
                    <h1 style="margin: 0; font-size: 32px; color: #d32f2f; font-weight: 700;">Password Reset Code</h1>
                  </td>
                </tr>

                <!-- MESSAGE -->
                <tr>
                  <td style="padding: 30px 30px 10px 30px;">
                    <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.6;">
                      Hi there,
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px 30px 25px 30px;">
                    <p style="margin: 0; font-size: 15px; color: #666; line-height: 1.6;">
                      We received a request to reset your password. Use the code below to reset it:
                    </p>
                  </td>
                </tr>

                <!-- RESET CODE -->
                <tr>
                  <td style="padding: 0 30px 25px 30px;">
                    <div style="background-color: #f0f0f0; border-radius: 8px; padding: 25px; text-align: center;">
                      <h2 style="color: #d32f2f; letter-spacing: 10px; margin: 0; font-size: 40px; font-weight: 700;">
                        ${resetCode}
                      </h2>
                    </div>
                  </td>
                </tr>

                <!-- EXPIRY INFO -->
                <tr>
                  <td style="padding: 0 30px 25px 30px;">
                    <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107;">
                      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                        <strong>⏰ Important:</strong> This code will expire in <strong>5 minutes</strong>. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- SAFETY NOTICE -->
                <tr>
                  <td style="padding: 0 30px 30px 30px;">
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; border-left: 4px solid #4caf50;">
                      <p style="margin: 0; color: #2e7d32; font-size: 13px; line-height: 1.6;">
                        🔒 <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for this code.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 25px 30px; border-top: 1px solid #ddd; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #888; line-height: 1.6;">
                      If you need further assistance, please contact our support team.
                    </p>
                    <p style="margin: 12px 0 0 0; font-size: 12px; color: #aaa;">
                      &copy; 2026 JStore. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const params = {
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [userEmail]
      },
      Message: {
        Subject: {
          Data: 'Password Reset Code - JStore'
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
    console.log(`[SUCCESS] Password reset email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('[ERROR] Failed to send password reset email:');
    console.error('  To:', userEmail);
    console.error('  Error:', error.message);
    return false;
  }
};

module.exports = { 
  sendOrderConfirmationEmail, 
  sendOrderDeliveredEmail,
  sendPasswordResetEmail
};