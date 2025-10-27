# Deployment Guide

## Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GogiLoloyan/masonry-photo-gallery)

### Option 2: Manual Deploy

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Sign up for Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" and choose "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

3. **Import your project**
   - Click "Add New..." → "Project"
   - Select your `masonry-photo-gallery` repository
   - Click "Import"

4. **Configure (Auto-detected)**
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

5. **Add Environment Variables** (if needed)
   - If you have API keys or env variables, add them in the "Environment Variables" section
   - Example: `VITE_PEXELS_API_KEY=your_api_key_here`

6. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes for the build to complete
   - Your site will be live at `https://your-project-name.vercel.app`

### Automatic Deployments

Once connected, Vercel will automatically:
- Deploy every push to `main` branch to production
- Create preview deployments for pull requests
- Show build logs and deployment status

---

## Alternative: Deploy to Netlify

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Import from GitHub**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://random-name.netlify.app`

---

## Alternative: Deploy to GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://GogiLoloyan.github.io/masonry-photo-gallery"
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/masonry-photo-gallery/',
     // ... rest of config
   });
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `gh-pages`
   - Your site will be live at the homepage URL

---

## Environment Variables

If your app uses environment variables (like API keys), make sure to add them to your deployment platform:

### Vercel
- Go to Project Settings → Environment Variables
- Add your variables (e.g., `VITE_PEXELS_API_KEY`)

### Netlify
- Go to Site settings → Environment variables
- Add your variables

### GitHub Pages
- Since GitHub Pages is static hosting, you'll need to build with the variables:
  ```bash
  VITE_PEXELS_API_KEY=your_key npm run build
  npm run deploy
  ```

---

## Troubleshooting

### Build fails
- Check build logs for errors
- Test build locally: `npm run build`
- Ensure all dependencies are in `package.json`

### 404 on page refresh
- Make sure the `vercel.json` rewrites configuration is present
- For Netlify, create a `_redirects` file in `public/`:
  ```
  /* /index.html 200
  ```

### Environment variables not working
- Ensure they're prefixed with `VITE_` (required by Vite)
- Check they're added in the deployment platform settings
- Redeploy after adding environment variables
