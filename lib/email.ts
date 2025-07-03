import nodemailer from 'nodemailer';

// Create transporter
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

// Email templates
const emailTemplates = {
  verification: (verificationUrl: string) => ({
    subject: 'Verify your MESSAi account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B00 0%, #00D4FF 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f4f4f4; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF6B00; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MESSAi</h1>
              <p>Microbial Electrochemical Systems AI Platform</p>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up for MESSAi! To complete your registration and access all features, please verify your email address.</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 MESSAi - Advancing Bioelectrochemical Research</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to MESSAi!
      
      Please verify your email address by clicking the link below:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
    `,
  }),

  passwordReset: (resetUrl: string) => ({
    subject: 'Reset your MESSAi password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B00 0%, #00D4FF 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f4f4f4; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF6B00; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MESSAi Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>You requested to reset your password for your MESSAi account. Click the button below to create a new password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 1 hour for security reasons.</p>
                <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 MESSAi - Advancing Bioelectrochemical Research</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      MESSAi Password Reset
      
      You requested to reset your password. Click the link below to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `,
  }),

  welcome: (name: string) => ({
    subject: 'Welcome to MESSAi!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF6B00 0%, #00D4FF 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f4f4f4; padding: 30px; }
            .feature { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #FF6B00; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to MESSAi, ${name || 'Researcher'}!</h1>
              <p>Your journey in bioelectrochemical research starts here</p>
            </div>
            <div class="content">
              <h2>Get Started with MESSAi</h2>
              <p>Your account is now fully activated. Here's what you can do:</p>
              
              <div class="feature">
                <h3>🧬 Explore System Designs</h3>
                <p>Browse our catalog of 13+ validated bioelectrochemical system designs, from simple mason jars to industrial-scale reactors.</p>
              </div>
              
              <div class="feature">
                <h3>🎨 Interactive 3D Modeling</h3>
                <p>Visualize and interact with realistic 3D models of MFCs, MECs, and other bioelectrochemical systems.</p>
              </div>
              
              <div class="feature">
                <h3>🤖 AI-Powered Predictions</h3>
                <p>Get instant power output predictions based on your experimental parameters.</p>
              </div>
              
              <div class="feature">
                <h3>📊 Track Experiments</h3>
                <p>Create, monitor, and analyze your experiments with our comprehensive tracking system.</p>
              </div>
              
              <center>
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Go to Dashboard</a>
              </center>
              
              <h3>Need Help?</h3>
              <p>Check out our <a href="${process.env.NEXTAUTH_URL}/docs">documentation</a> or reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 MESSAi - Advancing Bioelectrochemical Research</p>
              <p>Follow us on <a href="#">Twitter</a> | <a href="#">LinkedIn</a> | <a href="#">GitHub</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to MESSAi, ${name || 'Researcher'}!
      
      Your account is now fully activated. Here's what you can do:
      
      - Explore 13+ validated bioelectrochemical system designs
      - Interact with 3D models of MFCs, MECs, and more
      - Get AI-powered predictions for your experiments
      - Track and analyze your research data
      
      Get started: ${process.env.NEXTAUTH_URL}/dashboard
      
      Need help? Check our documentation at ${process.env.NEXTAUTH_URL}/docs
    `,
  }),
};

// Send email function
async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!transporter) {
    console.log('Email service not configured. Email would have been sent to:', to);
    console.log('Subject:', subject);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"MESSAi" <${process.env.EMAIL_FROM || 'noreply@messai.com'}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}

// Export email functions
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  const { subject, html, text } = emailTemplates.verification(verificationUrl);
  return sendEmail(email, subject, html, text);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const { subject, html, text } = emailTemplates.passwordReset(resetUrl);
  return sendEmail(email, subject, html, text);
}

export async function sendWelcomeEmail(email: string, name: string) {
  const { subject, html, text } = emailTemplates.welcome(name);
  return sendEmail(email, subject, html, text);
}