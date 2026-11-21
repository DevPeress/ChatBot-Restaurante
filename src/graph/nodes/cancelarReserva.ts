import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";
import { removerReserva } from "../../services/reservas.ts";

export function solicitaCancelamentoReserva(messages: BaseMessage[]): boolean {
  const ultimaMensagemHumana = [...messages]
    .reverse()
    .find((message) => message.getType() === "human");

  if (!ultimaMensagemHumana) {
    return false;
  }

  const texto = typeof ultimaMensagemHumana.content === "string"
    ? ultimaMensagemHumana.content
    : JSON.stringify(ultimaMensagemHumana.content);

  const normalizado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return /\b(cancelar|cancelamento|cancela|cancele|remover|remova|excluir|exclua|desistir)\b/.test(normalizado);
}

function extrairTexto(message: BaseMessage): string {
    if (typeof message.content === "string") {
        return message.content;
    }

    if (!Array.isArray(message.content)) {
        return "";
    }

    return message.content
        .map((part) => {
            if (typeof part === "string") {
                return part;
            }
            return "text" in part && typeof part.text === "string"
                ? part.text
                : "";
        })
        .join(" ");
}

export function extrairIdReserva(
    messages: BaseMessage[],
    idReservado?: number
): number | undefined {
    if (idReservado && idReservado > 0) {
        return idReservado;
    }

    const ultimaMensagemHumana = [...messages]
        .reverse()
        .find((message) => message.getType() === "human");

    if (!ultimaMensagemHumana) {
        return undefined;
    }

    const texto = extrairTexto(ultimaMensagemHumana);
    const idExplicito = texto.match(
        /\b(?:id|identificador|registro|numero|n[uú]mero)\b\s*(?:da\s+reserva)?\s*(?:[:=#-]\s*)?(\d+)\b/i
    );
    if (idExplicito?.[1]) {
        return Number(idExplicito[1]);
    }

    const numeroDepoisDoPedido = texto.match(
        /\b(?:cancelar?|remover|excluir|desativar)\b.{0,40}?\b(\d+)\b/i
    );
    if (numeroDepoisDoPedido?.[1]) {
        return Number(numeroDepoisDoPedido[1]);
    }

    return undefined;
}

export async function cancelarReserva(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    const idReserva = extrairIdReserva(state.messages, state.idReserva);

    if (!idReserva) {
        return {
            sucesso: false,
            erro: "Informe o ID de registro da reserva que deseja cancelar.",
            messages: [
                ...state.messages,
                new AIMessage(
                    "Informe o ID de registro da reserva que deseja cancelar."
                ),
            ],
        };
    }

    if (await removerReserva(idReserva)) {
        return {
            sucesso: true,
            idReserva: undefined,
            confirmacaoReserva: "recusada",
            erro: undefined,
            messages: [
                ...state.messages,
                new AIMessage(
                    `Reserva com o ID ${idReserva} cancelada com sucesso.`
                ),
            ],
        };
    }

    return {
        sucesso: false,
        erro: `Não foi encontrada uma reserva com o ID ${idReserva}.`,
        messages: [
            ...state.messages,
            new AIMessage(
                `Não foi encontrada uma reserva com o ID ${idReserva}.`
            ),
        ],
    };
}
