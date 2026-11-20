import { END, START, StateGraph } from "@langchain/langgraph";
import { classificarPedido } from "./nodes/classificacaoPedido.ts";
import { validarDisponibilidade } from "./nodes/validarDisponibilidade.ts";
import { indisponivelReserva } from "./nodes/indisponivelReserva.ts";
import { RestauranteData, type RestauranteState } from "./state.ts";
import { disponivelReserva } from "./nodes/disponivelReserva.ts";
import { inserirReserva } from "./nodes/inserirReserva.ts";
import {
  avaliarConfirmacaoReserva,
  ultimaRespostaSeguePedidoDeConfirmacao,
} from "./nodes/avaliarConfirmacaoReserva.ts";
import { reservaRecusada } from "./nodes/reservaRecusada.ts";
import { validarDadosReserva } from "./nodes/validarDadosReserva.ts";
import { mensagemErroAoReservar } from "./nodes/mensagemErroAoReservar.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("validarDadosReserva", validarDadosReserva)
    .addNode("classificarPedido", classificarPedido)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addNode("indisponivelReserva", indisponivelReserva)
    .addNode("disponivelReserva", disponivelReserva)
    .addNode("inserirReserva", inserirReserva)
    .addNode("avaliarConfirmacaoReserva", avaliarConfirmacaoReserva)
    .addNode("reservaRecusada", reservaRecusada)
    .addNode("mensagemErroAoReservar", mensagemErroAoReservar)

    .addConditionalEdges(
      START,
      (state: RestauranteState): string =>
        state.confirmacaoReserva === "aguardando" ||
        (!state.confirmacaoReserva &&
          ultimaRespostaSeguePedidoDeConfirmacao(state.messages))
          ? "avaliarConfirmacaoReserva"
          : "validarDadosReserva",
      {
        avaliarConfirmacaoReserva: "avaliarConfirmacaoReserva",
        validarDadosReserva: "validarDadosReserva",
      }
    )
    .addConditionalEdges(
      "validarDadosReserva",
      (state: RestauranteState): string =>
        state.sucesso ? "classificarPedido" : END,
      {
        classificarPedido: "classificarPedido",
        [END]: END,
      }
    )
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
    .addConditionalEdges(
      "avaliarConfirmacaoReserva",
      (state: RestauranteState): string => {
        if (state.confirmacaoReserva === "confirmada") {
          return "inserirReserva";
        }

        if (state.confirmacaoReserva === "recusada") {
          return "reservaRecusada";
        }

        return "mensagemErroAoReservar";
      },
      {
        inserirReserva: "inserirReserva",
        reservaRecusada: "reservaRecusada",
        mensagemErroAoReservar: "mensagemErroAoReservar",
      }
    )
    .addEdge("classificarPedido", "validarDisponibilidade")
    .addEdge("disponivelReserva", END)
    .addEdge("inserirReserva", END)
    .addEdge("reservaRecusada", END)
    .addEdge("indisponivelReserva", END)
    .addEdge("mensagemErroAoReservar", END)

    .compile();