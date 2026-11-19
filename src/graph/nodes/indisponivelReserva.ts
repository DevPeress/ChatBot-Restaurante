import type { RestauranteState } from "../state.ts";


export async function indisponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        erro: "Desculpe, não há disponibilidade para a reserva solicitada."
    } 
}