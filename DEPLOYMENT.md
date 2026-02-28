# Deployment Guide for Ubuntu Server

## Prerequisites
- Ubuntu Server 20.04 or later
- Root or sudo access
- Domain name (optional, for production)

---

## 1. Install Docker and Docker Compose

### Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Docker
```bash
# Add Docker's official GPG key
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Add user to Docker group (optional, avoids using sudo)
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2. Clone/Upload Project to Server

### Option A: Clone from Git repository
```bash
cd /home/$USER
git clone <your-repository-url> mobail_coffe
cd mobail_coffe
```

### Option B: Upload via SCP
```bash
# From your local machine
scp -r ./* user@your-server-ip:/home/user/mobail_coffe
```

---

## 3. Configure Environment Variables (Optional)

Create environment file for production settings:

```bash
cd /home/user/mobail_coffe
nano .env
```

Example `.env` content:
```env
DATABASE_URL=sqlite+aiosqlite:///data/coffee_shop.db
SECRET_KEY=your-secret-key-here
DEBUG=false
```

---

## 4. Build and Run with Docker Compose

### Build containers
```bash
sudo docker compose build
```

### Start services
```bash
# Run in detached mode (background)
sudo docker compose up -d
```

### View logs
```bash
# All services
sudo docker compose logs -f

# Specific service
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
```

### Check running containers
```bash
sudo docker compose ps
```

---

## 5. Verify Deployment

### Test backend API
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/
```

### Test frontend
```bash
curl http://localhost:3000
```

### Access from browser
- Frontend: `http://your-server-ip:3000`
- Backend API: `http://your-server-ip:8000`
- API Docs: `http://your-server-ip:8000/docs`

---

## 6. Common Docker Compose Commands

```bash
# Stop services
sudo docker compose down

# Stop and remove volumes (deletes data!)
sudo docker compose down -v

# Restart services
sudo docker compose restart

# Rebuild after code changes
sudo docker compose up -d --build

# View resource usage
sudo docker stats

# Access container shell
sudo docker exec -it coffee-api bash
sudo docker exec -it coffee-frontend sh
```

---

## 7. Setup Nginx Reverse Proxy (Optional, for production)

### Install Nginx
```bash
sudo apt install -y nginx
```

### Create Nginx config
```bash
sudo nano /etc/nginx/sites-available/coffee-shop
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable site
```bash
sudo ln -s /etc/nginx/sites-available/coffee-shop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 8. Setup SSL with Let's Encrypt (Optional)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL certificate
```bash
sudo certbot --nginx -d your-domain.com
```

### Auto-renewal (already configured by certbot)
```bash
sudo certbot renew --dry-run
```

---

## 9. Setup Systemd Service (Alternative to Docker Compose)

Create systemd service for auto-start on boot:

```bash
sudo nano /etc/systemd/system/coffee-shop.service
```

Add configuration:
```ini
[Unit]
Description=Coffee Shop Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/user/mobail_coffe
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

### Enable and start service
```bash
sudo systemctl daemon-reload
sudo systemctl enable coffee-shop
sudo systemctl start coffee-shop
sudo systemctl status coffee-shop
```

---

## 10. Troubleshooting

### Check Docker service status
```bash
sudo systemctl status docker
```

### View Docker logs
```bash
sudo journalctl -u docker
```

### Check port conflicts
```bash
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :3000
```

### Restart Docker
```bash
sudo systemctl restart docker
```

### Remove unused containers and images
```bash
sudo docker system prune -a
```

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://server-ip:3000 |
| Backend API | 8000 | http://server-ip:8000 |
| API Docs | 8000 | http://server-ip:8000/docs |

---

## Support

For issues, check:
- Container logs: `sudo docker compose logs -f`
- Docker status: `sudo systemctl status docker`
- Container status: `sudo docker compose ps`
