
import { z } from 'zod';

export const ValidarDadosSchema = z.object({
    nomeReservado: z.string()
        .describe("Nome completo da pessoa responsável pela reserva. Retorne string vazia se não informado."),

    dataHora: z.string()
        .describe("Data e horário desejados para a reserva. Preserve a expressão utilizada pelo usuário. Retorne string vazia se não informado."),

    qtdePessoas: z.number()
        .int()
        .min(0)
        .describe("Quantidade de pessoas na reserva. Retorne 0 se não informado.")
});

export const getValidarDados = () => {
    return JSON.stringify({
        role: 'Usuário',

        task: 'Extrair e validar os dados necessários para realizar uma reserva em um restaurante.',

        extraction_instructions: {
            output: 'Extraia o nome da pessoa responsável, a data e horário desejados e a quantidade de pessoas.',

            rules: [
                'Aceite informações fornecidas em diferentes formatos e ordens.',
                'Não invente, deduza ou complete informações que não foram fornecidas.',
                'Se uma informação não estiver presente, utilize string vazia ou 0, conforme o tipo do campo.',
                'Preserve a expressão original de data e horário utilizada pelo usuário.',
                'Considere informações fornecidas anteriormente na conversa, quando disponíveis.',
                'Não confunda a quantidade de pessoas com horários ou outros números mencionados.',
                'Considere todo o histórico de mensagens enviado.',
                'Combine informações complementares fornecidas em mensagens diferentes.',
                'Não descarte informações válidas já fornecidas pelo usuário.',
                'Caso uma informação seja corrigida posteriormente, considere a informação mais recente.'
            ]
        },

        examples: [
            {
                input: 'Me chamo Fabrício Peres e quero uma reserva para 21hrs de hoje para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: '21hrs de hoje',
                    qtdePessoas: 2
                }
            },
            {
                input: 'Gostaria de fazer uma reserva para as 20hrs de amanhã para 4 pessoas',
                output: {
                    nomeReservado: '',
                    dataHora: '20hrs de amanhã',
                    qtdePessoas: 4
                }
            },
            {
                input: 'Meu nome é João, somos 5 pessoas e queremos reservar às 19:30',
                output: {
                    nomeReservado: 'João',
                    dataHora: 'Hoje as 19:30',
                    qtdePessoas: 5
                }
            },
            {
                input: 'Gostaria de realizar uma reserva',
                output: {
                    nomeReservado: '',
                    dataHora: '',
                    qtdePessoas: 0
                }
            },
            {
                input: 'Me chamo Fabrício Peres e quero uma reserva para o dia 25/11 as 19hrs para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: 'Dia 22/11 as 19hrs',
                    qtdePessoas: 2
                }
            },
             {
                input: 'Me chamo Fabrício Peres e quero uma reserva para o dia 25/11 para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: '',
                    qtdePessoas: 2
                }
            },
        ]
    });
};
