import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";
import { getIdentificarInput } from "../prompts/identificarInput.ts";

export async function identificarInput(
    state: RestauranteState
) : Promise<Partial<RestauranteState>> {
    try {
        const mensagensDoUsuario = state.messages.at(-1)?.text ?? "";
        const textoNormalizado = mensagensDoUsuario
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        if (
            state.confirmacaoReserva === "cancelar" &&
            /^(?:(?:id|identificador|registro|numero)(?:\s+da\s+reserva)?\s*)?#?\s*\d+$/.test(textoNormalizado.trim())
        ) {
            return {
                intencao: "cancelamento",
                confirmacaoReserva: "cancelar",
            };
        }

        if (state.confirmacaoReserva === "aguardando") {
            if (/^(sim|s|confirmar|confirmo|pode confirmar|isso|ok)\b/i.test(textoNormalizado)) {
                return {
                    intencao: "confirmada",
                    confirmacaoReserva: "confirmada",
                };
            }
            if (/^(nao|não|n|recusar|recuso|cancelar|desisto)\b/i.test(textoNormalizado)) {
                return {
                    intencao: "recusada",
                    confirmacaoReserva: "recusada",
                };
            }
        }

        if (state.confirmacaoReserva === "listagem") {
            return {
                intencao: "listagem",
                confirmacaoReserva: "listagem",
            };
        }

        if (/\b(cancelar|cancelamento|cancela|cancele|remover|excluir|desistir)\b/.test(textoNormalizado)) {
            return {
                intencao: "cancelamento",
                confirmacaoReserva: "cancelar",
            };
        }

        if (/\b(listar|lista|listar reservas|minhas reservas|meu nome|consultar|verificar)\b/.test(textoNormalizado)) {
            return {
                intencao: "listagem",
                confirmacaoReserva: "nome",
            };
        }

        const messages = [
            new SystemMessage(getIdentificarInput()),
            new HumanMessage(mensagensDoUsuario!)
        ]
        const validar = await model.invoke(messages);

        const respostaBruta = validar.text?.trim().toLowerCase() ?? "";
        let resposta = respostaBruta;

        try {
            const objeto = JSON.parse(respostaBruta);
            if (typeof objeto?.intencao === "string") {
                resposta = objeto.intencao;
            }
        } catch {
            resposta = respostaBruta
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z]/g, "");
        }

        const intencoesPermitidas = [
            "reserva",
            "cancelamento",
            "listagem",
            "confirmada",
            "recusada",
            "aguardando",
        ] as const;

        if (!intencoesPermitidas.includes(resposta as typeof intencoesPermitidas[number])) {
            return {
                intencao: "desconhecida",
                confirmacaoReserva: undefined,
                erro: "O modelo retornou uma resposta inválida.",
            };
        }

        const intencao = resposta as typeof intencoesPermitidas[number];

        if (intencao === "confirmada") {
            return { intencao, confirmacaoReserva: "confirmada" };
        }
        if (intencao === "recusada") {
            return { intencao, confirmacaoReserva: "recusada" };
        }
        if (intencao === "cancelamento") {
            return { intencao, confirmacaoReserva: "cancelar" };
        }
        if (intencao === "listagem") {
            return { intencao, confirmacaoReserva: "nome" };
        }

        return {
            intencao,
            confirmacaoReserva:
                intencao === "aguardando" && state.confirmacaoReserva === "aguardando"
                    ? "aguardando"
                    : undefined,
        };
    } catch (error) {
        console.error("Erro ao validar safe guard:", error);

        return {
            safe: false,
            erro: "Erro ao validar disponibilidade: " +
                (error as Error).message,
            messages: [
                ...state.messages,
                new AIMessage(Mensagens(MensagensType.Erro)),
            ],
        };
    }
}