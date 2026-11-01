import apiClient from "../../../api/apiClient";

// Catálogo de lectura para deportistas. No utiliza la API administrativa de inventario.
export async function obtenerProductosTienda(sedeId = null) {
  const params = sedeId ? { sede_id: sedeId } : undefined;
  const { data } = await apiClient.get("/app/tienda/productos", { params });
  const productos = data?.datos;
  return Array.isArray(productos) ? productos : [];
}
