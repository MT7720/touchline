# EA Relay — Proxy Vercel Edge para EA Pro Clubs

Proxy que roda na Vercel Edge Runtime para contornar o bloqueio de IPs de datacenter
que a EA aplica nos endpoints do Pro Clubs (`proclubs.ea.com`).

## Deploy rápido

```bash
cd ea-relay
npx vercel deploy --prod
```

## Variáveis de ambiente (configurar na Vercel)

| Variável | Descrição |
|----------|-----------|
| `RELAY_KEY` | Chave secreta compartilhada com o Cloudflare Worker |
| `TOUCHLINE_ORIGIN` | URL do Touchline (ex: `https://dtr-vortex-performance.coutabuenoruane.chatgpt.site`) |
| `COLLECTOR_KEY` | Chave do endpoint `/api/jobs` do Touchline |
| `CRON_SECRET` | Gerado automaticamente pela Vercel para autenticar cron jobs |

## Após o deploy

1. Copie a URL do deploy (ex: `https://ea-relay-xxx.vercel.app/api/ea`)
2. Configure no Cloudflare Worker:
   ```bash
   npx wrangler secret put EA_RELAY_URL
   # Cole: https://ea-relay-xxx.vercel.app/api/ea
   npx wrangler secret put EA_RELAY_KEY
   # Cole a mesma chave que definiu em RELAY_KEY na Vercel
   ```
3. Pronto! O Touchline vai usar o relay automaticamente na próxima coleta.

## Cron automático

O `vercel.json` configura um cron a cada 10 minutos (`*/10 * * * *`).
- **Vercel Pro**: roda a cada 10 minutos ✓
- **Vercel Hobby (free)**: roda 1x por dia (use o `auto-collect.mjs` local como complemento)

## Testar o proxy manualmente

```bash
curl "https://SUA-URL.vercel.app/api/ea?path=clubs/info&platform=common-gen5&clubIds=166966" \
  -H "Authorization: Bearer SUA_RELAY_KEY"
```
