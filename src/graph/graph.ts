import { END, START, StateGraph } from "@langchain/langgraph";
import { classificarPedido } from "./nodes/classificacaoPedido.ts";
import { validarDisponibilidade } from "./nodes/validarDisponibilidade.ts";
import { indisponivelReserva } from "./nodes/indisponivelReserva.ts";
import { RestauranteData, type RestauranteState } from "./state.ts";
import { disponivelReserva } from "./nodes/disponivelReserva.ts";
import { inserirReserva } from "./nodes/inserirReserva.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("classificarPedido", classificarPedido)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addNode("indisponivelReserva", indisponivelReserva)
    .addNode("disponivelReserva", disponivelReserva)
    .addNode("inserirReserva", inserirReserva)

    .addConditionalEdges(
      'validarDisponibilidade',
      (state: RestauranteState): string => {
        if (
          state.erro ||
          !state.classificacaoDoPedido ||
          state.classificacaoDoPedido === 'Desconhecido' ||
          !state.sucesso
        ) {
          return 'indisponivelReserva';
        }

        return 'disponivelReserva';
      },
      {
        indisponivelReserva: 'indisponivelReserva',
        disponivelReserva: 'disponivelReserva',
      }
    )
    .addEdge(START, "classificarPedido")
    .addEdge("classificarPedido", "validarDisponibilidade")
    .addEdge("disponivelReserva", "inserirReserva")

    .addEdge("indisponivelReserva", END)

    .compile();