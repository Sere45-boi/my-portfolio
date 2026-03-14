const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    let data = req.body;

    if (!data || typeof data === 'string') {
      try {
        data = JSON.parse(req.body || '{}');
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const { name, email, company, service, message } = data;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields (name, email, message)' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error('SMTP credentials are missing in environment variables');
      return res.status(500).json({ error: 'Email sender not configured' });
    }

    const recipientEmail = process.env.RECIPIENT_EMAIL || 'damilareweb33@gmail.com';
    if (!recipientEmail) {
      console.error('Recipient email is missing');
      return res.status(500).json({ error: 'Recipient email not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"Website Contact" <${smtpUser}>`,
      to: recipientEmail,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || '-'}\nService: ${service || '-'}\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> ${email}</p>
           <p><strong>Company:</strong> ${company || '-'}</p>
           <p><strong>Service:</strong> ${service || '-'}</p>
           <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ ok: true, message: 'Email sent' });
  } catch (error) {
    console.error('Email send error:', error);
    const errMsg = error && error.message ? error.message : 'Could not send email';
    return res.status(500).json({ error: 'Could not send email', detail: errMsg });
  }
};