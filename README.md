# CineSearch

A self-hosted movie search web app built with Node.js and Express. Movie data is fetched from [The Movie Database (TMDB) API](https://www.themoviedb.org/).

---

## Features

- Search movies by **title**
- Displays a full movie ticket card with:
  - Poster image
  - Title and tagline
  - Synopsis
  - Release year, runtime, and genres
  - Vote average score ring
- Navigates to a dedicated ticket page per movie
- Automatic HTTPS via Caddy + Let's Encrypt (for self-hosted deployments)
- Auto-deploy on `git push` via GitHub webhook


---

## Prerequisites

- [Node.js](https://nodejs.org/)
- [TMDB API key](https://developer.themoviedb.org/docs/getting-started)
- npm

---

## Local Setup

**1. Clone the repo:**
```bash
git clone <repository-url>
cd <repo-name>
npm install
```

**2. Create a `.env` file in the project root(keep permissions in mind):**
```
TMDB_API_KEY=your-tmdb-bearer-token
DEPLOY_SECRET=your-github-webhook-secret
PROJECT_PATH=/absolute/path/to/repo-name
```
**3. Start the server:**
```bash
node bin/www
```

**You can now find the website at:**
```
http://localhost:3000
```

---

## Self-Hosting on a Local Server

This next section gives some details about the self-hosting (for example, on an old laptop) capabilities.

## Additional prerequisites

- [DuckDNS](https://www.duckdns.org/)
- PM2
- Caddy
  
| Tool | Purpose |
|---|---|
| **Node + Express** | Application server |
| **PM2** | Process manager : keeps the app running, restarts on crash/reboot |
| **Caddy** | Reverse proxy : handles HTTPS automatically via Let's Encrypt |
| **DuckDNS** | Free dynamic DNS : gives a stable hostname for a home IP |

### Quick server setup

```bash
# Install production dependencies
npm install --omit=dev

# Install PM2
sudo npm install -g pm2
pm2 start bin/www --name cinesearch
pm2 startup   # follow the printed instructions
pm2 save

# If it's working
NODE_ENV=production pm2 restart cinesearch --update-env
pm2 save

# Install caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/lists.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Go to the caddy config file(/etc/caddy/Caddyfile) and add this 
yourhostname.duckdns.org {
    reverse_proxy localhost:3000
}

# Then reload to apply
sudo systemctl reload caddy

# Setup the firewall
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable
```

## Auto-Deploy via GitHub Webhook

**How it works:**
1. Push to `main`
2. GitHub sends a signed POST request to `/deploy` on your server
3. Server verifies the signature using `DEPLOY_SECRET`
4. Server responds with `200 OK`
5. `execSync` runs `git pull` and `npm install`
6. `spawn` restarts the app after the new code is on the server

**Required `.env` variable:**
```
DEPLOY_SECRET=your-github-webhook-secret
PROJECT_PATH=/absolute/path/to/repo-name
```

**GitHub webhook settings:**
- Payload URL: `https://yourhostname.duckdns.org/deploy`
- Content type: `application/json`
- Secret: same value as `DEPLOY_SECRET`
- Events: **Just the push event**

---

## Security Setup

- The TMDB API key is never sent to the client.
- The `/deploy` endpoint verifies GitHub's HMAC signature using `crypto.timingSafeEqual` before running any commands.
- `NODE_ENV=production` prevents stack traces from being returned in error responses.
- The server's firewall (ufw) only exposes ports 22, 80, and 443, port 3000 is internal only.
- SSH password login is disabled; key-based auth only.
- `fail2ban` is installed to block brute-force attempts.
  
**Note for Home Hosting:** You will have to configure port forwarding on your home internet router to direct incoming traffic on ports 80 (HTTP) and 443 (HTTPS) to the server's local IP address. This is required for DuckDNS and Caddy.

---

## Updating the App

**Manually:**
```bash
git pull origin main
npm install
pm2 restart cinesearch
```

**Automatically:**  
Push to `main`.

---

## License

MIT
