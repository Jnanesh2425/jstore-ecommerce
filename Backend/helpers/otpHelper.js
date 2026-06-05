const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email using AWS SES
const sendOTPEmail = async (userEmail, otp) => {
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

    const sesClient = new SESClient({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });

    const htmlBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table width="100%" maxwidth="500" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            
                            <!-- HEADER -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: 700;">Email Verification</h1>
                                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Verify your email to complete registration</p>
                                </td>
                            </tr>

                            <!-- CONTENT -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333; line-height: 1.6;">
                                        Hi there,
                                    </p>
                                    
                                    <p style="margin: 0 0 30px 0; font-size: 15px; color: #666; line-height: 1.6;">
                                        Thank you for signing up! Please use the OTP code below to verify your email address. This code will expire in 5 minutes.
                                    </p>

                                    <!-- OTP BOX -->
                                    <div style="background-color: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
                                        <p style="margin: 0 0 10px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
                                        <h2 style="margin: 0; font-size: 40px; color: #667eea; letter-spacing: 8px; font-weight: 700; font-family: 'Courier New', monospace;">${otp}</h2>
                                    </div>

                                    <p style="margin: 30px 0 0 0; font-size: 13px; color: #999;">
                                        If you didn't sign up, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td style="padding: 20px 30px; border-top: 1px solid #e0e0e0; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #999;">
                                        This email was sent to <strong>${userEmail}</strong>
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
        const command = new SendEmailCommand({
            Source: process.env.AWS_SES_FROM_EMAIL,
            Destination: {
                ToAddresses: [userEmail]
            },
            Message: {
                Subject: {
                    Data: 'Verify Your Email - OTP Code',
                    Charset: 'UTF-8'
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        });

        await sesClient.send(command);
        console.log(`[OTP] Email sent successfully to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('[OTP] Error sending email:', error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail
};