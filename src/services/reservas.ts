import type { ResultSetHeader } from "mysql2";
import { getDatabasePool } from "../config/database.ts";

interface Reserva {
    id: number;
    nomeReservante: string;
    horarioReserva: string;
    numeroPessoas: number;
}

interface HorarioNormalizado {
    data?: string;
    hora: string;
}

let reservas: Reserva[] = [];

const meses: Record<string, number> = {
    janeiro: 1,
    fevereiro: 2,
    marco: 3,
    abril: 4,
    maio: 5,
    junho: 6,
    julho: 7,
    agosto: 8,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
};

function normalizarTexto(valor: string): string {
    return valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function formatarData(ano: number, mes: number, dia: number): string | undefined {
    const data = new Date(Date.UTC(ano, mes - 1, dia));

    if (
        data.getUTCFullYear() !== ano ||
        data.getUTCMonth() !== mes - 1 ||
        data.getUTCDate() !== dia
    ) {
        return undefined;
    }

    return `${ano.toString().padStart(4, "0")}-${mes
        .toString()
        .padStart(2, "0")}-${dia.toString().padStart(2, "0")}`;
}

function normalizarData(texto: string): string | undefined {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();

    if (/\bdepois de amanha\b/.test(texto)) {
        const data = new Date(anoAtual, hoje.getMonth(), hoje.getDate() + 2);
        return formatarData(data.getFullYear(), data.getMonth() + 1, data.getDate());
    }

    if (/\bamanha\b/.test(texto)) {
        const data = new Date(anoAtual, hoje.getMonth(), hoje.getDate() + 1);
        return formatarData(data.getFullYear(), data.getMonth() + 1, data.getDate());
    }

    if (/\bhoje\b/.test(texto)) {
        return formatarData(anoAtual, hoje.getMonth() + 1, hoje.getDate());
    }

    const dataIso = texto.match(
        /\b(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:\b|t)/
    );
    if (dataIso) {
        return formatarData(
            Number(dataIso[1]),
            Number(dataIso[2]),
            Number(dataIso[3])
        );
    }

    const dataNumerica = texto.match(
        /\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?\b/
    );
    if (dataNumerica) {
        const primeiro = Number(dataNumerica[1]);
        const segundo = Number(dataNumerica[2]);
        const anoInformado = dataNumerica[3]
            ? Number(dataNumerica[3])
            : anoAtual;
        const ano = anoInformado < 100 ? 2000 + anoInformado : anoInformado;

        if (primeiro > 12) {
            return formatarData(ano, segundo, primeiro);
        }

        if (segundo > 12) {
            return formatarData(ano, primeiro, segundo);
        }

        return formatarData(ano, segundo, primeiro);
    }

    const dataPorExtenso = texto.match(
        /\b(\d{1,2})\s+de?\s+(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)(?:\s+de?\s+(\d{4}))?\b/
    );
    if (dataPorExtenso) {
        const dia = dataPorExtenso[1];
        const nomeMes = dataPorExtenso[2];
        if (!dia || !nomeMes) {
            return undefined;
        }

        const mes = meses[nomeMes];
        if (!mes) {
            return undefined;
        }

        return formatarData(
            dataPorExtenso[3] ? Number(dataPorExtenso[3]) : anoAtual,
            mes,
            Number(dia)
        );
    }

    return undefined;
}

function normalizarHora(texto: string): string | undefined {
    const horario24h = texto.match(
        /(?:^|\s|t)([01]?\d|2[0-3])(?::([0-5]\d)|h([0-5]\d)?)\b/i
    );

    if (horario24h) {
        return `${Number(horario24h[1]).toString().padStart(2, "0")}:${(
            horario24h[2] ?? horario24h[3] ?? "00"
        ).padStart(2, "0")}`;
    }

    const horarioComPeriodo = texto.match(
        /\b(1[0-2]|[1-9])\s*(?:da\s*|de\s*)?(manha|tarde|noite)\b/
    );
    if (horarioComPeriodo) {
        let hora = Number(horarioComPeriodo[1]);
        const periodo = horarioComPeriodo[2];

        if (periodo === "noite" && hora < 12) {
            hora += 12;
        } else if (periodo === "tarde" && hora < 12) {
            hora += 12;
        } else if (periodo === "manha" && hora === 12) {
            hora = 0;
        }

        return `${hora.toString().padStart(2, "0")}:00`;
    }

    const horarioContextual = texto.match(
        /(?:^|\s)(?:as?|das?)\s*(\d{1,2})\b/
    );
    if (horarioContextual) {
        const hora = Number(horarioContextual[1]);
        if (hora <= 23) {
            return `${hora.toString().padStart(2, "0")}:00`;
        }
    }

    return undefined;
}

function normalizarHorarioReserva(valor: string): HorarioNormalizado | undefined {
    const texto = normalizarTexto(valor);
    const hora = normalizarHora(texto);

    if (!hora) {
        return undefined;
    }

    const data = normalizarData(texto);
    return data ? { data, hora } : { hora };
}

export async function adicionarReserva(reserva: Omit<Reserva, "id">): Promise<Reserva> {
    const query = `
        INSERT INTO Reservas (NomeReservado, QtdDePessoas, DataHora)
        VALUES (?, ?, ?)
    `;

    const horaFormatada = normalizarHorarioReserva(reserva.horarioReserva);
    if (!horaFormatada?.data) {
        throw new Error(
            `Não foi possível interpretar a data e o horário da reserva: "${reserva.horarioReserva}".`
        );
    }

    const dataHora = `${horaFormatada.data} ${horaFormatada.hora}:00`;
    const [resultado] = await getDatabasePool().execute<ResultSetHeader>(query, [
        reserva.nomeReservante,
        reserva.numeroPessoas,
        dataHora,
    ]);

    const novaReserva: Reserva = {
        id: resultado.insertId,
        ...reserva
    };

    return novaReserva;
}

export async function removerReserva(id: number): Promise<boolean> {
    const query = `
        DELETE FROM Reservas WHERE Id = ?
    `;
    const [resultado] = await getDatabasePool().execute<ResultSetHeader>(query, [
        id
    ]);

    return resultado.affectedRows > 0;
}

export function checkarDisponibilidade(
    horario: string
): boolean {
    const horarioSolicitado = normalizarHorarioReserva(horario);

    if (!horarioSolicitado) {
        throw new Error(`Não foi possível interpretar o horário: "${horario}".`);
    }

    return !reservas.some((reserva) => {
        const horarioExistente = normalizarHorarioReserva(reserva.horarioReserva);
 
        if (!horarioExistente || horarioExistente.hora !== horarioSolicitado.hora) {
            return false;
        }

        return (
            !horarioExistente.data ||
            !horarioSolicitado.data ||
            horarioExistente.data === horarioSolicitado.data
        );
    });
}