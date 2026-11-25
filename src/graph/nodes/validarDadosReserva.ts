import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";
import { getValidarDados, ValidarDadosSchema } from "../prompts/validarDados.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";
import { dataHoraReservaValida } from "../../services/reservas.ts";

function evidenciaFoiInformada(
    evidencia: string | null,
    mensagensDoUsuario: string[]
): boolean {
    const trecho = evidencia?.trim().toLocaleLowerCase("pt-BR");

    return Boolean(
        trecho &&
        mensagensDoUsuario.some((mensagem) =>
            mensagem.toLocaleLowerCase("pt-BR").includes(trecho)
        )
    );
}

function interpretarDadosReserva(resposta: string) {
    const inicioJson = resposta.indexOf("{");
    const fimJson = resposta.lastIndexOf("}");

    if (inicioJson === -1 || fimJson <= inicioJson) {
        console.error("O modelo não retornou um objeto JSON para os dados da reserva.");
        return undefined;
    }

    let dados: unknown;
    try {
        dados = JSON.parse(resposta.slice(inicioJson, fimJson + 1));
    } catch (error) {
        console.error("Não foi possível interpretar o JSON dos dados da reserva:", error);
        return undefined;
    }

    const resultado = ValidarDadosSchema.safeParse(dados);
    if (!resultado.success) {
        console.error("O JSON dos dados da reserva não corresponde ao formato esperado:", resultado.error);
        return undefined;
    }

    return resultado.data;
}

export async function validarDadosReserva(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    const mensagensDoUsuario = state.messages
        .filter((message) => message.getType() === "human")
        .map((message) =>
            typeof message.content === "string"
                ? message.content
                : JSON.stringify(message.content) ?? ""
        );

    const messages = [
        new SystemMessage(getValidarDados()),
        new HumanMessage(`
            Histórico de mensagens do usuário:

            ${mensagensDoUsuario
                .map((mensagem, index) => `${index + 1}. ${mensagem}`)
                .join("\n")}
        `)
    ];
    const respostaModelo = await model.invoke(messages);
    const dadosExtraidos = interpretarDadosReserva(respostaModelo.text ?? "");

    if (!dadosExtraidos) {
        return {
            sucesso: false,
            erro: "Não foi possível interpretar os dados retornados pelo modelo.",
            resposta: Mensagens(MensagensType.Erro),
        };
    }

    const nomeExtraido =
        evidenciaFoiInformada(
            dadosExtraidos.evidencias.nomeReservado,
            mensagensDoUsuario
        )
            ? dadosExtraidos.nomeReservado?.trim()
            : undefined;
    const nomeReservado = state.nomeReservado?.trim() || nomeExtraido;

    const horarioExtraido =
        evidenciaFoiInformada(
            dadosExtraidos.evidencias.dataHora,
            mensagensDoUsuario
        ) &&
        dadosExtraidos.evidencias.dataHora &&
        dataHoraReservaValida(dadosExtraidos.dataHora ?? "")
            ? dadosExtraidos.dataHora?.trim()
            : undefined;
    const dataHora = state.dataHora?.trim() && dataHoraReservaValida(state.dataHora)
        ? state.dataHora.trim()
        : horarioExtraido;

    const quantidadeExtraida =
        evidenciaFoiInformada(
            dadosExtraidos.evidencias.qtdePessoas,
            mensagensDoUsuario
        )
            ? dadosExtraidos.qtdePessoas ?? undefined
            : undefined;
    const qtdePessoas =
        state.qtdePessoas && state.qtdePessoas > 0
            ? state.qtdePessoas
            : quantidadeExtraida;

    const pendencias: string[] = [];

    if (!nomeReservado) {
        pendencias.push("nome");
    }

    if (!dataHora) {
        pendencias.push("data e horário desejado");
    }

    if (!qtdePessoas) {
        pendencias.push("quantidade de pessoas");
    }

    const dadosEncontrados = {
        ...(nomeReservado ? { nomeReservado } : {}),
        ...(dataHora ? { dataHora } : {}),
        ...(qtdePessoas ? { qtdePessoas } : {}),
    };

    if (pendencias.length > 0) {
        return {
            ...dadosEncontrados,
            sucesso: false,
            erro: undefined,
            resposta: `${Mensagens(MensagensType.ValidarDados)} ${pendencias.join(", ")}.`
        };
    }

    return {
        ...dadosEncontrados,
        sucesso: true,
        erro: undefined,
    };
}
