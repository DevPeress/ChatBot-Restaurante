import { z } from "zod";

export const RestauranteState = z.object({
    nomeReservado: z.string().optional(),
    qtdePessoas: z.number().optional(),
    dataHora: z.string().optional(),
});