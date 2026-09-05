# Pesquisa de fontes — 05/09/2026

1. [ScoutElite](https://www.scoutelite.com.br/): auditoria pública de módulos anunciados e textos de interface. Funcionalidade autenticada não foi testada. Marketing de tempo real é distinto do consolidado descrito às 04h. Prancheta OBS anunciada como futura; live sem detecção automática.
2. [EA Clubs](https://www.ea.com/games/ea-sports-fc/clubs): clube, temporada, jogadores e jogos recentes. Sem contrato público de campos/endpoints estável localizado. A pesquisa recebeu HTTP 403 ao buscar clubes.
3. [Relato de endpoints no fórum hospedado pela EA](https://forums.ea.com/discussions/fc-24-general-discussion-en/api-fc24-/7634428/replies/7634434): fonte comunitária, **não documentação oficial**. Endpoints extras devem ser tratados como candidatos.
4. [Relato de amistosos no FC26](https://forums.ea.com/discussions/fc-26-general-discussion-en/fc-26-clubs-api--documentation/12557778): também comunitário, não contrato de API.
5. [Community API oficial](https://www.ea.com/games/ea-sports-fc/fc-26/news/pitch-notes-fc26-community-api-update): anúncio de 27/07/2026 para Ultimate Team e parceiros específicos. Não é integração pública Clubs disponível para este projeto.
6. [GlobalPro DTR](https://www.globalproesports.com/team-info/40) e [GlobalPro Vortex](https://www.globalproesports.com/team-info/86): perfis públicos encontrados com o mesmo manager informado na pesquisa; coleta complementar implementada sem login. IDs 40/86 pertencem à GlobalPro. Seletores HTML `table[data-team-squad]`, `#team-panel-matches [data-profile-match-row]`, `time[datetime]`, links `/matches/`.
7. [Gemini API](https://ai.google.dev/api): integração opcional de geração textual com `generateContent` e cabeçalho `x-goog-api-key`. Modelo configurável; depende de chave válida da diretoria e disponibilidade do provedor.

## Oportunidades não tratadas como dados já existentes

- OCR de telas de pós-jogo com revisão humana; necessita implementar extração e confirmar cada campo antes de salvar.
- Vídeos enviados pela equipe para análise manual/assistida; não equivalem a telemetria do jogo.
- APIs/exportações de organizadores para tabelas, rodadas, calendário e súmulas. GlobalPro foi a fonte pública efetivamente identificada; não foram encontradas APIs abertas verificadas de outras competições dos times.
- APIs oficiais Twitch/YouTube para estados de live, dependentes de configuração de contas/provedores.
- Armazenar campos desconhecidos no JSON bruto permite reprocessamento posterior sem repetir coleta ou presumir zeros.
