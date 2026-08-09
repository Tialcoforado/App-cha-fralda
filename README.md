
# Gerenciador de Chá de Fraldas

Aplicação leve em HTML/CSS/JS para gerenciar convidados e presentes do chá de fraldas.

Visão geral
- Landing com mensagem de boas-vindas e botões para confirmar presença ou escolher presente.
- Painel de `Convidados`: adicionar, editar status (pendente/confirmado/cancelado) e remover.
- Painel de `Presentes`: lista sugerida (inclui fraldas) com descrição, link, reserva por convidado, marcação de comprado e contadores por tamanho (RN, P, M, G).

Como usar (rápido)
1. Abra `index.html` no navegador.
2. Clique em "Confirmar presença" e preencha seu nome (opcionalmente marque RSVP).
3. Clique em "Escolher presente" para ver a lista de presentes.
4. Para fraldas: selecione seu nome no campo de reserva, preencha as quantidades por tamanho (RN/P/M/G) e clique em "Registrar unidades".
5. Para ver quem pretende doar por tamanho, clique no botão `?` ao lado do contador.

Persistência
- Os dados são salvos localmente no `localStorage` do navegador. Se quiser resetar os dados, abra as Ferramentas do Desenvolvedor → Application/Armazenamento → Local Storage e remova as chaves `cha_guests_v1` e `cha_gifts_v1`.

Identidade visual
- Paleta proposta: tons de verde e azul (tema menino / floresta). Ícones e ilustrações de bichos da floresta podem ser adicionados posteriormente.

Desenvolvimento local
- Não precisa instalar dependências: abra `index.html` em qualquer navegador moderno.

Próximos passos sugeridos
- Exportar/importar reservas para CSV/JSON
- Melhorar modal de reserva (substituir selects/prompts por modais)
- Adicionar autenticação ou backend para multi-usuário

Licença
- Uso livre para testes e personalização.

# App-cha-fralda
App para gerenciar o cha de fralda
