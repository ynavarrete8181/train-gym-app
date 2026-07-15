import apiClient, { normalizeApiError } from "../../api/apiClient";

export const getFichas = async () => {
  try {
    const response = await apiClient.get("/app/fichas");
    return response.data.data;
  } catch (error) {
    const errorMsg = normalizeApiError(error);
    console.error("Error fetching fichas:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getRMs = async () => {
  try {
    const response = await apiClient.get("/app/rms");
    return response.data.data;
  } catch (error) {
    const errorMsg = normalizeApiError(error);
    console.error("Error fetching RMs:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getFacturas = async () => {
  try {
    const response = await apiClient.get("/app/facturas");
    return response.data.data;
  } catch (error) {
    const errorMsg = normalizeApiError(error);
    console.error("Error fetching facturas:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getEvaluaciones = async () => {
  try {
    const response = await apiClient.get("/app/evaluaciones");
    return response.data.data;
  } catch (error) {
    const errorMsg = normalizeApiError(error);
    console.error("Error fetching evaluaciones:", errorMsg);
    throw new Error(errorMsg);
  }
};

export const getPlanes = async () => {
  try {
    const response = await apiClient.get("/app/planes");
    return response.data.data;
  } catch (error) {
    const errorMsg = normalizeApiError(error);
    console.error("Error fetching planes:", errorMsg);
    throw new Error(errorMsg);
  }
};
