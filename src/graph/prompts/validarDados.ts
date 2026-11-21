import { z } from 'zod';

export const ValidarDadosSchema = z.object({
    nomeReservado: z.string().describe("Nome da Pessoa"),
    dataHora: z.string().describe("Hora da reserva"),
    qtdePessoas: z.number().describe("Número de pessoas na reserva")
})

export const getValidarDados = () => {
    return JSON.stringify({
        role: 'Usuário',
        task: 'Validar se os dados necessários da reserva para uma restaurante estão descritos',
        extraction_instructions: {
            output: 'Extrai nome, data e quantidade de pessoas da mensagem do usuário, de tal forma, que ele possa enviar de diversas maneiras diferentes'
        },
        examples: [
            {
                input: 'Me chamo Fabrício Peres e quero uma reserva para 21hrs de hoje para duas pessoas',
                output: { nomeReservado: 'Fabrício Peres', dataHora: "21hrs de hoje", qtdePessoas: 2 }
            },
            {
                input: 'Gostaria de fazer uma reserva para as 20hrs de amanhã para 4 pessoas',
                output: { nomeReservado: "", dataHora: "20hrs de amanhã", qtdePessoas: 4 }
            },
            {
                input: 'Gostaria de realizar uma reserva',
                output: { nomeReservado: "", dataHora: "", qtdePessoas: 0 }
            }
        ]
    })
}