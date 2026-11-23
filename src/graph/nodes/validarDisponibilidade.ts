import type { RestauranteState } from "../state.ts";
import { checkarDisponibilidade } from "../../services/reservas.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function validarDisponibilidade(state: RestauranteState): Promise<Partial<RestauranteState>> {
    try {
        if (!state.nomeReservado || !state.dataHora || !state.qtdePessoas) {
            return {
                sucesso: false,
                erro: "Nome, quantidade de pessoas e horário são obrigatórios para verificar a disponibilidade.",
            };
        }

        return {
            sucesso: await checkarDisponibilidade(
                state.dataHora
            ),
            erro: undefined,
        }
    } catch (error) {
        console.error("Erro ao validar disponibilidade:", error);

        return {
            sucesso: false,
            erro: "Erro ao validar disponibilidade: " +
                (error as Error).message,
            resposta: Mensagens(MensagensType.Erro)
        };
    }   
}

