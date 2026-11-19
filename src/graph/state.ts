import { z } from "zod";

export const RestauranteData = z.object({
    nomeReservado: z.string().optional(),
    qtdePessoas: z.number().optional(),
    dataHora: z.string().optional(),
    classificacaoPedido: z.enum(["Alta", "Média", "Baixa"]).optional(),

    sucesso: z.boolean().optional(),
    erro: z.string().optional(),
});

export type RestauranteState = z.infer<typeof RestauranteData>;