# Deployment Guide - Hybrid Tech Automotive

This guide will help you deploy the Hybrid Tech Automotive website to production.

## 🚀 Quick Deploy to Vercel (Recommended)

### 1. Prepare Your Repository
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/hybrid-tech-automotive.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Environment Variables in Vercel
Add these environment variables in your Vercel dashboard:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BUSINESS_EMAIL=info@hybridtechauto.com
BUSINESS_PHONE=(123) 456-7890
BUSINESS_ADDRESS=123 Auto Service Street, Your City, ST 12345
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-random-secret-key
```

## 🔧 Manual Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Test the Build
```bash
npm start
```

### 3. Deploy to Your Hosting Provider

#### Option A: Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

#### Option B: AWS Amplify
1. Connect your GitHub repository to AWS Amplify
2. Set build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
3. Add environment variables in Amplify console

#### Option C: Self-Hosted VPS
1. Set up a VPS with Node.js and PM2
2. Clone your repository
3. Install dependencies: `npm install`
4. Build the application: `npm run build`
5. Start with PM2: `pm2 start npm --name "hybrid-tech" -- start`

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the App Password in `SMTP_PASS`

### Alternative Email Providers
- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Amazon's email service

## 💳 Stripe Configuration

### 1. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete business verification
3. Get your API keys from the dashboard

### 2. Configure Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to environment variables

### 3. Test Payments
- Use Stripe's test mode for development
- Switch to live mode for production
- Update API keys accordingly

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. HTTPS
- Ensure your domain uses HTTPS
- Vercel provides HTTPS by default
- For self-hosting, use Let's Encrypt

### 3. Rate Limiting
Consider adding rate limiting for API endpoints:
```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 📊 Analytics and Monitoring

### 1. Google Analytics
Add Google Analytics to track website performance:
```javascript
// Add to _app.tsx or layout.tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### 2. Error Monitoring
Consider adding error monitoring:
- **Sentry**: Comprehensive error tracking
- **LogRocket**: Session replay and error tracking
- **Bugsnag**: Error monitoring and reporting

## 🚀 Performance Optimization

### 1. Image Optimization
- Use Next.js Image component (already implemented)
- Optimize images before uploading
- Consider using a CDN

### 2. Caching
- Enable Vercel's edge caching
- Use Redis for session storage
- Implement API response caching

### 3. Bundle Analysis
```bash
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## 🔄 Continuous Deployment

### 1. GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test
```

### 2. Branch Protection
- Protect main branch
- Require pull request reviews
- Run tests before merge

## 📱 Mobile Optimization

### 1. PWA Features
Consider adding Progressive Web App features:
- Service worker for offline functionality
- Web app manifest
- Push notifications

### 2. Mobile Testing
- Test on real devices
- Use browser dev tools
- Check Core Web Vitals

## 🎯 SEO Optimization

### 1. Sitemap
Generate sitemap.xml:
```javascript
// pages/sitemap.xml.js
const Sitemap = () => null
export default Sitemap

export async function getServerSideProps({ res }) {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://your-domain.com</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
      </url>
      <!-- Add more URLs -->
    </urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
```

### 2. Meta Tags
- All pages have proper meta tags (already implemented)
- Add Open Graph tags for social sharing
- Include structured data for search engines

## 🛠️ Maintenance

### 1. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Test after updates

### 2. Backup Strategy
- Database backups (if using database)
- Code repository backups
- Environment variable backups

### 3. Monitoring
- Set up uptime monitoring
- Monitor error rates
- Track performance metrics

## 📞 Support

For deployment issues:
- Check Vercel documentation
- Review Next.js deployment guide
- Contact hosting provider support

---

**Next Steps:**
1. Choose your deployment method
2. Set up environment variables
3. Configure email and payment services
4. Test thoroughly
5. Go live! 🎉
