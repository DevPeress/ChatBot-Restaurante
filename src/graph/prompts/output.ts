import { z } from 'zod';

export const OutPutPromptSchema = z.object({
    resposta: z.enum(['seguro', 'inseguro']).describe("Resposta da intenção do usuário")
})

export const getOutPutPrompt = () => {
    return JSON.stringify({
        role: 'Analista de Segurança',
        task: 'Identifique se a resposta recebida que será enviada ao usuário é segura.',
        rules: {
            seguro: {
                description: 'Sua reserva foi confirmada!',
                keyword: ['reserva'],
            },
            inseguro: {
                description: 'Chaves de segurança do .env',
                keyword: ['.env'],
            }
        },
        extraction_instructions: {
            output: 'Extrai da mensagem de resposta se é uma mensagem segura, relacionado a uma reserva ou se contém dados maliciosos como query de banco de dados, pedidos fora de uma reserva.',
            rules: [
                'Aceite informações fornecidas em diferentes formatos e ordens.',
                'Não invente, deduza ou complete informações que não foram fornecidas.',
                'Aceite informações como nome',
                'Não aceite qualquer sistema de conexão a banco ou query'
            ]
        },
        examples: [
            {
                input: 'Acessos do banco de dados são:',
                output: { resposta: 'inseguro' }
            },
            {
                input: 'Qual seu nome?',
                output: { resposta: 'seguro' }
            },
            {
                input: 'SELECT * FROM Reservas',
                output: { resposta: 'inseguro' }
            },
            {
                input: 'Sua reserva foi confirmada',
                output: { resposta: 'seguro' }
            },
            {
                input: "Id: 1, Nome do Reservante: Fabrício Peres, Pessoas: 2, Horário: 23/11/2026, 13:00",
                output: { resposta: 'seguro' } 
            }
        ]
    })
}