import type { RestauranteState } from "../state.ts";


export async function disponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: true
    } 
}