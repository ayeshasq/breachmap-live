# 🚀 DEPLOYMENT GUIDE - Step by Step

Follow these EXACT steps to deploy your BreachMap Live app.

---

## ✅ METHOD 1: Vercel CLI (Fastest - 2 minutes)

### Step 1: Install Node.js (if not installed)

**Check if you have it:**
```bash
node --version
```

**If not, install:**
- Mac: `brew install node`
- Windows: Download from https://nodejs.org/
- Linux: `sudo apt install nodejs npm`

---

### Step 2: Extract Project Files

```bash
# Create project folder
mkdir ~/breachmap-live
cd ~/breachmap-live

# Extract the ZIP file you downloaded
# (Drag the files here or use unzip command)
unzip ~/Downloads/breachmap-fresh.zip
cd breachmap-fresh
```

---

### Step 3: Install Dependencies

```bash
npm install
```

This takes 1-2 minutes. You'll see a progress bar.

---

### Step 4: Test Locally (Optional)

```bash
npm run dev
```

Open: http://localhost:3000

Press `Ctrl+C` to stop.

---

### Step 5: Install Vercel CLI

```bash
npm install -g vercel
```

---

### Step 6: Login to Vercel

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to sign up/login (use GitHub, it's easiest)
3. Click "Authorize"

---

### Step 7: Deploy!

```bash
vercel
```

**Answer the prompts:**

```
? Set up and deploy "~/breachmap-live/breachmap-fresh"? [Y/n] 
→ Press Y and Enter

? Which scope do you want to deploy to?
→ Select your username

? Link to existing project? [y/N]
→ Press N and Enter

? What's your project's name?
→ Type: breachmap-live (or any name you want)

? In which directory is your code located?
→ Press Enter (default ./)

? Want to override the settings? [y/N]
→ Press N and Enter
```

**Wait 30-60 seconds...**

You'll see:
```
✅ Production: https://breachmap-live-xxx.vercel.app
```

**DONE! Your app is live!** 🎉

---

### Step 8: Deploy to Production Domain

```bash
vercel --prod
```

This gives you a permanent URL.

---

## ✅ METHOD 2: Vercel Dashboard (No Command Line)

### Step 1: Push to GitHub

1. **Create GitHub account** if you don't have one: https://github.com/
2. **Create new repository**:
   - Click "+" → "New repository"
   - Name: `breachmap-live`
   - Click "Create repository"

3. **Upload files**:
   - Click "uploading an existing file"
   - Drag all your project files
   - Click "Commit changes"

---

### Step 2: Connect to Vercel

1. Go to: https://vercel.com/
2. Click "Sign Up" → Use GitHub
3. Click "New Project"
4. Find your `breachmap-live` repository
5. Click "Import"
6. Click "Deploy"

**Wait 1-2 minutes...**

**DONE!** You'll get a live URL like: `https://breachmap-live.vercel.app`

---

## 🎯 What You Get

After deployment, your app will have:

✅ Live URL (e.g., `breachmap-live.vercel.app`)  
✅ Automatic HTTPS  
✅ Global CDN (fast worldwide)  
✅ Auto-deploys on code changes  
✅ Free hosting forever  

---

## 🔧 Troubleshooting

### "command not found: vercel"
```bash
# Reinstall
npm install -g vercel

# Or use npx (no install needed)
npx vercel
```

### "command not found: npm"
```bash
# Install Node.js first
# Mac:
brew install node

# Windows:
# Download from https://nodejs.org/
```

### Build fails
```bash
# Make sure you have all files:
ls -la

# Should see:
# - package.json
# - pages/
# - styles/
# - next.config.js
```

### Port 3000 already in use
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

---

## 📱 Access Your Live App

After deployment, you can:

1. **Share the URL** with anyone
2. **Add custom domain** in Vercel dashboard
3. **Update anytime** - just push to GitHub or run `vercel`

---

## 🎨 Customize Your App

Edit these files:

- **`pages/index.js`** - Main app logic
- **`styles/globals.css`** - Colors and styling
- **`README.md`** - Documentation

Then redeploy:
```bash
vercel --prod
```

---

## 🆘 Still Stuck?

### Quick Diagnostic:
```bash
# Check Node.js
node --version
npm --version

# Check files
ls -la

# Check package.json
cat package.json
```

**Common Issues:**

1. **"Cannot find module"** → Run `npm install`
2. **"Port in use"** → Kill the process or use different port
3. **"Build failed"** → Check for syntax errors in index.js
4. **"Unauthorized"** → Run `vercel login` again

---

## 🎉 Success Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] Project files extracted
- [ ] Dependencies installed (`npm install` completed)
- [ ] App runs locally (`npm run dev` works)
- [ ] Vercel CLI installed (`vercel --version` works)
- [ ] Logged into Vercel (`vercel login` completed)
- [ ] Deployed successfully (`vercel` command worked)
- [ ] Got live URL
- [ ] App loads in browser

**If all checked, you're done!** 🚀

---

## 📞 Next Steps

1. **Test your app** - Open the Vercel URL
2. **Share it** - Send the link to friends
3. **Customize** - Edit the code and redeploy
4. **Add features** - Follow the full guide for Mapbox integration

**Congratulations on deploying your BreachMap!** 🌍✨
