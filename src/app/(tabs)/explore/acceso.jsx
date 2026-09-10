import { useCallback, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import AppHeader from "../../../components/common/AppHeader";
import AppCard from "../../../components/common/AppCard";
import OutlineButton from "../../../components/common/OutlineButton";
import EmptyState from "../../../components/common/EmptyState";
import { getAccessCredential } from "../../../features/access/accessService";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { colors } from "../../../theme/colors";
import { getScreenBottomPadding } from "../../../theme/layout";
import { appStyles } from "../../../theme/theme";

export default function AccesoPage() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAccess = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAccessCredential());
    } catch (error) {
      console.error("Error loading access credential:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useRefreshOnFocus(scrollRef, loadAccess);

  if (loading && !data) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="qrcode-scan"
        title="Mi acceso"
        subtitle="Credencial temporal para ingresar a Revive."
        showBack
        showSettings
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAccess} tintColor={colors.primary} />}
      >
        {data ? (
          <>
            <AppCard style={styles.statusCard}>
              <View style={styles.statusTop}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="shield-check-outline" size={30} color={colors.success} />
                </View>
                <View style={styles.statusCopy}>
                  <Text style={styles.statusLabel}>Estado</Text>
                  <Text style={styles.statusTitle}>Acceso activo</Text>
                  <Text style={styles.statusMeta}>
                    Vence en {data.vence_en_minutos || 10} minutos
                  </Text>
                </View>
              </View>
            </AppCard>

            <AppCard style={styles.codeCard}>
              <View style={styles.codeFrame}>
                <View style={styles.qrBox}>
                  <QRCode
                    value={data.codigo_qr}
                    size={190}
                    color={colors.secondary}
                    backgroundColor={colors.white}
                  />
                </View>
                <Text selectable style={styles.codeText}>
                  {data.codigo_qr}
                </Text>
              </View>
              <Text style={styles.hint}>
                Muestra este QR en recepción. Es temporal, de un solo uso y se renueva al refrescar.
              </Text>
              <OutlineButton
                label="Renovar código"
                icon="refresh"
                onPress={loadAccess}
                style={styles.refreshButton}
              />
            </AppCard>

            <AppCard>
              <Text style={styles.sectionTitle}>Membresía</Text>
              <InfoRow label="Plan" value={data.membresia?.nombre || "Sin membresía vigente"} />
              <InfoRow label="Sede" value={data.membresia?.sede_nombre || "Sin sede asignada"} />
              <InfoRow label="Vence" value={data.membresia?.fecha_fin || "-"} />
            </AppCard>
          </>
        ) : (
          <EmptyState
            icon="alert-circle-outline"
            title="No se pudo generar el acceso"
            subtitle="Verifica tu membresía o intenta nuevamente."
          />
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
  statusCard: {
    borderColor: colors.success,
  },
  statusTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successSoft,
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    color: colors.textSoft,
    fontWeight: "800",
    fontSize: 12,
  },
  statusTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 2,
  },
  statusMeta: {
    color: colors.textSoft,
    fontWeight: "700",
    marginTop: 4,
  },
  codeCard: {
    gap: 14,
  },
  codeFrame: {
    minHeight: 288,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 14,
    backgroundColor: colors.surfaceSoft,
  },
  qrBox: {
    width: 214,
    height: 214,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  codeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  hint: {
    color: colors.textSoft,
    fontWeight: "700",
    lineHeight: 20,
  },
  refreshButton: {
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 16,
  },
  infoLabel: {
    color: colors.textSoft,
    fontWeight: "800",
  },
  infoValue: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
    textAlign: "right",
  },
});
