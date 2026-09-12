# 04 — METAR e clima

Fonte planejada/implementada: Aviation Weather Center Data API.

A API do Aviation Weather Center oferece METAR mundial em texto bruto, JSON, GeoJSON, CSV, XML e IWXXM. Também oferece TAF e outras informações meteorológicas. citeturn0search0

Exemplo de consulta documentado pelo AWC: METAR mais recente por ICAO usando `/api/data/metar?ids=...&format=json`. citeturn0search0

## No painel
- Condição atual.
- Temperatura.
- Vento.
- Visibilidade quando disponível.
- Categoria/condição de voo quando calculável.
- Horário da observação.
- METAR bruto.
- Opção futura para TAF.

## Cuidados
A API é limitada a 100 requisições/minuto e não permite CORS direto; por isso o ideal é consultar pelo backend e aplicar cache. citeturn0search0
