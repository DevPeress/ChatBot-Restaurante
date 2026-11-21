import { AIMessage, HumanMessage, SystemMessage } from "langchain";
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";
import { getInputPrompt } from "../prompts/input.ts";

export async function safeGuard(
    state: RestauranteState
) : Promise<Partial<RestauranteState>> {
    try {
        const mensagensDoUsuario = state.messages.at(-1)?.text ?? "";

        const messages = [
            new SystemMessage(getInputPrompt()),
            new HumanMessage(mensagensDoUsuario!)
        ]
        const validar = await model.invoke(messages);

        if (!validar)
        {
            return {
                safe: false,
                erro: "Não foi possível validar a segurança da mensagem."
            };
        }

        const mensagem = validar.text.toLowerCase();

        const isUnsafe =
            mensagem.includes("inseguro") ||
            mensagem.includes("insegura");

        const isSafe = mensagem.includes("seguro") || mensagem.includes("segura")

        if (isUnsafe || !isSafe)
        {
            return {
                safe: false,
                 messages: [
                    ...state.messages,
                    new AIMessage(
                        `Mensagem maliciosa detectada. Esse tipo de mensagem não será executada dentro do sistema!`
                    ),
                ],
                erro: "Mensagem maliciosa detectada. Esse tipo de mensagem não será executada dentro do sistema!"
            };
        }

        return {
            safe: true,
        }
    } catch (error) {
        console.error("Erro ao validar safe guard:", error);

        return {
            safe: false,
            erro: "Erro ao validar disponibilidade: " +
                (error as Error).message
        };
    }
}