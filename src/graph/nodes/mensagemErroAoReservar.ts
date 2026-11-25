import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function mensagemErroAoReservar(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        erro: state.erro ?? "Desculpe, tivemos um erro ao processar sua reserva.",
        resposta: Mensagens(MensagensType.Erro),
    } 
}