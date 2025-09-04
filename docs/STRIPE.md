# Stripe (локально)

Для локальной разработки Checkout и вебхуков используйте Stripe CLI.

1) Установите Stripe CLI: https://stripe.com/docs/stripe-cli

2) Авторизуйтесь и запустите прослушку вебхуков, проксируя на Python API:

```
stripe login
stripe listen --forward-to http://localhost:4000/stripe/webhook
```

3) Задайте переменные окружения API:

- `STRIPE_SECRET_KEY` — секретный ключ.
- `STRIPE_WEBHOOK_SECRET` — значение, которое печатает `stripe listen` (строка после `> Ready! Your webhook signing secret is whsec_...`).
- `PRICE_ID` — price ID вашего плана (например, `price_...`).

4) Инициируйте Checkout из веба на странице Billing, либо вручную:

```
curl -X POST http://localhost:4000/stripe/checkout-session -H "Authorization: Bearer <JWT>"
```

5) Для генерации тестовых событий используйте:

```
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

Python API обновит поле подписки пользователя (`ACTIVE` / `PAST_DUE`).
