interface Reserva {
    id: number;
    nomeReservante: string;
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

export function removerReserva(id: number): boolean {
    const index = reservas.findIndex((r) => r.id === id);
    if (index !== -1) {
        reservas.splice(index, 1);
        return true;
    }
    return false;
}