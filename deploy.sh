#!/bin/bash
git pull origin master
docker-compose up -d --build
docker system prune -f # Очистит старые образы, чтобы не забивать диск сервера