import { z } from "zod";
import { checkarReservas } from "../../services/reservas.ts";
import { AIMessage, BaseMessage } from "langchain";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";
import type { RestauranteState } from "../state.ts";
import type { RowDataPacket } from "mysql2";

const dadosListagem = z.object({
    id: z.number(),
    qtdDePessoas: z.number(),
    dataHora: z.string(),
});

export type DadosListagemSchema =
    z.infer<typeof dadosListagem> & RowDataPacket;

export function solicitaListagem(messages: BaseMessage[]): boolean {
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

  return /\b(lista|minhas reservas|meu nome|checkar)\b/.test(normalizado);
}

export async function validarDadosListagem(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    try {
        const mensagensDoUsuario = state.messages.at(-1)?.text ?? "";

        const reservas: DadosListagemSchema[] = await checkarReservas(mensagensDoUsuario);
        if (reservas.length === 0)
            return {
                messages: [
                    ...state.messages,
                    new AIMessage(Mensagens(MensagensType.ZeroReservas)),
                ],
            };

        const reservasFormatadas = reservas
            .map((reserva: DadosListagemSchema) =>
                `Id: ${reserva.id} | Nome: ${mensagensDoUsuario} | Pessoas: ${reserva.qtdDePessoas} | Horário: ${reserva.dataHora}`
            )
            .join("\n");

        return {
            messages: [
                ...state.messages,
                new AIMessage(reservasFormatadas),
            ],
        };
    } catch (error) {
        console.error("Erro ao validar listagem:", error);

        return {
            sucesso: false,
            erro: "Erro ao validar listagem: " +
                (error as Error).message,
            messages: [
                ...state.messages,
                new AIMessage(Mensagens(MensagensType.Erro)),
            ],
        };
    }
}