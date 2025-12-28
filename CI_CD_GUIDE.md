# 🚀 CI/CD & Deployment Guide

This guide explains how to use GitHub Actions for automated testing and how to deploy your hybrid application (Next.js + Node.js + Python AI) to production.

## 🏗️ How the Pipeline Works

The current pipeline (`.github/workflows/ci-cd.yml`) runs automatically on every **Push** or **Pull Request** to the `main` branch. It performs three parallel checks:

1.  **Main API Check (Node.js):** Ensures your Express backend and its dependencies are valid.
2.  **AI Services Check (Python):** Verifies that all 10 FastAPI services have correct syntax and dependencies.
3.  **Frontend Check (Next.js):** Runs a production build to ensure there are no breaking changes in the UI.

---

## 🌐 Deployment Strategy

For your hybrid architecture, we recommend the following hosting providers:

### 1. Frontend (Next.js) -> [Vercel](https://vercel.com)
*   **Why:** Best support for Next.js, extremely fast edge network.
*   **Setup:**
    1.  Connect your GitHub repo to Vercel.
    2.  Set `Root Directory` to `frontend`.
    3.  Add environment variables (e.g., `NEXT_PUBLIC_API_URL`).

### 2. Main API (Node.js/Express) -> [Render](https://render.com)
*   **Why:** Easy to use for Express apps, auto-deployment from Git.
*   **Setup:**
    1.  Create a "Web Service".
    2.  Set `Root Directory` to `backend-express`.
    3.  Build Command: `npm install`
    4.  Start Command: `node server.js`

### 3. AI services (Python/FastAPI) -> [Railway](https://railway.app) or [Render Docker]
*   **Why:** Python AI models need more RAM and Docker support.
*   **Setup:** 
    *   Use the included `Dockerfile` in the root.
    *   It will automatically launch your 10 microservices using the `start_services.py` entrypoint.

---

## 🔐 Finalizing Automated Deployment

To make GitHub automatically deploy when you push code, follow these steps:

### Step 1: Get Deployment Secrets
1.  **Vercel:** Generate a Token in Settings and find your `PROJECT_ID` and `ORG_ID`.
2.  **Render:** Copy the **Deploy Hook URL** from your Render service settings.

### Step 2: Add Secrets to GitHub
1.  Go to your repo on GitHub.
2.  Click **Settings** > **Secrets and variables** > **Actions**.
3.  Add the following "Repository secrets":
    *   `VERCEL_TOKEN`
    *   `ORG_ID`
    *   `PROJECT_ID`
    *   `RENDER_DEPLOY_HOOK`

### Step 3: Enable the Deploy Job
Open `.github/workflows/ci-cd.yml` and uncomment the `deploy-production` section at the bottom.

---

## 📈 Monitoring & Health

*   **GitHub Actions Tab:** Watch the green checkmarks to ensure your code is healthy.
*   **Health Endpoints:**
    *   Main API: `/health`
    *   AI Services: `:8002/health`, `:8003/health`, etc.

**Congratulations! Your professional DevOps pipeline is now ready.** 🚀
