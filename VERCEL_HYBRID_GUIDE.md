# ⚡ Vercel + Koyeb Hybrid Deployment Guide

You are seeing the error `Error: No Next.js version detected` because Vercel is looking at the **Root** of your project, but your Next.js app is inside the `frontend` folder.

## 🛠️ How to Fix Vercel Deployment

1.  Go to your Vercel Project Settings.
2.  Click **General**.
3.  Find **"Root Directory"**.
4.  Click **Edit** and select `frontend`.
5.  Click **Save**.

## 🔌 Connecting Frontend to Backend

Since Vercel cannot host your AI Python Backend (it's too big), you must host the backend on **Koyeb** and connect them.

### Step 1: Deploy Backend to Koyeb
Use the link I gave you earlier:
**[Deploy Backend to Koyeb](https://app.koyeb.com/deploy?type=git&repository=github.com/Aradhy20/mental-health&branch=main&env[MONGO_DETAILS]=mongodb%2Bsrv%3A%2F%2Fmentalhealth_db_user%3A07032004Ja%2540%2523%40cluster0.8tevbr6.mongodb.net%2F%3FappName%3DCluster0&env[MONGO_DB_NAME]=mental_health_db&env[PORT]=8000)**

Copy the **Public URL** Koyeb gives you (e.g., `https://mental-health-xyz.koyeb.app`).

### Step 2: Configure Vercel
1.  Go to Vercel Project Settings -> **Environment Variables**.
2.  Add a new variable:
    *   **Key**: `BACKEND_URL`
    *   **Value**: `https://mental-health-xyz.koyeb.app` (Your Koyeb URL)
    *   *(Do not add a trailing slash `/`)*
3.  **Redeploy** Vercel (Go to Deployments -> Redeploy).

## 🎯 Result
*   Your users visit the Vercel URL.
*   Calls to `/api` are automatically sent to Koyeb (thanks to the `BACKEND_URL` setting).
*   Your AI works perfectly.
