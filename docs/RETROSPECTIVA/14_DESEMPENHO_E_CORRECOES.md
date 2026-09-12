# 14 — Desempenho e correções feitas

Problemas observados durante o projeto:
- site pesado;
- zoom/comportamento do mapa;
- Planespotters retornando HTTP 403;
- iframes de Aeroescuta recusados;
- Google/YouTube recusando determinados conteúdos incorporados;
- necessidade de ZIP para facilitar substituição de arquivos;
- necessidade de impedir dados fictícios.

Soluções adotadas:
- cache no backend para fontes externas quando aplicável;
- consulta de aeroportos por bbox/zoom;
- carrossel de fotos sem repetir imagens;
- fallback para abertura direta de fontes bloqueadoras;
- separação de aeronaves no ar/no solo;
- uso de backend para METAR, respeitando CORS/rate limit;
- remoção do `server/.env` deste ZIP de retrospectiva para não expor credenciais.
