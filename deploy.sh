#!/bin/bash
git pull origin main
docker-compose up -d --build
docker system prune -f # Очистит старые образы, чтобы не забивать диск сервера