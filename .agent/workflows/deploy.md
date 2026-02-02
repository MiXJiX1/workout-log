---
description: How to deploy the Workout Log App to Vercel or Netlify
---

# Deploying Vue.js App

This guide explains how to deploy your Vue.js application. Since this app uses `localStorage` and client-side routing, it can be hosted on any static site provider.

## Option 1: Vercel (Recommended)

1.  **Install Vercel CLI** (Optional, or use the web interface):
    ```bash
    npm install -g vercel
    ```
2.  **Build the Project**:
    ```bash
    npm run build
    ```
    This creates a `dist` folder.
3.  **Deploy**:
    Run the following command and follow the prompts:
    ```bash
    npx vercel
    ```
    - Set up and deploy? **Y**
    - Which scope? **[Select your account]**
    - Link to existing project? **N**
    - Project name? **workout-log**
    - Directory? **./**
    - Auto-detect settings? **Y**

## Option 2: Netlify

1.  **Build the Project**:
    ```bash
    npm run build
    ```
2.  **Deploy via Web**:
    - Go to [Netlify Drop](https://app.netlify.com/drop).
    - Drag and drop the `dist` folder created in step 1.

## Configure for Client-Side Routing

Since this is a Single Page Application (SPA), you need to ensure all routes redirect to `index.html`.

**For Vercel:**
Create a `vercel.json` in the root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**For Netlify:**
Create a `_redirects` file in the `public` folder (or `dist` after build):
```
/* /index.html 200
```
