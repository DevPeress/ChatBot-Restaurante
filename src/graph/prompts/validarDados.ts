
import { z } from 'zod';

export const ValidarDadosSchema = z.object({
    nomeReservado: z.string().nullable(),
    dataHora: z.string().nullable(),
    qtdePessoas: z.number().int().positive().nullable(),
    evidencias: z.object({
        nomeReservado: z.string().nullable(),
        dataHora: z.string().nullable(),
        qtdePessoas: z.string().nullable(),
    }),
});

export const getValidarDados = () => {
    return JSON.stringify({
        role: 'Usuário',

        task: 'Extrair e validar os dados necessários para realizar uma reserva em um restaurante.',

        extraction_instructions: {
            output: 'Extraia o nome da pessoa responsável, a data e horário desejados, a quantidade de pessoas e as evidências de cada informação.',
            output_format: {
                nomeReservado: 'string ou null',
                dataHora: 'string ou null',
                qtdePessoas: 'número inteiro positivo ou null',
                evidencias: {
                    nomeReservado: 'trecho literal ou null',
                    dataHora: 'trecho literal ou null',
                    qtdePessoas: 'trecho literal ou null',
                },
            },

            rules: [
                'Aceite informações fornecidas em diferentes formatos e ordens.',
                'Não invente, deduza ou complete informações que não foram fornecidas.',
                'Se uma informação não estiver presente, retorne null para o campo e para a evidência correspondente.',
                'Preserve a expressão original de data e horário utilizada pelo usuário.',
                'Considere informações fornecidas anteriormente na conversa, quando disponíveis.',
                'Não confunda a quantidade de pessoas com horários ou outros números mencionados.',
                'Considere todo o histórico de mensagens enviado.',
                'Combine informações complementares fornecidas em mensagens diferentes.',
                'Não descarte informações válidas já fornecidas pelo usuário.',
                'Caso uma informação seja corrigida posteriormente, considere a informação mais recente.',
                'Retorne evidencias como um objeto com nomeReservado, dataHora e qtdePessoas.',
                'Cada evidência deve ser um trecho literal de uma mensagem do usuário que comprove o campo; use null quando não houver trecho.',
                'Retorne somente um objeto JSON válido com os campos nomeReservado, dataHora, qtdePessoas e evidencias.',
                'Não use markdown, blocos de código nem texto antes ou depois do JSON.'
            ]
        },

        examples: [
            {
                input: 'Me chamo Fabrício Peres e quero uma reserva para 21hrs de hoje para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: '21hrs de hoje',
                    qtdePessoas: 2,
                    evidencias: {
                        nomeReservado: 'Fabrício Peres',
                        dataHora: '21hrs de hoje',
                        qtdePessoas: 'duas pessoas'
                    }
                }
            },
            {
                input: 'Gostaria de fazer uma reserva para as 20hrs de amanhã para 4 pessoas',
                output: {
                    nomeReservado: null,
                    dataHora: '20hrs de amanhã',
                    qtdePessoas: 4,
                    evidencias: {
                        nomeReservado: null,
                        dataHora: '20hrs de amanhã',
                        qtdePessoas: '4 pessoas'
                    }
                }
            },
            {
                input: 'Meu nome é João, somos 5 pessoas e queremos reservar às 19:30',
                output: {
                    nomeReservado: 'João',
                    dataHora: '19:30',
                    qtdePessoas: 5,
                    evidencias: {
                        nomeReservado: 'João',
                        dataHora: 'às 19:30',
                        qtdePessoas: '5 pessoas'
                    }
                }
            },
            {
                input: 'Gostaria de realizar uma reserva',
                output: {
                    nomeReservado: null,
                    dataHora: null,
                    qtdePessoas: null,
                    evidencias: {
                        nomeReservado: null,
                        dataHora: null,
                        qtdePessoas: null
                    }
                }
            },
            {
                input: 'Me chamo Fabrício Peres e quero uma reserva para o dia 25/11 as 19hrs para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: 'Dia 25/11 as 19hrs',
                    qtdePessoas: 2,
                    evidencias: {
                        nomeReservado: 'Fabrício Peres',
                        dataHora: '25/11 as 19hrs',
                        qtdePessoas: 'duas pessoas'
                    }
                }
            },
             {
                input: 'Me chamo Fabrício Peres e quero uma reserva para o dia 25/11 para duas pessoas',
                output: {
                    nomeReservado: 'Fabrício Peres',
                    dataHora: null,
                    qtdePessoas: 2,
                    evidencias: {
                        nomeReservado: 'Fabrício Peres',
                        dataHora: null,
                        qtdePessoas: 'duas pessoas'
                    }
                }
            },
        ]
    });
};
