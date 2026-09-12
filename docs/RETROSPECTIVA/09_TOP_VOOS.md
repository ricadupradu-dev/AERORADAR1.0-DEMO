# 09 — Top Voos

Foi solicitada uma área “Top Voos” para mostrar os voos mais acompanhados no mundo e a quantidade de pessoas acompanhando cada aeronave, usando o Flightradar24 como referência.

## Regra de implementação
O AERO_RADAR não deve inventar a quantidade de espectadores.

O site do Flightradar24 possui dados e páginas públicas de aviação, mas uma fonte pública estável e autorizada para obter automaticamente a contagem exata de espectadores de cada voo não foi estabelecida neste projeto.

Portanto:
- usar API/feed autorizado se houver credencial e endpoint compatível;
- caso contrário, mostrar ranking somente quando a fonte fornecer o dado;
- disponibilizar link para conferir diretamente no Flightradar24;
- nunca fabricar números.

O banco público de dados do FR24 informa que a plataforma tem dados em tempo real e grande cobertura de aeronaves, aeroportos e companhias. citeturn0search17
