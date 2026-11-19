import type { RestauranteState } from "../state.ts";

export async function validarDisponibilidade(state: RestauranteState): Promise<Partial<RestauranteState>> {
    try {
        // validação no banco

        return {
            sucesso: true
        }
    } catch (error) {
        console.error("Erro ao validar disponibilidade:", error);

        return {
            sucesso: false,
            erro: "Erro ao validar disponibilidade: " +
                (error as Error).message
        };
    }   
}
