# AERO RADAR 3.0 — versão corrigida

Versão atual do projeto com:
- Rastreamento real via OpenSky, sem aeronaves fictícias misturadas ao radar.
- Mapa satélite e atualização por área visível.
- Marcadores amarelos para aeronaves e azuis para aeroportos.
- Aeroporto SDRS (Resende / Agulhas Negras) incluído.
- Painel lateral de aeronave com visual AERO RADAR inspirado no modelo solicitado.
- Link de fotos por matrícula para o Planespotters.net.
- O painel aceita uma `thumbnailUrl` autorizada retornada pelo endpoint de fotos; sem ela, mostra o acesso à página original, preservando créditos.
- Câmeras, rádio, login/cadastro e aeronaves aposentadas mantidos.

## Como iniciar

1. Entre na pasta `server`.
2. Execute `npm start`.
3. Abra `http://localhost:3000`.

## Importante

O arquivo `.env` local não é incluído neste ZIP. Preserve o seu `.env` atual na pasta `server`.


## Configurações
O menu ⚙ Configurações agora aplica e salva: estilo do mapa, brilho, linha dia/noite, aeroportos, nomes dos voos, contador, filtros rápidos, atualização automática e animações reduzidas.

## Retrospectiva
A documentação separada das funcionalidades está em `docs/RETROSPECTIVA/`.

## 🚀 Lançamento online

Consulte `README_LANCAMENTO.md` e o `render.yaml`. O pacote já inclui health check, inicialização automática do PostgreSQL, proteção básica e configuração para Render.


### Painel de aeroporto V3
- Link azul “Abrir aeroporto ↗” abre o painel detalhado.
- Geral: foto, METAR, temperatura, vento, visibilidade, dados do aeroporto e pistas.
- Pistas: comprimento e largura em pés e metros, além da superfície.
- Vindo para pousar: aeronaves ADS-B cujo destino foi identificado para o aeroporto.
- Partidas: aeronaves ADS-B cuja origem foi identificada como o aeroporto.
- No pátio / solo: aeronaves ADS-B identificadas no solo nas proximidades.
- O tráfego do painel usa adsb.fi; rotas são enriquecidas por provedores públicos de rotas.
- O METAR usa a Aviation Weather Center Data API.
