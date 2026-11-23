import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";
import { adicionarReserva } from "../../services/reservas.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

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
            resposta: Mensagens(MensagensType.InserirReserva) + reserva.id,
        } 
    } catch (error) {
        console.error("Erro ao inserir reserva:", error);
        return {
            sucesso: false,
            erro: "Erro ao inserir reserva: " + (error as Error).message,
            resposta: Mensagens(MensagensType.Erro),
        };
    }
}