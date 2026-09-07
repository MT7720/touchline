/**
 * Coleta automática — roda em loop, chama POST /api/jobs a cada 10 minutos.
 *
 * Uso:
 *   node scripts/auto-collect.mjs
 *
 * Deixe rodando em uma janela de terminal ou registre como serviço.
 * Ctrl+C para parar.
 */
import { readFileSync, existsSync, mkdirSync, appendFileSync, statSync, writeFileSync } from 'node:fs';

const project = new URL('../', import.meta.url);
const keys = JSON.parse(readFileSync(new URL('.local-access.json', project), 'utf8'));
const { origin } = JSON.parse(readFileSync(new URL('collector.config.json', project), 'utf8'));

const INTERVAL_MS = 10 * 60_000; // 10 minutos
const TIMEOUT_MS = 210_000;      // 3.5 min timeout por coleta

// Log em arquivo (mesmo local do collect.mjs)
const logsDir = new URL('.wrangler/logs/', project);
mkdirSync(logsDir, { recursive: true });
const logFile = new URL('collector.log', logsDir);

function log(entry) {
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n';
  // Rotaciona se passar de 2 MB
  if (existsSync(logFile) && statSync(logFile).size > 2_000_000) writeFileSync(logFile, '');
  appendFileSync(logFile, line);
}

async function collect() {
  const now = new Date().toISOString();
  try {
    const response = await fetch(`${origin}/api/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keys.COLLECTOR_KEY}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const body = await response.json();
    const summary = body.results?.map(r => ({
      team: r.team,
      status: r.status ?? 'error',
      count: r.count ?? 0,
      errors: r.errors?.length ?? 0,
    }));

    console.log(`[${now}] ✓ Coleta concluída:`, JSON.stringify(summary));
    log({ ok: true, results: body.results });

    // Mostra erros de EA se tiver
    for (const r of body.results ?? []) {
      if (r.errors?.length) {
        for (const e of r.errors) {
          console.log(`  ⚠ ${r.team}: ${e}`);
        }
      }
    }
  } catch (e) {
    console.error(`[${now}] ✗ Falha:`, e.message);
    log({ ok: false, error: e.message });
  }
}

// Banner
console.log('╔══════════════════════════════════════════════╗');
console.log('║   TOUCHLINE — Coleta Automática             ║');
console.log('╠══════════════════════════════════════════════╣');
console.log(`║ Alvo:      ${origin.slice(0, 35).padEnd(35)}║`);
console.log(`║ Intervalo: ${String(INTERVAL_MS / 60_000).padEnd(3)} minutos${' '.repeat(24)}║`);
console.log('║ Ctrl+C para encerrar                        ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');

// Primeira coleta imediata
await collect();

// Loop infinito
setInterval(collect, INTERVAL_MS);
