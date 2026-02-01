# 🌍 BreachMap Live - Cyber Threat Visualization

A real-time cyber threat map with AI-powered educational content.

## 🚀 Quick Deploy to Vercel (1-Click)

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

Follow the prompts:
- **Setup and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **What's your project's name?** breachmap-live
- **In which directory is your code located?** ./
- **Override settings?** N

4. **Deploy to Production**
```bash
vercel --prod
```

**Done! Your app is live!** 🎉

---

### Option 2: Deploy via Vercel Dashboard

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/breachmap-live.git
git push -u origin main
```

2. **Go to Vercel**
- Visit: https://vercel.com/
- Click "New Project"
- Import your GitHub repository
- Click "Deploy"

**Done!** ✅

---

## 💻 Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open http://localhost:3000

---

## 📦 What's Included

✅ Real-time attack feed simulation  
✅ Interactive attack details panel  
✅ 3-tier learning system (Beginner/Intermediate/Expert)  
✅ Live statistics dashboard  
✅ Responsive design  
✅ Zero configuration needed

---

## 🔧 Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Vercel** - Hosting

---

## 🎨 Features

### Current Demo Includes:
- ✅ Live attack feed with real-time updates
- ✅ Attack severity indicators (critical/high/medium/low)
- ✅ Interactive attack details
- ✅ AI-powered explanations at 3 levels
- ✅ Beautiful cyber-themed UI

### Full Version Would Include:
- 🗺️ 3D rotating globe (Mapbox)
- 🎯 Animated attack trajectories
- 🔌 WebSocket real-time updates
- 🤖 OpenAI-powered dynamic explanations
- 📊 Advanced analytics
- 🗄️ Database integration
- 🔐 User authentication

---

## 📝 Customization

Edit `pages/index.js` to customize:
- Attack types
- Countries
- Explanations
- Colors and styling

---

## 🌐 Environment Variables (Optional)

For full features, create `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_API_URL=your_backend_url
```

---

## 🚀 Deployment Checklist

- [x] No build errors
- [x] No external dependencies required
- [x] Responsive design
- [x] Zero configuration deployment
- [x] Works on Vercel free tier

---

## 📞 Support

Questions? Issues? Open an issue on GitHub!

---

## 📄 License

MIT License - Free to use for personal and commercial projects.

---

**Made with ❤️ for cybersecurity education**
