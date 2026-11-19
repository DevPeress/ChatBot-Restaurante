import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";

export function classificarPedido(state: any) {
    return async (state: RestauranteState): Promise<Partial<RestauranteState>> => {
        try {
            const prompt = `
                Você é um assistente de restaurante. Classifique o pedido com base nas informações fornecidas.
                Nome Reservado: ${state.nomeReservado ?? "Não fornecido"}
                Quantidade de Pessoas: ${state.qtdePessoas ?? "Não fornecido"}
                Data e Hora: ${state.dataHora ?? "Não fornecido"}

                Priorize a classificação do pedido e forneça uma resposta clara e concisa.
                Siga a estrutura de resposta: 
                    1. Classificação do Pedido: (ex: Alta, Média, Baixa) baseado na quantidade de pessoas e horário próximo da reserva.
            `
            console.log("Prompt enviado para classificação do pedido:", prompt);
            const response = await model.invoke(prompt);
            if (!response.content) {
                return {
                    sucesso: false,
                    erro: "Não foi possível classificar o pedido. Tente novamente mais tarde.",
                };
            }

            const classificationIA = response.content;
            console.log("Classificação do pedido:", classificationIA);
            return {
                ...state
            };
        } catch (error) {
            return  {
                sucesso: false,
                erro: "Erro ao classificar o pedido: " + (error as Error).message,
            };
        }
    }
}