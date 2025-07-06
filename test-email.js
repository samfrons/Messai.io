const { Resend } = require('resend');

const resend = new Resend('re_LaMUXSH4_5bbuM4fipMVmeAXWTcrJrCJZ');

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'samfrons@gmail.com',
      subject: 'Test Email from MESSAi',
      html: '<h1>Test Email</h1><p>This is a test email from MESSAi to verify email configuration is working.</p>',
    });
    
    console.log('Email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('Full response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
  }
}

testEmail();