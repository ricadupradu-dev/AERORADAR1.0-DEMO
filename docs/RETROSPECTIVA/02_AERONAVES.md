# 02 — Aeronaves

## Painel da aeronave
Inspirado no painel do FlightRadar24:
- callsign em destaque;
- companhia aérea;
- operador;
- número do voo;
- tipo/modelo;
- ADS-B;
- foto grande e carrossel;
- origem e destino;
- altitude;
- velocidade;
- proa;
- registro;
- país de registro;
- ano de fabricação;
- idade;
- fabricante/modelo/serial/operador quando disponíveis.

## Metadados
O backend pode consultar ADSBDB e, opcionalmente, SkyLink via RapidAPI. O ano de fabricação deve ser tratado como ano de fabricação somente quando a fonte fornecer explicitamente `year_built`/equivalente.

## Fotos
Combinação de Planespotters e JetPhotos. O projeto não deve repetir uma foto apenas para preencher espaço.
