# Change Password Functionality Setup

## Manual Steps Required:

### 1. Database Schema Update
Add this to your Prisma schema (`prisma/schema.prisma`):

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@map("password_reset_tokens")
}
```

Also add this to your User model:
```prisma
model User {
  // ... existing fields
  passwordResetTokens PasswordResetToken[]
}
```

### 2. Run Database Migration
```bash
npx prisma db push
# or
npx prisma migrate dev --name add-password-reset-tokens
```

### 3. Environment Variables
Add these to your `.env.local` file:

```env
# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Required for reset links
NEXTAUTH_URL=http://localhost:3000
```

### 4. Gmail App Password Setup (if using Gmail):
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Use the App Password as SMTP_PASS

### 5. Alternative Email Providers:
- **SendGrid**: Use API key instead of SMTP
- **Mailgun**: Configure SMTP settings
- **AWS SES**: Use AWS credentials

## How It Works:

1. User clicks "Change Password" in Settings
2. Modal asks for email confirmation
3. System generates secure token and sends email
4. User clicks link in email → redirected to reset page
5. User enters new password → password updated in database
6. Token is marked as used to prevent reuse

## Security Features:

- Tokens expire in 1 hour
- Tokens can only be used once
- Email must match current user's email
- Passwords are hashed with bcrypt
- Secure token generation using crypto.randomBytes

## Files Created:

- `/lib/email.ts` - Email sending utility
- `/app/api/change-password/route.ts` - Initiate password reset
- `/app/api/reset-password/route.ts` - Complete password reset
- `/app/reset-password/page.tsx` - Reset password form
- Updated `/app/settings/page.tsx` - Added change password modal