# 01 — Mapa e camadas

- Mapa mundial como tela principal.
- Aeronaves aparecem como marcadores.
- Aeroportos aparecem como fixos azuis.
- Satélite via Esri World Imagery.
- Híbrido com limites/lugares.
- Terreno e roadmap.
- Temas Radar azul, Radar escuro, Aubergine e preto/branco.
- Controle de brilho.
- Configuração de movimento reduzido.
- Rotas do voo selecionado.
- Ação Seguir para acompanhar a aeronave no mapa.
- Ação Modo 3D/zoom.

## Observação técnica
A API de voos usa dados de estado ADS-B/OpenSky. O backend preserva o `onGround` para permitir separar aeronaves em voo e no solo.
