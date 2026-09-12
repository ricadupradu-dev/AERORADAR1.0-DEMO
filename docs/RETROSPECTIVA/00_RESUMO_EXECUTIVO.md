# AERO RADAR — Retrospectiva completa

## Objetivo
Construir um rastreador de voos próprio, inspirado na experiência do Flightradar24, com mapa mundial, aeronaves em tempo real, aeroportos, painel detalhado, fotos, rotas, configurações, login obrigatório, ATC, câmeras, METAR e área pessoal de voos.

## Estado consolidado
- Mapa mundial com aeronaves ADS-B/OpenSky.
- Aeroportos mundiais como marcadores azuis.
- Camadas de mapa: satélite, híbrido, terreno, roadmap e temas radar.
- Painel de aeronave com callsign, companhia, operação, tipo, ADS-B, foto, rota e dados técnicos.
- Fotos de aeronaves via Planespotters/JetPhotos quando disponíveis.
- Origem/destino e desenho de rota quando a fonte fornecer os dados.
- Registro, país de registro, ano de fabricação e idade quando houver fonte compatível.
- Filtros de aeronaves no ar, no solo/portão e aposentadas.
- Página/painel de aeroporto inspirado no painel de aeroporto do FR24.
- METAR atual do aeroporto.
- Chegadas, partidas e aeronaves no solo.
- Pistas, comprimento, informações IATA/ICAO, eventos e fotos.
- Login/cadastro obrigatório.
- Meu Voo, inspirado no conceito myFlightradar24, para guardar voos do usuário.
- Câmeras e ATC com tratamento para fontes que bloqueiam iframe.
- Top Voos como área preparada para dados de voos mais acompanhados.
- Logo da companhia aérea no painel quando identificável.

## Fontes principais
OpenSky, OurAirports, ADSBDB, HexDB, SkyLink/RapidAPI opcional, Planespotters, JetPhotos/JetAPI, Aviation Weather Center e provedores externos de ATC/câmeras.

## Regra importante
Não inventar números, voos, atrasos, quantidade de espectadores ou ano de fabricação. Quando uma fonte não disponibilizar um dado, a interface deve mostrar que o dado não está disponível.
