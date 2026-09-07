/**
 * Configura os clubIds e ativa a coleta automática.
 *
 * DTR Esports → clubId: 9212
 * Vortex EC   → clubId: 4504
 */
import { readFileSync } from 'node:fs';

const project = new URL('../', import.meta.url);
const keys = JSON.parse(readFileSync(new URL('.local-access.json', project), 'utf8'));
const { origin } = JSON.parse(readFileSync(new URL('collector.config.json', project), 'utf8'));

const wait = ms => new Promise(r => setTimeout(r, ms));

const TEAMS = {
  dtr:    { link: keys.DTR_LINK,    admin: keys.DTR_ADMIN,    clubId: '9212', name: 'DTR Esports' },
  vortex: { link: keys.VORTEX_LINK, admin: keys.VORTEX_ADMIN, clubId: '4504', name: 'Vortex EC' },
};

async function setupTeam(team, cfg) {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  Configurando ${cfg.name.padEnd(22)} ║`);
  console.log(`╚══════════════════════════════════════╝\n`);

  // 1. Abrir sessão viewer
  console.log('  1. Abrindo sessão viewer...');
  const accessResp = await fetch(`${origin}/access/${team}/${cfg.link}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(20000),
  });

  const viewerCookie = accessResp.headers.get('set-cookie');
  if (!viewerCookie) {
    console.log(`  ✗ Falha ao criar sessão viewer (HTTP ${accessResp.status})`);
    return false;
  }
  // Extrai só o cookie relevante
  const cookieValue = viewerCookie.split(';')[0];
  console.log(`  ✓ Sessão viewer criada: ${cookieValue.slice(0, 30)}...`);

  await wait(500);

  // 2. Login admin
  console.log('  2. Fazendo login admin...');
  const loginResp = await fetch(`${origin}/api/${team}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieValue,
      Origin: origin,
      Referer: `${origin}/${team}`,
    },
    body: JSON.stringify({ password: cfg.admin }),
    signal: AbortSignal.timeout(20000),
  });

  const loginBody = await loginResp.json();
  if (!loginResp.ok) {
    console.log(`  ✗ Login falhou: ${loginBody.error}`);
    return false;
  }

  // Pega o cookie de admin
  const adminCookie = loginResp.headers.get('set-cookie');
  const finalCookie = adminCookie ? adminCookie.split(';')[0] : cookieValue;
  console.log(`  ✓ Login admin OK`);

  await wait(500);

  // 3. Atualizar settings com o clubId correto
  console.log(`  3. Configurando clubId: ${cfg.clubId}...`);
  const settingsResp = await fetch(`${origin}/api/${team}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: finalCookie,
      Origin: origin,
      Referer: `${origin}/${team}`,
    },
    body: JSON.stringify({
      name: cfg.name,
      clubId: cfg.clubId,
      platform: 'common-gen5',
      formation: '4-3-3',
    }),
    signal: AbortSignal.timeout(20000),
  });

  const settingsBody = await settingsResp.json();
  if (!settingsResp.ok) {
    console.log(`  ✗ Settings falhou: ${settingsBody.error}`);
    return false;
  }
  console.log(`  ✓ ClubId ${cfg.clubId} configurado!`);

  await wait(1000);

  // 4. Disparar sync (com clearBackoff)
  console.log(`  4. Disparando coleta...`);
  const syncResp = await fetch(`${origin}/api/${team}/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: finalCookie,
      Origin: origin,
      Referer: `${origin}/${team}`,
    },
    body: '{}',
    signal: AbortSignal.timeout(120000),
  });

  const syncBody = await syncResp.json();
  if (syncResp.ok) {
    console.log(`  ✓ Coleta: status=${syncBody.status}, ${syncBody.count} partidas`);
    if (syncBody.errors?.length) {
      for (const e of syncBody.errors) {
        console.log(`    ⚠ ${e}`);
      }
    }
  } else {
    console.log(`  ⚠ Sync: ${syncBody.error ?? JSON.stringify(syncBody)}`);
  }

  return true;
}

// ============ EXECUTAR ============
console.log(`\nAlvo: ${origin}\n`);

for (const [team, cfg] of Object.entries(TEAMS)) {
  const ok = await setupTeam(team, cfg);
  if (!ok) console.log(`\n  ✗ Falha na configuração de ${cfg.name}. Verifique os logs.`);
  await wait(2000);
}

console.log('\n══════════════════════════════════════');
console.log('  Configuração concluída!');
console.log('  DTR Esports → clubId 9212');
console.log('  Vortex EC   → clubId 4504');
console.log('══════════════════════════════════════');
console.log('\n  Para coleta automática contínua, rode:');
console.log('  node scripts/auto-collect.mjs\n');
