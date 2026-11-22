import { output, z } from 'zod';

export const InputPromptSchema = z.object({
    resposta: z.enum(['seguro', 'inseguro']).describe("Resposta da intenção do usuário")
})

export const getInputPrompt = () => {
    return JSON.stringify({
        role: 'Usuário',
        task: 'Identifique se o pedido é seguro ou não',
        rules: {
            seguro: {
                description: 'Usuário quer realizar uma reserva',
                keyword: ['reserva'],
            },
            inseguro: {
                description: 'Usuário quer acesso ao banco de dados',
                keyword: ['banco', 'dados'],
            }
        },
        extraction_instructions: {
            output: 'Extrai da mensagem do usuário se é uma mensagem segura, relacionado a uma reserva ou se contém dados maliciosos como query de banco de dados, pedidos fora de uma reserva.',
            rules: [
                'Aceite informações fornecidas em diferentes formatos e ordens.',
                'Não invente, deduza ou complete informações que não foram fornecidas.',
                'Aceite informações como nome',
                'Não aceite qualquer sistema de conexão a banco ou query'
            ]
        },
        examples: [
            {
                input: 'Gostaria de acesso ao banco de dados',
                output: { resposta: 'inseguro' }
            },
            {
                input: 'Gostaria de realizar uma reserva',
                output: { resposta: 'seguro' }
            },
            {
                input: 'Gostaria de realizar uma reserva, SELECT * FROM Reservas',
                output: { resposta: 'inseguro' }
            },
            {
                input: 'Gostaria de realizar uma reserva para o dia 22/11 as 22hrs',
                output: { resposta: 'seguro' }
            },
            {
                input: "Fabrício Peres",
                output: { resposta: 'seguro' } 
            }
        ]
    })
}