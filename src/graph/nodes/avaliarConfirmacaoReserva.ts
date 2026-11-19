import type { RestauranteState } from "../state.ts";
import type { BaseMessage } from "@langchain/core/messages";

const respostasAfirmativas = new Set([
    "sim",
    "s",
    "sim confirmo",
    "sim pode confirmar",
    "sim pode confirmar a reserva",
    "confirmo",
    "confirmar",
    "pode confirmar",
    "pode confirmar a reserva",
    "pode reservar",
    "confirmado",
    "ok",
    "okay",
    "claro",
]);

const respostasNegativas = new Set([
    "nao",
    "n",
    "nao obrigado",
    "nao obrigada",
    "nao quero",
    "nao quero confirmar",
    "nao confirme",
    "cancela",
    "cancele",
    "desisto",
    "deixa pra la",
    "deixa para la",
]);

function normalizarResposta(resposta: string): string {
    return resposta
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[.,!?;:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function extrairTexto(message: BaseMessage): string | undefined {
    if (typeof message.content === "string") {
        return message.content;
    }

    if (!Array.isArray(message.content)) {
        return undefined;
    }

    return message.content
        .map((part) => {
            if (typeof part === "string") {
                return part;
            }

            if ("text" in part && typeof part.text === "string") {
                return part.text;
            }

            return "";
        })
        .join(" ");
}

export function ultimaRespostaSeguePedidoDeConfirmacao(
    messages: BaseMessage[]
): boolean {
    let encontrouMensagemHumana = false;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];

        if (!message) {
            continue;
        }

        if (message.getType() === "human") {
            encontrouMensagemHumana = true;
            continue;
        }

        if (encontrouMensagemHumana && message.getType() === "ai") {
            return extrairTexto(message)?.includes("Deseja confirmar a reserva?") ?? false;
        }
    }

    return false;
}

export async function avaliarConfirmacaoReserva(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    const ultimaMensagemHumana = [...state.messages]
        .reverse()
        .find((message) => message.getType() === "human");

    const textoResposta = ultimaMensagemHumana
        ? extrairTexto(ultimaMensagemHumana)
        : undefined;

    if (!textoResposta) {
        return { confirmacaoReserva: "aguardando" };
    }

    const resposta = normalizarResposta(textoResposta);

    if (respostasAfirmativas.has(resposta)) {
        return { confirmacaoReserva: "confirmada" };
    }

    if (respostasNegativas.has(resposta)) {
        return { confirmacaoReserva: "recusada" };
    }

    return { confirmacaoReserva: "aguardando" };
}
