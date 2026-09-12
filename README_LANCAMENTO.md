# AERO RADAR — pacote de lançamento online

Este pacote foi preparado para publicar o AERO RADAR como uma aplicação Node/Express com PostgreSQL.

## O que foi reforçado

- `/health` para monitoramento do servidor e do banco.
- `/api/health` para diagnóstico da API.
- Banco inicializado automaticamente (users + my_flights).
- Bind em `0.0.0.0` e uso da variável `PORT`, compatível com Render.
- Compressão gzip para respostas de texto/JSON/CSS/JS grandes.
- Cabeçalhos básicos de segurança.
- Limite de tentativas de login/cadastro por IP.
- Encerramento gracioso para deploys/restarts.
- Cache/ETag para arquivos estáticos.
- Endpoint de diagnóstico JetAPI protegido por login.
- `render.yaml` pronto para criar Web Service + PostgreSQL.
- `.node-version` fixando Node 24.14.1.

## Publicação recomendada

1. Crie um repositório privado ou público no GitHub.
2. Envie o conteúdo desta pasta para o repositório.
3. No Render, use **New → Blueprint** e selecione o repositório.
4. O `render.yaml` cria o serviço web e o PostgreSQL.
5. Cadastre os segredos solicitados no painel do Render.
6. Aguarde o deploy e abra a URL `onrender.com`.

## Variáveis obrigatórias para o radar ao vivo

- `DATABASE_URL` — criada automaticamente pelo Blueprint.
- `JWT_SECRET` — criada automaticamente pelo Blueprint.
- `OPENSKY_CLIENT_ID`
- `OPENSKY_CLIENT_SECRET`

## Variáveis opcionais

- `SKYLINK_API_KEY` — melhora dados de ano de fabricação/idade.
- `AIRCRAFT_DB_API_KEY`
- `JETAPI_URL`

## Banco

O servidor cria automaticamente as tabelas `users` e `my_flights` na primeira inicialização. O arquivo `server/schema.sql` também fica disponível para conferência.

## Teste depois do deploy

Abra:

- `/health`
- `/api/health`

O primeiro deve retornar JSON com `ok: true` e `database: "ok"`.

## Importante

Não publique `server/.env`, senhas, tokens, chaves OpenSky/SkyLink/RapidAPI ou credenciais do banco no GitHub. Use as Environment Variables do Render.

O plano gratuito é adequado para teste/homologação, mas o próprio Render informa que seus recursos gratuitos não são destinados a produção. Para o lançamento público definitivo, considere um plano pago conforme o tráfego crescer.
