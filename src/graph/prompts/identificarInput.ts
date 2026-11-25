export const getIdentificarInput = () => {
    return JSON.stringify({
        role: 'Recepcionista de uma Restaurante',
        task: 'Identifique a intenção do usuário para definir qual ação ele gostaria de fazer.',
        extraction_instructions: {
            output: 'Responda apenas com uma das intenções permitidas: reserva, cancelamento, listagem, confirmada, recusada ou aguardando.',
            rules: [
                'Aceite informações fornecidas em diferentes formatos e ordens.',
                'Não invente, deduza ou complete informações que não foram fornecidas.',
                'Use reserva para pedidos de criar uma reserva.',
                'Use cancelamento para pedidos de cancelar ou remover uma reserva.',
                'Use listagem para pedidos de consultar ou listar reservas.',
                'Use confirmada quando o usuário aceitar uma reserva pendente.',
                'Use recusada quando o usuário recusar uma reserva pendente.',
                'Use aguardando quando a solicitação não expressar uma ação clara.',
                'Não execute sistemas de conexão a banco ou query.'
            ]
        },
        examples: [
            {
                input: 'Gostaria de realizar um cancelamento',
                output: 'cancelamento'
            },
            {
                input: 'Gostaria de realizar uma reserva',
                output: 'reserva'
            },
            {
                input: 'Gostaria de verificar minhas reservas',
                output: 'listagem'
            },
            {
                input: 'Sim, pode confirmar',
                output: 'confirmada'
            },
            {
                input: 'Não quero confirmar',
                output: 'recusada'
            }
        ]
    })
}