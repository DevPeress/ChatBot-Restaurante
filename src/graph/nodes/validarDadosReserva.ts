import { AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";

const dadosReservaSchema = z.object({
    nomeReservado: z.string().nullable(),
    dataHora: z.string().nullable(),
    qtdePessoas: z.number().int().positive().nullable(),
});

const modeloValidacao = model.withStructuredOutput(dadosReservaSchema);

export async function validarDadosReserva(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    const mensagensDoUsuario = state.messages
        .filter((message) => message.getType() === "human")
        .map((message) => message.content);

    const dadosExtraidos = await modeloValidacao.invoke(`
        Você valida os dados necessários para uma reserva de restaurante.
        Analise somente as mensagens do usuário fornecidas abaixo.
        Extraia apenas informações explicitamente informadas; não invente,
        não use mensagens do assistente e retorne null quando um dado não
        estiver presente. A data e o horário podem permanecer no formato
        usado pelo usuário.

        Mensagens do usuário:
        ${JSON.stringify(mensagensDoUsuario)}
    `);

    const nomeReservado =
        state.nomeReservado?.trim() || dadosExtraidos.nomeReservado?.trim();
    const dataHora =
        state.dataHora?.trim() || dadosExtraidos.dataHora?.trim();
    const qtdePessoas =
        state.qtdePessoas && state.qtdePessoas > 0
            ? state.qtdePessoas
            : dadosExtraidos.qtdePessoas ?? undefined;

    const pendencias: string[] = [];

    if (!nomeReservado) {
        pendencias.push("nome");
    }

    if (!dataHora) {
        pendencias.push("data e horário desejados");
    }

    if (!qtdePessoas) {
        pendencias.push("quantidade de pessoas");
    }

    const dadosEncontrados = {
        ...(nomeReservado ? { nomeReservado } : {}),
        ...(dataHora ? { dataHora } : {}),
        ...(qtdePessoas ? { qtdePessoas } : {}),
    };

    if (pendencias.length > 0) {
        return {
            ...dadosEncontrados,
            sucesso: false,
            erro: undefined,
            messages: [
                ...state.messages,
                new AIMessage(
                    `Para continuar com a reserva, informe: ${pendencias.join(", ")}.`
                ),
            ],
        };
    }

    return {
        ...dadosEncontrados,
        sucesso: true,
        erro: undefined,
    };
}
