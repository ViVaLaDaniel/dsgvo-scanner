# 🏗️ Hybrid Architecture Deployment Guide

## Overview

This project uses a **Hybrid Architecture** to overcome execution limits on serverless platforms (Vercel) while keeping costs low.

- **Frontend & API (Next.js)**: Hosted on **Vercel**. Handles UI, Auth, Database interactions, and report generation.
  - **URL**: `https://dsgvo-scanner-plum.vercel.app/`
- **Scanning Engine (Microservice)**: Hosted on a **DigitalOcean Droplet ($6/mo)**. Handles heavy Playwright/Chromium browser automation tasks.
  - **IP**: `165.227.154.133`
  - **Domain**: `scanner.n8ndo.es` (Subdomain of existing n8n project)

---

## 🌍 1. Vercel (Frontend & Main Logic)

Hosted automatically via GitHub integration.

### Environment Variables (Vercel)
These must be set in Vercel Project Settings for the Production Environment:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | *from Supabase* | Connection to DB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *from Supabase* | Connection to DB |
| `SCANNER_MICROSERVICE_URL` | `https://scanner.n8ndo.es/scan` | Pointing to our Droplet |
| `SCANNER_SECRET` | *Your chosen secret* | Auth token for the microservice |

---

## 📦 2. DigitalOcean Droplet (The Heavy Lifter)

**Specs:** 1GB RAM / 1 Intel CPU ($6/mo).
**Co-located with:** n8n (on port 5678).

### 🛠️ Server Setup (Manually)

1.  **SWAP is Mandatory:** Since we only have 1GB RAM, we MUST add 4GB Swap to prevent crashes during browser launch.
    ```bash
    sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```

2.  **Directory Structure:**
    We do NOT clone the full Next.js repo. We only run a minimal Express+Playwright service.
    `mkdir -p /opt/scanner-service`

### 🚀 Deployment (Docker)

**Dockerfile** (Optimized for generic usage):
```dockerfile
FROM mcr.microsoft.com/playwright:v1.49.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.js .
EXPOSE 4000
CMD ["node", "index.js"]
```

**Run Command:**
```bash
docker run -d \
  --name micro-scanner \
  --restart unless-stopped \
  -p 4000:4000 \
  -e SCANNER_SECRET="YOUR_SECRET_KEY_HERE" \
  micro-scanner
```

### 🌐 Nginx Reverse Proxy (Side-by-side with n8n)

The droplet at `165.227.154.133` runs Nginx to route traffic based on domains:

- **n8n**: `n8n.n8ndo.es` -> `localhost:5678` (Existing Workflow Automation)
- **Scanner**: `scanner.n8ndo.es` -> `localhost:4000` (Our New Service)

**DNS Setup (Required):**
- Log in to your Domain Registrar (where n8ndo.es is bought).
- Add **A Record**: `scanner` -> `165.227.154.133`

**Nginx Config Block (`/etc/nginx/sites-available/dsgvo-scanner`):**
```nginx
server {
    server_name scanner.n8ndo.es;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL Certificate (Let's Encrypt)
Run this on the droplet after setting up DNS:
```bash
sudo certbot --nginx -d scanner.n8ndo.es
```

---

## 🔄 Workflow

1.  User clicks "Scan" in Next.js Dashboard.
2.  Next.js API route (`/api/scan`) checks the database.
3.  Next.js API sends a POST request to `SCANNER_MICROSERVICE_URL`.
    - Payload: `{ "url": "https://target-site.com", "secret": "..." }`
4.  Droplet spins up Headless Chrome, visits site, collects data.
5.  Droplet returns JSON results to Next.js.
6.  Next.js saves results to Supabase and shows them to the user.
