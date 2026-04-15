import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNewSolutionEmail(to: string, problemTitle: string, problemId: string) {
  const url = `${process.env.NEXTAUTH_URL}/problems/${problemId}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `New solution on your problem — Foundry`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #69F59A;">New Solution Received</h2>
        <p>Someone posted a solution to your problem: <strong>${problemTitle}</strong></p>
        <a href="${url}" style="display: inline-block; background-color: #69F59A; color: #0A0906; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Solution</a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">You can manage notification preferences in your <a href="${process.env.NEXTAUTH_URL}/settings">settings</a>.</p>
      </div>
    `,
  });
}

export async function sendWeeklyDigestEmail(to: string, problems: { title: string; id: string; solutionCount: number }[]) {
  const rows = problems.map(p =>
    `<tr><td style="padding:8px 0;"><a href="${process.env.NEXTAUTH_URL}/problems/${p.id}">${p.title}</a></td><td style="padding:8px 0; text-align:right;">${p.solutionCount} solution${p.solutionCount !== 1 ? 's' : ''}</td></tr>`
  ).join('');
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Your weekly digest — Foundry`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #69F59A;">Weekly Community Digest</h2>
        <p>Here's what happened in the Foundry community this week:</p>
        <table style="width:100%; border-collapse:collapse;">${rows}</table>
        <a href="${process.env.NEXTAUTH_URL}/problems" style="display: inline-block; margin-top:16px; background-color: #69F59A; color: #0A0906; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Browse All Problems</a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">Unsubscribe in your <a href="${process.env.NEXTAUTH_URL}/settings">settings</a>.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Password Reset Request - Foundry',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #69F59A;">Password Reset Request</h2>
        <p>You requested to reset your password for your Foundry account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #69F59A; color: #0A0906; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}