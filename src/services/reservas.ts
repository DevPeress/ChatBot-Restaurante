interface Reserva {
    id: number;
    nomeReservante: string;
    dataReserva: string;
    horarioReserva: string;
    numeroPessoas: number;
}

let reservas: Reserva[] = [];

export function adicionarReserva(reserva: Omit<Reserva, "id">): Reserva {
    const novaReserva: Reserva = {
        id: reservas.length + 1,
        ...reserva,
    };
    reservas.push(novaReserva);
    return novaReserva;
}
