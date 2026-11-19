import { END, START, StateGraph } from "@langchain/langgraph";
import { RestauranteData } from "./state.ts";
import { classificarPedido } from "./nodes/classificacaoPedido.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("classificacaoPedido", classificarPedido)
    .addEdge(START, "classificacaoPedido")
    .addEdge("classificacaoPedido", END)
    .compile();