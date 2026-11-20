import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";
import { adicionarReserva } from "../../services/reservas.ts";

export async function inserirReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    if (state.confirmacaoReserva !== "confirmada") {
        return {
            sucesso: false,
            erro: "A reserva só pode ser inserida após a confirmação explícita do cliente.",
        };
    }

    try {
        // Simular a inserção da reserva
        const reserva = await adicionarReserva({
            nomeReservante: state.nomeReservado!,
            horarioReserva: state.dataHora!,
            numeroPessoas: state.qtdePessoas!,
        });

        return {
            sucesso: true,
            messages: [
                ...state.messages,
                new AIMessage('Reserva enviada com sucesso! Agradecemos por escolher nosso restaurante e esperamos vê-lo em breve. Para cancelar a reserva, envie o pedido com o ID de registro ' + reserva.id)
            ],
        } 
    } catch (error) {
        console.error("Erro ao inserir reserva:", error);
        return {
            sucesso: false,
            erro: "Erro ao inserir reserva: " + (error as Error).message 
        };
    }
}