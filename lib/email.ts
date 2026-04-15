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

const BASE_URL = process.env.NEXTAUTH_URL || '';
const FROM = process.env.SMTP_FROM || process.env.SMTP_USER;

function baseTemplate(title: string, body: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#e5e5e5;background:#0A0906;padding:32px;border-radius:8px;">
      <h2 style="color:#69F59A;margin-top:0;">${title}</h2>
      ${body}
      <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:16px;">
        Manage your notification preferences in your <a href="${BASE_URL}/settings" style="color:#69F59A;">settings</a>.
      </p>
    </div>
  `;
}

function ctaButton(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:#69F59A;color:#0A0906;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;margin-top:16px;">${text}</a>`;
}

// ── Existing ─────────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Password Reset Request — Foundry',
    html: baseTemplate('Password Reset Request', `
      <p>You requested to reset your password for your Foundry account.</p>
      ${ctaButton('Reset Password', resetUrl)}
      <p style="color:#888;font-size:13px;margin-top:16px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `),
  });
}

export async function sendNewSolutionEmail(to: string, problemTitle: string, problemId: string) {
  const url = `${BASE_URL}/problems/${problemId}`;
  await transporter.sendMail({
    from: FROM, to,
    subject: 'New solution on your problem — Foundry',
    html: baseTemplate('New Solution Received', `
      <p>Someone posted a solution to your problem: <strong>${problemTitle}</strong></p>
      ${ctaButton('View Solution', url)}
    `),
  });
}

export async function sendWeeklyDigestEmail(to: string, problems: { title: string; id: string; solutionCount: number }[]) {
  const rows = problems.map(p =>
    `<tr><td style="padding:8px 0;"><a href="${BASE_URL}/problems/${p.id}" style="color:#69F59A;">${p.title}</a></td><td style="padding:8px 0;text-align:right;">${p.solutionCount} solution${p.solutionCount !== 1 ? 's' : ''}</td></tr>`
  ).join('');
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Your weekly digest — Foundry',
    html: baseTemplate('Weekly Community Digest', `
      <p>Here's what happened in the Foundry community this week:</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      ${ctaButton('Browse All Problems', `${BASE_URL}/problems`)}
    `),
  });
}

// ── New ───────────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Welcome to Foundry 🚀',
    html: baseTemplate(`Welcome to Foundry, ${name}!`, `
      <p>You're now part of a community of entrepreneurs helping each other build faster.</p>
      <p>Here's what you can do:</p>
      <ul style="line-height:2;">
        <li>Post your startup problems and get structured solutions</li>
        <li>Browse the knowledge base for answers that already exist</li>
        <li>Connect with experienced mentors</li>
      </ul>
      ${ctaButton('Go to Dashboard', `${BASE_URL}/dashboard`)}
    `),
  });
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Your password was changed — Foundry',
    html: baseTemplate('Password Changed Successfully', `
      <p>Hi ${name}, your Foundry account password was just changed.</p>
      <p>If you made this change, no action is needed.</p>
      <p style="color:#f87171;">If you did not change your password, please reset it immediately.</p>
      ${ctaButton('Reset Password', `${BASE_URL}/reset-password`)}
    `),
  });
}

export async function sendSolutionVerifiedEmail(to: string, problemTitle: string, problemId: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Your solution was verified ✅ — Foundry',
    html: baseTemplate('Solution Verified!', `
      <p>Great news! Your solution to <strong>${problemTitle}</strong> has been marked as verified.</p>
      <p>Verified solutions earn extra reputation and are highlighted in the knowledge base.</p>
      ${ctaButton('View Solution', `${BASE_URL}/problems/${problemId}`)}
    `),
  });
}

export async function sendMentorApplicationStatusEmail(
  to: string,
  name: string,
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_INFO',
  reviewNotes?: string
) {
  const statusMap = {
    APPROVED: { label: 'Approved 🎉', color: '#69F59A', message: 'Congratulations! Your mentor application has been approved. You now have full mentor access on Foundry.' },
    REJECTED: { label: 'Not Approved', color: '#f87171', message: 'After careful review, we were unable to approve your mentor application at this time.' },
    NEEDS_INFO: { label: 'More Information Needed', color: '#fbbf24', message: 'We reviewed your application and need some additional information before we can proceed.' },
  };
  const { label, color, message } = statusMap[status];
  await transporter.sendMail({
    from: FROM, to,
    subject: `Mentor application update: ${label} — Foundry`,
    html: baseTemplate(`Mentor Application: <span style="color:${color};">${label}</span>`, `
      <p>Hi ${name},</p>
      <p>${message}</p>
      ${reviewNotes ? `<div style="background:#1a1a1a;border-left:3px solid ${color};padding:12px 16px;margin:16px 0;border-radius:4px;"><strong>Admin notes:</strong><br/>${reviewNotes}</div>` : ''}
      ${ctaButton('View Application Status', `${BASE_URL}/apply-mentor`)}
    `),
  });
}

export async function sendNewMentorApplicationAdminEmail(applicantName: string, applicantEmail: string, expertise: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  await transporter.sendMail({
    from: FROM, to: adminEmail,
    subject: `New mentor application from ${applicantName} — Foundry`,
    html: baseTemplate('New Mentor Application', `
      <p>A new mentor application has been submitted and is awaiting your review.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:6px 0;color:#888;">Name</td><td style="padding:6px 0;">${applicantName}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;">${applicantEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Expertise</td><td style="padding:6px 0;">${expertise}</td></tr>
      </table>
      ${ctaButton('Review Application', `${BASE_URL}/admin`)}
    `),
  });
}

export async function sendUpgradeConfirmationEmail(to: string, name: string, plan: string, endDate?: Date) {
  const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();
  const expiryLine = endDate
    ? `<p>Your plan is active until <strong>${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>`
    : '';
  await transporter.sendMail({
    from: FROM, to,
    subject: `You're now on the ${planLabel} plan 🎉 — Foundry`,
    html: baseTemplate(`Welcome to ${planLabel}!`, `
      <p>Hi ${name}, your upgrade to the <strong>${planLabel}</strong> plan is confirmed.</p>
      ${expiryLine}
      <p>You now have access to all ${planLabel} features including priority problem posting, full knowledge base access, and premium mentor responses.</p>
      ${ctaButton('Go to Dashboard', `${BASE_URL}/dashboard`)}
    `),
  });
}

export async function sendSubscriptionExpiryReminderEmail(to: string, name: string, plan: string, endDate: Date) {
  const planLabel = plan.charAt(0) + plan.slice(1).toLowerCase();
  const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  await transporter.sendMail({
    from: FROM, to,
    subject: `Your ${planLabel} plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — Foundry`,
    html: baseTemplate('Subscription Expiring Soon', `
      <p>Hi ${name}, your <strong>${planLabel}</strong> plan expires on <strong>${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
      <p>Renew now to keep access to all your premium features without interruption.</p>
      ${ctaButton('Renew Plan', `${BASE_URL}/upgrade`)}
    `),
  });
}

export async function sendNewMessageEmail(to: string, recipientName: string, senderName: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `New message from ${senderName} — Foundry`,
    html: baseTemplate('You have a new message', `
      <p>Hi ${recipientName}, <strong>${senderName}</strong> sent you a message on Foundry.</p>
      ${ctaButton('View Message', `${BASE_URL}/messages`)}
    `),
  });
}
