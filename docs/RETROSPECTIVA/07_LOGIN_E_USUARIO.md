# 07 — Login e usuário

## Login obrigatório
- O visitante não autenticado não acessa o radar.
- Pode escolher Entrar ou Criar conta.
- Após autenticar, o nome aparece no topo.
- Botão Sair encerra a sessão e volta a bloquear o radar.

## Conta
Backend preparado para PostgreSQL + bcrypt.

## Segurança
O arquivo real `server/.env` não deve ser distribuído em retrospectivas/ZIPs. O pacote contém apenas a configuração de exemplo.
