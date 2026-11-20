import { AIMessage } from "@langchain/core/messages";
import { z } from "zod";
import { model } from "../../config/model.ts";
import type { RestauranteState } from "../state.ts";

const dadosReservaSchema = z.object({
    nomeReservado: z.string().nullable(),
    dataHora: z.string().nullable(),
    qtdePessoas: z.number().int().positive().nullable(),
    evidencias: z.object({
        nomeReservado: z.string().nullable(),
        dataHora: z.string().nullable(),
        qtdePessoas: z.string().nullable(),
    }),
});

const modeloValidacao = model.withStructuredOutput(dadosReservaSchema);

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

function contemHorario(texto: string): boolean {
    return /(?:\b(?:[01]?\d|2[0-3])(?::[0-5]\d|h(?:[0-5]\d)?)\b|(?:^|\s)(?:às?|as|das?)\s*(?:[01]?\d|2[0-3])\b|\b(?:1[0-2]|[1-9])\s*(?:da manhã|da tarde|da noite)\b)/i.test(texto);
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

    const dadosExtraidos = await modeloValidacao.invoke(`
        Você valida os dados necessários para uma reserva de restaurante.
        Analise somente as mensagens do usuário e os dados estruturados
        fornecidos abaixo.
        Extraia apenas informações explicitamente informadas e não infira um
        dado a partir de outro. Retorne null quando um dado não estiver
        presente. Para cada valor extraído das mensagens, evidencias deve
        conter um trecho literal da mensagem que comprove esse valor. Não use
        mensagens do assistente. Para dataHora, exija um horário explícito
        (por exemplo, 19h); uma data sem horário não atende ao requisito.
        Preserve o formato usado pelo usuário.

        Dados estruturados da reserva:
        ${JSON.stringify({
            nomeReservado: state.nomeReservado,
            dataHora: state.dataHora,
            qtdePessoas: state.qtdePessoas,
        })}

        Mensagens do usuário:
        ${JSON.stringify(mensagensDoUsuario)}
    `);

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
        contemHorario(dadosExtraidos.evidencias.dataHora)
            ? dadosExtraidos.dataHora?.trim()
            : undefined;
    const dataHora = state.dataHora?.trim() && contemHorario(state.dataHora)
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
        pendencias.push("horário desejado");
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
            messages: [
                ...state.messages,
                new AIMessage(
                    `Para continuar com a reserva, são obrigatórios: nome da pessoa, quantidade de pessoas e horário desejado. Ainda preciso de: ${pendencias.join(", ")}.`
                ),
            ],
        };
    }

    return {
        ...dadosEncontrados,
        sucesso: true,
        erro: undefined,
    };
}
