# Hybrid Tech Automotive - Website MVP

A modern, responsive website for Hybrid Tech Automotive built with Next.js, React, and TailwindCSS. This MVP provides a complete solution for hybrid battery replacement and car services with online booking, transparent pricing, and customer reviews.

## 🚀 Features

- **Homepage**: Clean landing page with service highlights and call-to-actions
- **Services Catalog**: Complete listing of automotive services with transparent pricing
- **Hybrid Batteries**: Specialized battery replacement services for Toyota and Lexus vehicles
- **Online Booking**: Calendar-based appointment scheduling with email notifications
- **Payment Integration**: Support for Stripe, Zelle, and cash payments
- **Customer Reviews**: Google reviews integration and customer testimonials
- **Blog**: Educational content about hybrid vehicle maintenance and tips
- **Contact Form**: Multiple ways to get in touch with the business
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimized**: Proper meta tags and structured data for search engines

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS with custom design system
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Payments**: Stripe API integration
- **Email**: Nodemailer for notifications
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Business Information
BUSINESS_EMAIL=info@hybridtechauto.com
BUSINESS_PHONE=(123) 456-7890
BUSINESS_ADDRESS=123 Auto Service Street, Your City, ST 12345
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Build for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 📁 Project Structure

```
hybrid-tech-automotive/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── services/          # Services page
│   │   ├── batteries/         # Batteries page
│   │   ├── booking/           # Booking page
│   │   ├── reviews/           # Reviews page
│   │   ├── blog/              # Blog page
│   │   └── contact/           # Contact page
│   ├── components/            # Reusable components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Site footer
│   │   ├── ServiceCard.tsx    # Service display card
│   │   └── BatteryCard.tsx    # Battery display card
│   ├── data/                  # Static data
│   │   ├── batteries.ts       # Battery catalog data
│   │   └── services.ts        # Services catalog data
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:
- Primary: Blue (#007BFF)
- Secondary: Green (#3CB371)
- Customize these colors to match your brand

### Content
- Update business information in `src/components/Header.tsx` and `src/components/Footer.tsx`
- Modify services and battery data in `src/data/` directory
- Add your own blog posts in `src/app/blog/`
- Update contact information throughout the site

### Images
Replace placeholder images with your own:
- Service images: Update URLs in `src/data/services.ts`
- Battery images: Update URLs in `src/data/batteries.ts`
- Blog images: Update URLs in `src/app/blog/page.tsx`

## 📧 Email Configuration

The booking form sends email notifications using Nodemailer. Configure your SMTP settings in the environment variables:

1. For Gmail, use an App Password instead of your regular password
2. Enable 2-factor authentication on your Google account
3. Generate an App Password for this application
4. Use the App Password in the `SMTP_PASS` environment variable

## 💳 Payment Integration

### Stripe Setup
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe dashboard
3. Add them to your environment variables
4. Test payments using Stripe's test mode

### Zelle Integration
The current implementation shows Zelle as a payment option with instructions. For production, you may want to:
- Add a QR code generator for Zelle payments
- Implement payment verification
- Add payment status tracking

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted VPS

## 📱 Mobile Optimization

The website is built with a mobile-first approach:
- Responsive design that works on all screen sizes
- Touch-friendly interface elements
- Optimized images and loading performance
- Fast loading times on mobile networks

## 🔍 SEO Features

- Semantic HTML structure
- Meta tags for all pages
- Open Graph tags for social sharing
- Structured data for search engines
- Fast loading times
- Mobile-friendly design

## 🛠️ Development

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Update navigation in `src/components/Header.tsx`

### Adding New Components
1. Create component files in `src/components/`
2. Export components from the file
3. Import and use in your pages

### Styling
- Use TailwindCSS utility classes
- Add custom styles in `src/app/globals.css`
- Follow the existing design system patterns

## 📞 Support

For technical support or questions about this website:
- Email: info@hybridtechauto.com
- Phone: (123) 456-7890

## 📄 License

This project is proprietary software for Hybrid Tech Automotive. All rights reserved.

---

**Hybrid Tech Automotive** - Professional hybrid battery replacement and car services with transparent pricing and expert repairs.
