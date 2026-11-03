import nodemailer from 'nodemailer';

export const sendAdminInvitationEmail = async (email, setupLink) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM } = process.env;
  const smtpHost = SMTP_HOST?.trim();
  const smtpUser = SMTP_USER?.trim();
  const smtpPassword = SMTP_PASSWORD?.replace(/\s/g, '');
  const mailFrom = MAIL_FROM?.trim();
  const missingSettings = Object.entries({
    SMTP_HOST: smtpHost,
    SMTP_PORT,
    SMTP_USER: smtpUser,
    SMTP_PASSWORD: smtpPassword,
    MAIL_FROM: mailFrom,
  }).filter(([, value]) => !value).map(([name]) => name);
  if (missingSettings.length) {
    const error = new Error(`Mail is not configured. Add ${missingSettings.join(', ')} to backend/.env.`);
    error.code = 'SMTP_CONFIG_MISSING';
    throw error;
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error('SMTP_PORT must be a valid TCP port in backend/.env.');
    error.code = 'SMTP_CONFIG_INVALID';
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure: port === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  await transporter.sendMail({
    from: mailFrom,
    to: email,
    subject: 'Set up your DCS PARS admin account',
    text: `You have been invited to administer the DCS PARS portal. Set up your account within 24 hours: ${setupLink}`,
    html: `<p>You have been invited to administer the DCS PARS portal.</p><p><a href="${setupLink}">Set up your admin account</a></p><p>This link expires in 24 hours and can only be used once.</p>`,
  });
};
