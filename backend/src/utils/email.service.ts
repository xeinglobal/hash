import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Gmail için transporter oluştur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendPasswordResetEmail = async (
  email: string, 
  resetLink: string, 
  userName: string
) => {
  try {
    console.log('E-posta gönderiliyor:', email);
    console.log('Reset link:', resetLink);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'XEIN Platform'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hello ${userName},</p>
          <p>You have requested a password reset for your Xein platform account.</p>
          <p>Click on the link below to reset your password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset My Password</a>
          </p>
          <p>This link is valid for 1 hour.</p>
          <p>If you have not requested a password reset, you can ignore this email..</p>
          <p>Best regards,<br>XEIN Platform Teams</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta gönderildi:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return { success: false, error };
  }
}; 