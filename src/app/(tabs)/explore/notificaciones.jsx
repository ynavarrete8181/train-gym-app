import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../../components/common/AppHeader";
import { getScreenBottomPadding } from "../../../theme/layout";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import NotificacionCard from "../../../modules/notificaciones/notificacion/components/NotificacionCard";
import NotificacionEmpty from "../../../modules/notificaciones/notificacion/components/NotificacionEmpty";
import apiClient from "../../../api/apiClient";

export default function NotificacionesPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/app/notificaciones");
      setItems(data.data || []);
      setUnread(data.no_leidas || 0);
    } catch {
      setItems([]);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useRefreshOnFocus(scrollRef, loadNotifications);

  const handleRead = async (item) => {
    if (item.leida) return;

    setItems((prev) => (prev || []).map((row) => (
      row.destinatario_id === item.destinatario_id ? { ...row, leida: true, estado: "LEIDA" } : row
    )));
    setUnread((prev) => Math.max(0, prev - 1));

    try {
      await apiClient.post(`/app/notificaciones/${item.destinatario_id}/leer`);
    } catch {
      loadNotifications();
    }
  };

  if (loading && !items) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="bell-outline"
        title="Notificaciones"
        subtitle={unread > 0 ? `${unread} sin leer` : "Estas al dia."}
        showBack
        showSettings
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} tintColor={colors.primary} />}
      >
        {items?.length ? (
          <View style={styles.list}>
            {items.map((item) => (
              <NotificacionCard
                key={item.destinatario_id}
                item={item}
                onPress={() => handleRead(item)}
              />
            ))}
          </View>
        ) : (
          <NotificacionEmpty />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  list: {
    gap: 12,
  },
});
