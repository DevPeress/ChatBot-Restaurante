import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";


export async function disponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: true,
        confirmacaoReserva: "aguardando",
        resposta: state.confirmacaoReserva === "aguardando"
                    ? Mensagens(MensagensType["NaoEntendido Reserva"])
                    : Mensagens(MensagensType["Disponivel Reserva"])
    } 
}