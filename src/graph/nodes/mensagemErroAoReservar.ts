import type { RestauranteState } from "../state.ts";


export async function mensagemErroAoReservar(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        erro: "Desculpe, tivemos um erro ao processar sua reserva."
    } 
}