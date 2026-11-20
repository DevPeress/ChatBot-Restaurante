# ChatBot-Restaurante

Um projeto de chatbot para restaurante desenvolvido com Node.js e LangChain.

## Tecnologias

- LangChain
- LangChain Core
- OpenRouter
- Fastify
- TypeScript
- tsx

## Dependencias

Instale as bibliotecas do LangChain:

```bash
npm install langchain @langchain/core @langchain/openrouter
```

Instale as ferramentas de desenvolvimento:

```bash
npm install -D typescript tsx @types/node
```

## Requisitos

- Node.js
- npm
- Uma chave de API do OpenRouter

## Proximos passos

1. Configurar as variaveis de ambiente.
2. Criar a integracao do chatbot com o OpenRouter.
3. Implementar o fluxo de atendimento do restaurante.
4. Executar e testar as conversas.

## API

Execute o servidor com `npm run dev`. A rota `POST /chat` aceita os dados da
reserva e a mensagem atual. Para continuar uma conversa, envie de volta o
histórico `messages` e os campos de estado retornados pela rota.

O fluxo usa o modelo para identificar o nome da pessoa, a quantidade de
pessoas e o horário desejado nas mensagens do usuário. Os três dados são
obrigatórios; se algum estiver faltando, o bot informa o que precisa antes de
continuar com a reserva.

```json
{
  "message": "Quero reservar uma mesa",
  "nomeReservado": "Ana",
  "qtdePessoas": 2,
  "dataHora": "2026-11-20T19:00:00"
}
```

As mensagens do histórico usam `{ "role": "human" | "ai", "content": "..." }`.
O servidor escuta em `127.0.0.1:3000` por padrão; `HOST` e `PORT` podem ser
definidos por variáveis de ambiente.
