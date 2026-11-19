import { END, START, StateGraph } from "@langchain/langgraph";
import { RestauranteData } from "./state.ts";
import { classificarPedido } from "./nodes/classificacaoPedido.ts";
import { validarDisponibilidade } from "./nodes/validarDisponibilidade.ts";

export const graphData = new StateGraph(RestauranteData)
    .addNode("classificacaoPedido", classificarPedido)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addEdge(START, "classificacaoPedido")
    .addEdge("classificacaoPedido", "validarDisponibilidade")
    .addEdge("validarDisponibilidade", END)
    .compile();