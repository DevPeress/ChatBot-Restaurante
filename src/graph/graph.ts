import { END, START, StateGraph } from "@langchain/langgraph";
import { validarDisponibilidade } from "./nodes/validarDisponibilidade.ts";
import { indisponivelReserva } from "./nodes/indisponivelReserva.ts";
import { RestauranteData, type RestauranteState } from "./state.ts";
import { disponivelReserva } from "./nodes/disponivelReserva.ts";
import { inserirReserva } from "./nodes/inserirReserva.ts";
import { reservaRecusada } from "./nodes/reservaRecusada.ts";
import { validarDadosReserva } from "./nodes/validarDadosReserva.ts";
import { mensagemErroAoReservar } from "./nodes/mensagemErroAoReservar.ts";
import { cancelarReserva } from "./nodes/cancelarReserva.ts";
import { safeGuardInput } from "./nodes/safeGuardInput.ts";
import { requisicaoNome } from "./nodes/requisicaoNome.ts";
import { validarDadosListagemReservas } from "./nodes/dadosListagemReservas.ts";
import { safeGuardOutput } from "./nodes/safeGuardOutput.ts";
import { identificarInput } from "./nodes/identificarInput.ts";

export const graphData = new StateGraph({ stateSchema: RestauranteData })
    .addNode("safeGuardInput", safeGuardInput)
    .addNode("identificarIntencao", identificarInput)
    .addNode("validarDadosReserva", validarDadosReserva)
    .addNode("validarDisponibilidade", validarDisponibilidade)
    .addNode("indisponivelReserva", indisponivelReserva)
    .addNode("disponivelReserva", disponivelReserva)
    .addNode("inserirReserva", inserirReserva)
    .addNode("reservaRecusada", reservaRecusada)
    .addNode("mensagemErroAoReservar", mensagemErroAoReservar)
    .addNode("cancelarReserva", cancelarReserva)
    .addNode("requisicaoNome", requisicaoNome)
    .addNode("validarDadosListagem", validarDadosListagemReservas)
    .addNode("safeGuardOutput", safeGuardOutput)

    .addEdge(START, "safeGuardInput")

    .addEdge("safeGuardInput", "identificarIntencao")
    .addConditionalEdges(
      "identificarIntencao",
      (state: RestauranteState) => {
        if (state.safe !== true) return "bloqueado";

        if (state.intencao === "cancelamento")
          return "cancelarReserva";

        if (state.confirmacaoReserva === "nome")
          return "requisicaoNome";

        if (state.intencao === "listagem")
          return "validarDadosListagem";

        if (state.intencao === "confirmada")
          return "inserirReserva";

        if (state.intencao === "recusada")
          return "reservaRecusada";

        if (state.confirmacaoReserva === "confirmada")
          return "inserirReserva";

        if (state.confirmacaoReserva === "recusada")
          return "reservaRecusada";

        if (
          state.confirmacaoReserva === "aguardando" &&
          state.intencao === "aguardando"
        )
          return "disponivelReserva";

        if (state.confirmacaoReserva == "cancelar")
          return "cancelarReserva";

        if (state.confirmacaoReserva === "listagem")
          return "validarDadosListagem"

        return "validarDadosReserva";
      },
      {
        bloqueado: END,
        cancelarReserva: "cancelarReserva",
        validarDadosReserva: "validarDadosReserva",
        requisicaoNome: "requisicaoNome",
        validarDadosListagem: "validarDadosListagem",
        disponivelReserva: "disponivelReserva",
        inserirReserva: "inserirReserva",
        reservaRecusada: "reservaRecusada",
      }
    )
    .addConditionalEdges(
      'validarDisponibilidade',
      (state: RestauranteState): string => {
        if (state.erro) {
          return 'mensagemErroAoReservar';
        }

        if (!state.sucesso) {
          return 'indisponivelReserva';
        }

        return 'disponivelReserva';
      },
      {
        mensagemErroAoReservar: 'mensagemErroAoReservar',
        indisponivelReserva: 'indisponivelReserva',
        disponivelReserva: 'disponivelReserva',
      }
    )
    .addConditionalEdges(
      "validarDadosReserva",
      (state: RestauranteState): string => {
        if (!state.sucesso) {
          return "concluir";
        }

        return "validarDisponibilidade";
      },
      {
        concluir: "safeGuardOutput",
        validarDisponibilidade: "validarDisponibilidade",
      }
    )
    .addEdge("disponivelReserva", "safeGuardOutput")
    .addEdge("inserirReserva", "safeGuardOutput")
    .addEdge("reservaRecusada", "safeGuardOutput")
    .addEdge("mensagemErroAoReservar", "safeGuardOutput")
    .addEdge("indisponivelReserva", "safeGuardOutput")
    .addEdge("cancelarReserva", "safeGuardOutput")
    .addEdge("requisicaoNome", "safeGuardOutput")
    .addEdge("validarDadosListagem", "safeGuardOutput")

    .addEdge("safeGuardOutput", END)

    .compile();