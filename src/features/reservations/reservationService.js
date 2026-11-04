import apiClient from "../../api/apiClient";

export const getAvailability = async ({ fecha, sedeId, servicioId } = {}) => {
  const { data } = await apiClient.get("/app/reservas/disponibilidad", {
    params: {
      fecha,
      sede_id: sedeId || undefined,
      servicio_id: servicioId || undefined,
    },
  });

  return Array.isArray(data) ? data : [];
};

export const getReservationMemberships = async ({ fecha } = {}) => {
  const { data } = await apiClient.get("/app/reservas/membresias", {
    params: { fecha },
  });

  return Array.isArray(data) ? data : [];
};

export const getMyReservations = async () => {
  const { data } = await apiClient.get("/app/reservas");

  return Array.isArray(data) ? data : [];
};

export const createReservation = async (horario, socioMembresiaId) => {
  const { data } = await apiClient.post("/app/reservas", {
    horario_id: horario.id,
    fecha: horario.fecha,
    socio_membresia_id: socioMembresiaId || undefined,
  });

  return data.data;
};

export const cancelReservation = async (reservationId, motivo = "Cancelada desde app") => {
  const { data } = await apiClient.post(`/app/reservas/${reservationId}/cancelar`, {
    motivo,
  });

  return data.data;
};
