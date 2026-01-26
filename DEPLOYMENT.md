# Vercel Deployment Guide

## Pre-deployment Checklist

### 1. Environment Variables
Set these in Vercel Dashboard > Settings > Environment Variables:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-admin-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 2. Build Settings
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x

### 3. Database Setup
Ensure your MongoDB database is accessible from Vercel's IP ranges.

### 4. Domain Configuration
Update NEXTAUTH_URL to match your Vercel domain after deployment.

## Deployment Steps

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy from main branch
4. Update NEXTAUTH_URL with your Vercel domain
5. Redeploy to apply the updated URL

## Post-deployment
- Test admin login with configured credentials
- Verify database connections
- Check all API routes functionality