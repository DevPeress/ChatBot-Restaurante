import { z } from "zod";
import { checkarReservas } from "../../services/reservas.ts";
import { BaseMessage } from "langchain";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";
import type { RestauranteState } from "../state.ts";
import type { RowDataPacket } from "mysql2";

const dadosReservas = z.object({
    Id: z.number(),
    QtdDePessoas: z.number(),
    DataHora: z.string(),
});

export type dadosReservasSchema =
    z.infer<typeof dadosReservas> & RowDataPacket;

export function solicitaListagemDeReservas(messages: BaseMessage[]): boolean {
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

export async function validarDadosListagemReservas(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    try {
        const mensagensDoUsuario = state.messages.at(-1)?.text ?? "";

        const reservas: dadosReservasSchema[] = await checkarReservas(mensagensDoUsuario);
        if (reservas.length === 0)
            return {
                confirmacaoReserva: undefined,
                resposta: Mensagens(MensagensType.ZeroReservas)
            };

       const reservasFormatadas = reservas
            .map((reserva: dadosReservasSchema) =>
                `ID: ${reserva.Id} | Nome: ${mensagensDoUsuario} | Pessoas: ${reserva.QtdDePessoas} | Horário: ${new Date(reserva.DataHora).toLocaleString("pt-BR")}`
            )
            .join("\n\n");

        return {
            confirmacaoReserva: undefined,
            resposta: reservasFormatadas
        };
    } catch (error) {
        console.error("Erro ao validar listagem:", error);

        return {
            sucesso: false,
            confirmacaoReserva: undefined,
            erro: "Erro ao validar listagem: " +
                (error as Error).message,
            resposta: (Mensagens(MensagensType.Erro))
        };
    }
}