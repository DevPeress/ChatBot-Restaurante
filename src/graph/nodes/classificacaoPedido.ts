
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";

export async function classificarPedido(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    try {
        const prompt = `
            Você é um assistente de restaurante.
            Classifique o pedido conforme as informações fornecidas.

            Nome reservado: ${state.nomeReservado ?? "Não fornecido"}
            Quantidade de pessoas: ${state.qtdePessoas ?? "Não fornecido"}
            Data e hora: ${state.dataHora ?? "Não fornecido"}

            Classifique como Alta, Média ou Baixa.
            Considere a quantidade de pessoas e a proximidade
            do horário da reserva.

            Responda somente com uma das opções:
            Alta, Média ou Baixa.
        `;

        const response = await model.invoke(prompt);

        const texto = typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content);

        const resultado = texto.match(/\b(Alta|Média|Baixa)\b/i);

        if (!resultado) {
            return {
                sucesso: false,
                erro: "A IA não retornou uma classificação válida."
            };
        }

        const categoria = resultado[0].toLowerCase();

        const classificacaoDoPedido =
            categoria === "alta" ? "Alta" :
            categoria === "baixa" ? "Baixa" :
            "Média";

        return {
            classificacaoDoPedido,
            sucesso: true
        };

    } catch (error) {
        console.error("Erro ao classificar pedido:", error);

        return {
            sucesso: false,
            erro: "Erro ao classificar pedido: " +
                (error as Error).message
        };
    }
}
