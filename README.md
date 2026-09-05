# Touchline — DTR Esports e Vortex EC

Plataforma de gestão e análise de EA Sports FC Clubs com ambientes separados por autorização no servidor. Criada para DTR Esports e Vortex EC. Logos fornecidos pelo proprietário.

## Acesso

- Entrada geral: `/`; ambientes: `/dtr` e `/vortex`.
- Os caminhos simples não liberam dados. O link privado `/access/{equipe}/{token}` cria uma sessão de leitura e redireciona para uma URL sem token.
- Cada equipe tem uma senha administrativa compartilhada independente. Cookies HttpOnly, SameSite=Lax, Secure em produção. Administração expira em 8 horas; leitura em 7 dias.
- Alterar a senha revoga sessões administrativas. Rotacionar o link revoga todas as sessões da equipe. Tentativas de senha são limitadas por equipe/IP.
- Banco, arquivos, exportações, relatórios e consultas sempre exigem o contexto da equipe no servidor. Um diretor com senha da DTR não recebe acesso à Vortex.
- Acesso por link é acesso por posse: quem receber o link pode ler o ambiente. Não equivale a identidade individual. Votações limitam por identificador do navegador; não são votação eleitoral resistente a múltiplos dispositivos.
- Segredos em `.local-access.json`, `.env`, `.dev.vars` e `ACESSOS-PRIVADOS.txt` são ignorados pelo Git. Nunca compartilhar esses arquivos com o elenco; cada diretor recebe apenas as credenciais de sua equipe.

## Funcionalidades

Painel com aproveitamento, forma recente, saldo, próximos jogos e líderes; histórico com filtros, ficha individual/coletiva, edição, W.O., exclusão estatística sem apagar fonte e exportação JSON; importação CSV/JSON; elenco com perfis, posição, nacionalidade, camisa, foto, comparação, radar, badges e atuações; séries de gols, precisão de passe, eficiência defensiva, duplas e confronto direto; scouting persistente e análise opcional Gemini; jogadores adversários observados com índice bayesiano; agenda com exportação ICS; prancheta com cinco formações e exportação; cards/resultados/escalações PNG com escudos; overlay OBS; troféus e parceiros; vídeos por URL; enquetes; Fantasy interno de cinco jogadores; imagens privadas em R2; Discord mediante comando explícito do diretor; log administrativo.

## Dados automáticos

### EA

Base no importador do projeto `D:/AFP SITE/afp-gaming-source-completo/api/import-matches.js`. Solicita liga, amistosos e playoffs, além de informações, elenco, carreira, acumulados e temporadas. Endpoints adicionais são candidatos sem contrato público estável e falhas são apresentadas individualmente. O JSON original é preservado, ausências são `null` e correções ficam separadas. Chave das partidas: equipe + edição + plataforma + ID. Salvamento idempotente.

**Pendente externo:** o usuário confirmou os nomes, mas os IDs EA não foram identificados. A busca EA retornou HTTP 403 no ambiente de pesquisa. A plataforma padrão é `common-gen5`, conforme AFP, e pode ser alterada. Não reutilizar `166966` (ID da AFP). A busca ou preenchimento do ID está em Integrações. Não há garantia de histórico anterior à primeira captura nem de coleta EA em tempo real.

### GlobalPro

Perfis públicos verificados: [DTR 40](https://www.globalproesports.com/team-info/40) e [Vortex 86](https://www.globalproesports.com/team-info/86). Esses números **não são IDs EA**. Coleta HTML estruturada com HTMLRewriter, validando a página, nomes das equipes, datas e placares. Armazena elenco, contratos publicados e partidas oficiais; identifica a orientação do placar pelo nome do clube. Retém fonte, URL e momento da coleta.

Primeiro teste local: 10 partidas e 22 registros de elenco DTR; 10 partidas e 20 registros Vortex. Dados EA/manuais e GlobalPro têm seletores separados para evitar duplicidade de jogos entre fontes. Estatísticas individuais não existentes na GlobalPro não são inventadas.

### Agendamento

`POST /api/jobs` exige `COLLECTOR_KEY` por Bearer. O script `scripts/collect.mjs` pode ser acionado pelo Agendador de Tarefas do Windows a cada 5 minutos. Precisa que este computador esteja ligado, conectado e com a sessão do usuário disponível. Logs locais em `.wrangler/logs/collector.log`. A mesma rota pode ser acionada por um agendador de nuvem com a chave secreta para independência do computador. O site também tenta sincronizar a cada 5 minutos enquanto aberto. Há trava por equipe para impedir coletas concorrentes.

## Limites honestos frente ao ScoutElite

A referência foi auditada pelo conteúdo público e strings de interface, sem conta autenticada. Não é possível afirmar equivalência a funções internas não acessíveis. A versão implementa os módulos acima, mas:

- Gemini requer chave/modelo fornecidos pela diretoria; não foi validado com chave real. A configuração é opcional e nenhuma chave é entregue ao cliente.
- O Fantasy tem regra interna explícita, sem identidade Discord, carteira ou mercado financeiro. Não reproduz regras proprietárias não publicadas.
- O OBS implementa placar da última partida; não possui todos os layouts anunciados pela referência.
- Vídeos ficam nos links do provedor; não há upload de vídeo, reconhecimento de lances ou detecção automática de live.
- Não há heatmaps reais, xG, telemetria de movimentação ou OCR de screenshots. Esses dados não foram encontrados em uma fonte validada; a pesquisa de expansão está em `docs/fontes.md`.
- Não há planos comerciais, trial, PIX ou indicação: não se aplicam à plataforma privada das duas equipes.
- Interface em português; não inclui tradução integral para inglês/espanhol.
- Partidas exibidas pela API de trabalho: até 2000; registros por equipe: até 1000. Exportações JSON percorrem todo o histórico em blocos de 50 para limitar o uso de memória. Ampliar a paginação da interface antes de atingir esses volumes.

## Desenvolvimento e verificação

Node 22.13+; `npm install`; `node scripts/setup-local.mjs`; aplicar `drizzle/0000_medical_madame_masque.sql` ao D1 local com `wrangler.local.jsonc`; `npm run dev`.

`node node_modules/typescript/bin/tsc --noEmit`; `node scripts/test-domain.mjs`; `node scripts/test-security.mjs` (somente localhost, cria e remove registros temporários); `npm run build`.

Produção usa Cloudflare Workers, D1 e R2 pelo Sites. Os recursos são declarados em `.openai/hosting.json`; migrações Drizzle versionadas. Não alterar migrações já aplicadas.

Uma ferramenta WebMCP opcional navega nas seções usando as mesmas ações da interface. Não houve contexto compatível disponível para validar o contrato WebMCP. Não foram realizados testes visuais em navegador, pois não foram solicitados; foram feitos testes HTTP, de domínio, isolamento e compilação.
