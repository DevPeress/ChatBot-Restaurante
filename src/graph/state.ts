import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const RestauranteData = Annotation.Root({
    ...MessagesAnnotation.spec,
    nomeReservado: Annotation<string | undefined>(),
    qtdePessoas: Annotation<number | undefined>(),
    dataHora: Annotation<string | undefined>(),
    classificacaoDoPedido: Annotation<"Alta" | "Média" | "Baixa" | undefined>(),
    sucesso: Annotation<boolean | undefined>(),
    erro: Annotation<string | undefined>(),
});

export type RestauranteState = typeof RestauranteData.State;
