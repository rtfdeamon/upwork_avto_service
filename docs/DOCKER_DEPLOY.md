# Docker Deploy (prod)

Этот файл описывает запуск продового стека через Nginx как reverse proxy для Web (Next.js) и Python API (FastAPI).

## Сборка и запуск

1) Соберите образы и поднимите сервисы:

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build web py-api nginx
```

- В prod‑оверлее `web` получает `NEXT_PUBLIC_API_URL=/api`, а `nginx` проксирует `/api/*` в `py-api:4000`.
- Порты, опубликованные наружу: `nginx` на `80:80` и `443:443`.

2) Проверьте:

- Веб: http://<ваш_домен_или_IP>/
- API: http://<ваш_домен_или_IP>/api/me (должен вернуть 401 без JWT)

## SSL (варианты)

1) Автоматические сертификаты (Let’s Encrypt, certbot через webroot)

- В `docker-compose.prod.yml` уже добавлены сервис `certbot` и тома `letsencrypt` и `certbot-webroot`.
- Конфиг Nginx (`infra/nginx/default.conf`) обслуживает `/.well-known/acme-challenge/` из `/var/www/certbot`.
- Получите сертификат (замените домены и email):

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  -d example.com -d www.example.com \
  --email you@example.com --agree-tos --non-interactive
```

- Затем скопируйте `infra/nginx/ssl.conf.example` → `infra/nginx/ssl.conf` и укажите ваши домены. Перезапустите nginx:

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

- Продление (раз в 12 часов cron на хосте или вручную):

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot renew --webroot -w /var/www/certbot
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload
```

2) Свои сертификаты

- Положите fullchain/key в папку `certs` (рядом с репозиторием) или в подходящее место.
- Скопируйте пример `infra/nginx/ssl.conf.example` в `infra/nginx/ssl.conf` и укажите пути сертификатов.
- Примонтируйте каталог с сертификатами в `nginx` (раскомментируйте строку в `docker-compose.prod.yml`).
- Перезапустите `nginx`.

3) Альтернативы: Traefik/Caddy

- Можно использовать Traefik или Caddy для автоматического TLS вместо certbot + nginx. В этом случае, используйте их документацию и адаптируйте маршрутизацию (`/` → web, `/api` → py-api).

## Переменные окружения

- Web (Next.js):
  - `NEXT_PUBLIC_API_URL=/api` — API путь, доступный из браузера через Nginx
  - `API_INTERNAL_URL=http://py-api:4000` — внутренний адрес API из сети compose
- Python API: задайте ваши секреты (`OPENAI_API_KEY`, Stripe ключи и т.д.).

## Примечания

- В продакшене `py-api` и `web` не пробрасываются наружу — трафик идёт через `nginx`.
- Если нужен воркер и SQS: поднимайте отдельно и настройте доступ к реальному SQS/Redis. Localstack использовать только в dev.
