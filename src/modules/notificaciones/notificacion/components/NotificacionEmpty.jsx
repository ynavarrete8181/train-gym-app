import EmptyState from "../../../../components/common/EmptyState";

export default function NotificacionEmpty() {
  return (
    <EmptyState
      icon="bell-outline"
      title="Sin notificaciones"
      subtitle="Cuando tengas avisos importantes apareceran aqui."
    />
  );
}
