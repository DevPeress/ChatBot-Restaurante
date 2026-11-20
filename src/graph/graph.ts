import { END, START, StateGraph } from "@langchain/langgraph";
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
import { cancelarReserva, solicitaCancelamentoReserva } from "./nodes/cancelarReserva.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("validarDadosReserva", validarDadosReserva)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addNode("indisponivelReserva", indisponivelReserva)
    .addNode("disponivelReserva", disponivelReserva)
    .addNode("inserirReserva", inserirReserva)
    .addNode("avaliarConfirmacaoReserva", avaliarConfirmacaoReserva)
    .addNode("reservaRecusada", reservaRecusada)
    .addNode("mensagemErroAoReservar", mensagemErroAoReservar)
    .addNode("cancelarReserva", cancelarReserva)

    .addConditionalEdges(
      START,
      (state: RestauranteState): string =>
        solicitaCancelamentoReserva(state.messages)
          ? "cancelarReserva"
          : state.confirmacaoReserva === "aguardando" ||
        (!state.confirmacaoReserva &&
          ultimaRespostaSeguePedidoDeConfirmacao(state.messages))
          ? "avaliarConfirmacaoReserva"
          : "validarDadosReserva",
      {
        cancelarReserva: "cancelarReserva",
        avaliarConfirmacaoReserva: "avaliarConfirmacaoReserva",
        validarDadosReserva: "validarDadosReserva",
      }
    )
    .addConditionalEdges(
      'validarDisponibilidade',
      (state: RestauranteState): string => {
        if (
          state.erro ||
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
    .addEdge("disponivelReserva", END)
    .addEdge("inserirReserva", END)
    .addEdge("reservaRecusada", END)
    .addEdge("indisponivelReserva", END)
    .addEdge("mensagemErroAoReservar", END)
    .addEdge("cancelarReserva", END)

    .compile();