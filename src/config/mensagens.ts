export enum MensagensType {
    "ValidarDados",
    "Maliciosa",
    "ReservaRecusada",
    "InserirReserva",
    "IndisponivelReserva",
    "Disponivel Reserva",
    "NaoEntendido Reserva",
    "InformarId",
    "ReservaCancelada",
    "NaoEncontradaId",
    "Erro",
    "RequisitarNome"
}

export const Mensagens = (tipo: MensagensType) => {
    switch(tipo){
        case MensagensType.ValidarDados:
            return 'Para continuar com a reserva, são obrigatórios: nome da pessoa, quantidade de pessoas e horário desejado. Ainda preciso de:'

        case MensagensType.Maliciosa:
            return 'Mensagem maliciosa detectada. Esse tipo de mensagem não será executada dentro do sistema!'
    
        case MensagensType.ReservaRecusada:
            return 'Tudo bem, não vou confirmar a reserva.'

        case MensagensType.InserirReserva:
            return 'Reserva enviada com sucesso! Agradecemos por escolher nosso restaurante e esperamos vê-lo em breve. Para cancelar a reserva, envie o pedido com o ID de registro '
    
        case MensagensType.IndisponivelReserva:
            return "Desculpe, não há disponibilidade para a reserva solicitada."

        case MensagensType["Disponivel Reserva"]:
            return "Reserva disponível! Deseja confirmar a reserva? Responda sim ou não."

        case MensagensType["NaoEntendido Reserva"]:
            return "Não entendi sua resposta. Deseja confirmar a reserva? Responda sim ou não."

        case MensagensType.InformarId:
            return "Informe o ID de registro da reserva que deseja cancelar."

        case MensagensType.ReservaCancelada:
            return "Sua reserva foi cancelada com sucesso! Aguardamos seu retorno em breve!"

        case MensagensType.NaoEncontradaId:
            return "Desculpe, não consegui localizar sua reserva."

        case MensagensType.Erro:
            return "Erro inesperado, tente novamente!"

        case MensagensType.RequisitarNome:
            return "Por favor me envie o nome de quem reservou."
    }
}