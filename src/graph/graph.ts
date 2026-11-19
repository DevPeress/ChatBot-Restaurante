import { END, START, StateGraph } from "@langchain/langgraph";
import { classificarPedido } from "./nodes/classificacaoPedido.ts";
import { validarDisponibilidade } from "./nodes/validarDisponibilidade.ts";
import { indisponivelReserva } from "./nodes/indisponivelReserva.ts";
import { RestauranteData, type RestauranteState } from "./state.ts";
import { disponivelReserva } from "./nodes/disponivelReserva.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("classificarPedido", classificarPedido)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addNode("indisponivelReserva", indisponivelReserva)
    .addNode("disponivelReserva", disponivelReserva)

    .addConditionalEdges(
      'validarDisponibilidade',
      (state: RestauranteState): string => {
        if (state.erro || !state.classificacaoDoPedido || state.classificacaoDoPedido === 'Desconhecido') {
          return 'indisponivelReserva';
        }

        if (!state.sucesso)
            return 'indisponivelReserva';

        return 'disponivelReserva';
      },
      {
        indisponivelReserva: 'indisponivelReserva',
        disponivelReserva: 'disponivelReserva',
      }
    )
    .addEdge(START, "classificarPedido")
    .addEdge("classificarPedido", "validarDisponibilidade")
    .addEdge("validarDisponibilidade", "indisponivelReserva")
    .addEdge("indisponivelReserva", END)

    .compile();