import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppBadge from "../../../components/common/AppBadge";
import AppButton from "../../../components/common/AppButton";
import AppCard from "../../../components/common/AppCard";
import AppHeader from "../../../components/common/AppHeader";
import AppModal from "../../../components/common/AppModal";
import AppSegmentedSelector from "../../../components/common/AppSegmentedSelector";
import EmptyState from "../../../components/common/EmptyState";
import OutlineButton from "../../../components/common/OutlineButton";
import {
  getAvailability,
  getMyReservations,
  getReservationMemberships,
  createReservation,
  cancelReservation,
} from "../../../features/reservations/reservationService";
import { useRefreshOnFocus } from "../../../hooks/useRefreshOnFocus";
import { colors } from "../../../theme/colors";
import { getScreenBottomPadding } from "../../../theme/layout";
import { appStyles } from "../../../theme/theme";

const buildDays = () => {
  const formatter = new Intl.DateTimeFormat("es-EC", { weekday: "short", day: "2-digit", month: "short" });
  const toLocalValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return Array.from({ length: 7 }, (_item, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const value = toLocalValue(date);
    return {
      value,
      label: index === 0 ? "Hoy" : formatter.format(date).replace(".", ""),
    };
  });
};

const formatLongDate = (value) => {
  if (!value) return "la fecha seleccionada";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
};

const formatTime = (value) => String(value || "").slice(0, 5);

export default function ReservasPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef(null);
  const days = useMemo(() => buildDays(), []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("reservar");
  const [scrollToTopTick, setScrollToTopTick] = useState(0);
  const [pendingReservation, setPendingReservation] = useState(null);

  const tabOptions = useMemo(() => ([
    { value: "reservar", label: "Reservar" },
    { value: "mis-reservas", label: reservations.length > 0 ? `Mis reservas (${reservations.length})` : "Mis reservas" },
  ]), [reservations.length]);

  const selectedMembership = useMemo(() => {
    return memberships.find((item) => item.socio_membresia_id === selectedMembershipId) || null;
  }, [memberships, selectedMembershipId]);

  const loadData = useCallback(async (date = selectedDate, membershipOverride = null, options = {}) => {
    setLoading(true);
    setMessage("");
    try {
      const [membershipItems, reservationItems] = await Promise.all([
        getReservationMemberships({ fecha: date || undefined }),
        getMyReservations(),
      ]);

      const preferredMembershipId = options.resetSelection
        ? null
        : membershipOverride?.socio_membresia_id || selectedMembershipId;
      const activeMembership = membershipItems.find((item) => item.socio_membresia_id === preferredMembershipId)
        || null;
      const availableItems = date && activeMembership
        ? await getAvailability({ fecha: date, sedeId: activeMembership.sede_id })
        : [];

      setMemberships(membershipItems);
      setSelectedMembershipId(activeMembership?.socio_membresia_id || null);
      setAvailability(availableItems);
      setReservations(reservationItems);
    } catch (error) {
      console.error("Error loading reservations:", error);
      setMemberships([]);
      setAvailability([]);
      setMessage("No se pudo cargar la disponibilidad.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedMembershipId]);

  const resetBookingFlow = useCallback(() => {
    setActiveTab("reservar");
    setSelectedDate(null);
    setSelectedMembershipId(null);
    setAvailability([]);
    setPendingReservation(null);
    loadData(null, null, { resetSelection: true });
  }, [loadData]);

  useRefreshOnFocus(scrollRef, resetBookingFlow);

  useEffect(() => {
    if (scrollToTopTick > 0) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [scrollToTopTick]);

  const groupedAvailability = useMemo(() => {
    return availability.reduce((groups, item) => {
      const key = item.sede_nombre || "Sede";
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {});
  }, [availability]);

  const handleReserve = (item) => {
    if (item.disponibles <= 0 || savingId) return;
    if (!selectedMembership) {
      setMessage("Selecciona una membresía o sede antes de reservar.");
      return;
    }

    setMessage("");
    setPendingReservation(item);
  };

  const handleCloseReserveModal = () => {
    if (savingId) return;
    setPendingReservation(null);
  };

  const handleConfirmReserve = async () => {
    if (!pendingReservation || !selectedMembership || savingId) return;

    setSavingId(pendingReservation.id);
    setMessage("");
    try {
      await createReservation(pendingReservation, selectedMembership.socio_membresia_id);
      setPendingReservation(null);
      setMessage("Reserva confirmada correctamente.");
      setSelectedDate(null);
      setSelectedMembershipId(null);
      setAvailability([]);
      setActiveTab("mis-reservas");
      await loadData(null, null, { resetSelection: true });
      setScrollToTopTick((value) => value + 1);
    } catch (error) {
      console.error("Error creating reservation:", error);
      setMessage(error?.response?.data?.message || "No se pudo confirmar la reserva.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSelectMembership = (item) => {
    setSelectedMembershipId(item.socio_membresia_id);
    setMessage("");
    if (selectedDate) {
      loadData(selectedDate, item);
      return;
    }
    setAvailability([]);
  };

  const handleChangeTab = (value) => {
    setActiveTab(value);
    setMessage("");
    if (value === "reservar") {
      setSelectedDate(null);
      setSelectedMembershipId(null);
      setAvailability([]);
      loadData(null, null, { resetSelection: true });
      setScrollToTopTick((tick) => tick + 1);
    }
  };

  const handleCancel = (item) => {
    if (cancelingId) return;

    Alert.alert(
      "Cancelar reserva",
      `¿Deseas cancelar tu reserva del ${item.fecha} a las ${String(item.hora_inicio || "").slice(0, 5)}?`,
      [
        { text: "Cerrar", style: "cancel" },
        {
          text: "Cancelar reserva",
          style: "destructive",
          onPress: async () => {
            setCancelingId(item.id);
            setMessage("");
            try {
              await cancelReservation(item.id);
              setMessage("Reserva cancelada correctamente.");
              await loadData();
            } catch (error) {
              console.error("Error canceling reservation:", error);
              setMessage(error?.response?.data?.message || "No se pudo cancelar la reserva.");
            } finally {
              setCancelingId(null);
            }
          },
        },
      ]
    );
  };

  if (loading && memberships.length === 0 && reservations.length === 0) {
    return (
      <View style={[appStyles.screen, styles.center]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  const pendingPlace = selectedMembership?.sede_nombre || pendingReservation?.sede_nombre || "Revive";
  const pendingDate = formatLongDate(selectedDate);
  const pendingStart = formatTime(pendingReservation?.hora_inicio);
  const pendingEnd = formatTime(pendingReservation?.hora_fin);
  const confirmingReservation = savingId === pendingReservation?.id;

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="calendar-check-outline"
        title="Reservas"
        subtitle="Elige dónde entrenar, fecha y turno."
        showBack
        showSettings
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollArea}
        contentContainerStyle={[styles.content, { paddingBottom: getScreenBottomPadding(insets.bottom) }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadData()} tintColor={colors.primary} />}
      >
        <AppCard style={styles.tabsCard}>
          <AppSegmentedSelector
            options={tabOptions}
            value={activeTab}
            onChange={handleChangeTab}
            horizontal={false}
            columns={2}
            compact
          />
        </AppCard>

        {activeTab === "reservar" ? (
          <>
            <AppCard style={styles.bookingCard}>
              <View style={styles.flowSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>¿Dónde iré a entrenar?</Text>
                  {selectedMembership ? (
                    <AppBadge tone="warning">
                      {selectedMembership.es_pase_diario ? "Pase diario" : selectedMembership.membresia_nombre}
                    </AppBadge>
                  ) : null}
                </View>

                {memberships.length === 0 ? (
                  <View style={styles.inlineEmpty}>
                    <MaterialCommunityIcons name="card-account-details-outline" size={24} color={colors.textSoft} />
                    <Text style={styles.inlineEmptyText}>No tienes membresías vigentes para esta fecha.</Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membershipRow}>
                    {memberships.map((item) => {
                      const active = item.socio_membresia_id === selectedMembershipId;
                      return (
                        <TouchableOpacity
                          key={item.socio_membresia_id}
                          activeOpacity={0.85}
                          onPress={() => handleSelectMembership(item)}
                          style={[styles.membershipChip, active && styles.membershipChipActive]}
                        >
                          <View style={styles.membershipChipHeader}>
                            <MaterialCommunityIcons
                              name={item.sede_id ? "map-marker-radius-outline" : "map-marker-multiple-outline"}
                              size={18}
                              color={active ? colors.primaryStrong : colors.textSoft}
                            />
                            <Text style={[styles.membershipSede, active && styles.membershipTextActive]}>
                              {item.sede_nombre}
                            </Text>
                          </View>
                          <Text style={[styles.membershipPlan, active && styles.membershipTextActive]} numberOfLines={1}>
                            {item.membresia_nombre}
                          </Text>
                          <Text style={styles.membershipDate}>hasta {item.fecha_fin}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              {selectedMembership ? (
                <View style={styles.flowSection}>
                  <Text style={styles.sectionTitle}>Elige la fecha</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
                    {days.map((day) => {
                      const active = day.value === selectedDate;
                      return (
                        <TouchableOpacity
                          key={day.value}
                          activeOpacity={0.85}
                          onPress={() => {
                            setSelectedDate(day.value);
                            loadData(day.value);
                          }}
                          style={[styles.dayButton, active && styles.dayButtonActive]}
                        >
                          <Text style={[styles.dayLabel, active && styles.dayLabelActive]}>{day.label}</Text>
                          <Text style={[styles.dayValue, active && styles.dayLabelActive]}>{day.value.slice(5)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {message ? (
                <View style={styles.messageInline}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              ) : null}

              <View style={styles.turnosSection}>
                {!selectedMembership ? (
                  <EmptyState
                    icon="map-marker-radius-outline"
                    title="Elige dónde entrenar"
                    subtitle="Selecciona primero Home, Xpadel u otra sede disponible."
                  />
                ) : !selectedDate ? (
                  <EmptyState
                    icon="calendar-search-outline"
                    title="Elige una fecha"
                    subtitle="Toca el día que quieres reservar para cargar los turnos."
                  />
                ) : loading ? (
                  <View style={styles.loadingCard}>
                    <ActivityIndicator animating color={colors.primary} />
                    <Text style={styles.loadingText}>Cargando turnos disponibles...</Text>
                  </View>
                ) : Object.keys(groupedAvailability).length === 0 ? (
                  <EmptyState
                    icon="calendar-remove-outline"
                    title={memberships.length === 0 ? "Sin membresía activa" : "Sin cupos disponibles"}
                    subtitle={memberships.length === 0
                      ? "Necesitas una membresía vigente para reservar en esta fecha."
                      : "No hay horarios abiertos para la sede y fecha seleccionadas."}
                  />
                ) : (
                  Object.entries(groupedAvailability).map(([sede, items]) => (
                    <View key={sede} style={styles.availabilityGroup}>
                      <View style={styles.sedeHeader}>
                        <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color={colors.primaryStrong} />
                        <Text style={styles.sedeTitle}>{sede}</Text>
                      </View>

                      {items.map((item) => {
                        const full = item.disponibles <= 0;
                        return (
                          <View key={item.id} style={[styles.slotCard, full && styles.slotCardFull]}>
                            <View style={styles.slotTop}>
                              <View style={styles.timeBox}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primaryStrong} />
                                <View>
                                  <Text style={styles.timeText}>{String(item.hora_inicio || "").slice(0, 5)}</Text>
                                  <Text style={styles.timeMeta}>hasta {String(item.hora_fin || "").slice(0, 5)}</Text>
                                </View>
                              </View>
                              <AppBadge tone={full ? "danger" : "success"}>
                                {full ? "Sin cupos" : `${item.disponibles} cupos`}
                              </AppBadge>
                            </View>

                            <View style={styles.slotBody}>
                              <Text style={styles.rowTitle}>{item.servicio_nombre}</Text>
                              <View style={styles.slotMetaRow}>
                                <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.textSoft} />
                                <Text style={styles.rowMeta}>{item.disponibles} de {item.capacidad} cupos disponibles</Text>
                              </View>
                            </View>

                            <View style={styles.slotFooter}>
                              <Text style={styles.slotHint}>
                                {selectedMembership?.sede_nombre || sede}
                              </Text>
                              <OutlineButton
                                label={savingId === item.id ? "..." : full ? "Lleno" : "Reservar"}
                                icon={full ? "lock-outline" : "check"}
                                disabled={full || savingId === item.id}
                                onPress={() => handleReserve(item)}
                                style={styles.reserveButton}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  ))
                )}
              </View>
            </AppCard>
          </>
        ) : (
          <>
            {message ? (
              <AppCard style={styles.messageCard}>
                <Text style={styles.messageText}>{message}</Text>
              </AppCard>
            ) : null}

            {reservations.length === 0 ? (
              <EmptyState
                icon="calendar-search-outline"
                title="Aún no tienes reservas"
                subtitle="Cuando confirmes un cupo, aparecerá aquí para consultarlo o cancelarlo."
              />
            ) : (
              <View style={{ gap: 16, paddingBottom: 24, paddingHorizontal: 4 }}>
                {[...reservations].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((item) => {
                  const [year, month, day] = (item.fecha || "").split('-');
                  const mesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                  const mesCorto = mesNombres[parseInt(month, 10) - 1] || "";
                  
                  const dateObj = new Date(`${year}-${month}-${day}T12:00:00Z`);
                  const diasCorto = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
                  const diaSemanaStr = diasCorto[dateObj.getUTCDay()] || "";

                  return (
                    <AppCard key={item.id} style={styles.reservationCard}>
                      <View style={styles.resCardMain}>
                        {/* Bloque Izquierdo (Fecha) */}
                        <View style={styles.dateBlock}>
                          <Text style={styles.dateWeekDay}>{diaSemanaStr}</Text>
                          <Text style={styles.dateNumber}>{day}</Text>
                          <Text style={styles.dateMonth}>{mesCorto.toUpperCase()}</Text>
                        </View>
                        
                        {/* Bloque Derecho (Info) */}
                        <View style={styles.infoBlock}>
                          <View style={styles.titleRow}>
                            <Text style={styles.rowTitle} numberOfLines={1}>{item.servicio_nombre || "Reserva Revive"}</Text>
                            <AppBadge tone={item.estado === "ASISTIO" ? "success" : item.estado === "NO_ASISTIO" || item.estado === "CANCELADA" ? "danger" : "warning"}>
                              {item.estado_nombre || item.estado}
                            </AppBadge>
                          </View>
                          
                          <Text style={styles.sedeText}>{item.sede_nombre}</Text>
                          
                          <View style={styles.tagsRow}>
                            <View style={styles.infoTag}>
                              <Text style={styles.tagLabel}>INICIO</Text>
                              <Text style={styles.tagValue}>{String(item.hora_inicio || "").slice(0, 5)}</Text>
                            </View>
                            <View style={styles.infoTag}>
                              <Text style={styles.tagLabel}>FIN</Text>
                              <Text style={styles.tagValue}>{String(item.hora_fin || "").slice(0, 5)}</Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Footer Actions */}
                      <View style={styles.actionFooter}>
                        {item.fecha === new Date().toLocaleDateString("en-CA", {timeZone: "America/Guayaquil"}) || 
                         item.fecha === new Date().toISOString().split('T')[0] ? (
                          <TouchableOpacity 
                            style={styles.checkinBtn} 
                            activeOpacity={0.8}
                            onPress={() => router.push("/(tabs)/explore/acceso")}
                          >
                            <MaterialCommunityIcons name="qrcode-scan" size={16} color={colors.primaryStrong || "#B45309"} />
                            <Text style={styles.checkinText}>CHECK-IN</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={[styles.checkinBtn, { borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }]}>
                            <MaterialCommunityIcons name="clock-outline" size={16} color="#94A3B8" />
                            <Text style={[styles.checkinText, { color: "#94A3B8", fontSize: 11 }]}>
                              HABILITADO EL {day} {mesCorto.toUpperCase()}
                            </Text>
                          </View>
                        )}

                        <TouchableOpacity 
                          style={styles.cancelIconBtn} 
                          disabled={cancelingId === item.id}
                          onPress={() => handleCancel(item)}
                          activeOpacity={0.7}
                        >
                          {cancelingId === item.id ? (
                            <ActivityIndicator size={20} color="#EF4444" />
                          ) : (
                            <MaterialCommunityIcons 
                              name="close-thick" 
                              size={20} 
                              color="#EF4444" 
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    </AppCard>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <AppModal
        visible={Boolean(pendingReservation)}
        title="Confirmar reserva"
        subtitle="Revisa el lugar, fecha y hora antes de guardar."
        icon="calendar-check-outline"
        onClose={handleCloseReserveModal}
        footer={(
          <View style={styles.confirmFooter}>
            <AppButton
              mode="outlined"
              icon="close"
              disabled={Boolean(savingId)}
              onPress={handleCloseReserveModal}
              style={styles.confirmButton}
              labelStyle={styles.cancelActionLabel}
            >
              Cancelar
            </AppButton>
            <AppButton
              mode="contained"
              icon="check"
              loading={confirmingReservation}
              disabled={Boolean(savingId)}
              onPress={handleConfirmReserve}
              style={styles.confirmButton}
            >
              Reservar
            </AppButton>
          </View>
        )}
      >
        <View style={styles.confirmHero}>
          <View style={styles.confirmIconBox}>
            <MaterialCommunityIcons name="arm-flex-outline" size={28} color={colors.primaryStrong} />
          </View>
          <Text style={styles.confirmTitle}>¡Listo para entrenar!</Text>
          <Text style={styles.confirmText}>
            Iré a entrenar en {pendingPlace} el {pendingDate} a las {pendingStart}.
          </Text>
        </View>

        <View style={styles.confirmDetails}>
          <View style={styles.confirmDetailRow}>
            <MaterialCommunityIcons name="map-marker-radius-outline" size={20} color={colors.primaryStrong} />
            <View style={styles.confirmDetailCopy}>
              <Text style={styles.confirmDetailLabel}>Lugar</Text>
              <Text style={styles.confirmDetailValue}>{pendingPlace}</Text>
            </View>
          </View>
          <View style={styles.confirmDetailRow}>
            <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.primaryStrong} />
            <View style={styles.confirmDetailCopy}>
              <Text style={styles.confirmDetailLabel}>Fecha</Text>
              <Text style={styles.confirmDetailValue}>{pendingDate}</Text>
            </View>
          </View>
          <View style={styles.confirmDetailRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primaryStrong} />
            <View style={styles.confirmDetailCopy}>
              <Text style={styles.confirmDetailLabel}>Turno</Text>
              <Text style={styles.confirmDetailValue}>{pendingStart} - {pendingEnd}</Text>
            </View>
          </View>
        </View>
      </AppModal>
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  tabsCard: {
    padding: 10,
  },
  bookingCard: {
    gap: 16,
    padding: 14,
  },
  flowSection: {
    gap: 12,
  },
  membershipCard: {
    gap: 12,
  },
  inlineEmpty: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  inlineEmptyText: {
    color: colors.textSoft,
    fontWeight: "800",
    textAlign: "center",
  },
  membershipRow: {
    gap: 10,
    paddingRight: 2,
  },
  membershipChip: {
    width: 190,
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 6,
  },
  membershipChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryPale,
  },
  membershipChipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  membershipSede: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
    fontSize: 13,
  },
  membershipTextActive: {
    color: colors.primaryStrong,
  },
  membershipPlan: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 14,
  },
  membershipDate: {
    color: colors.textSoft,
    fontWeight: "800",
    fontSize: 11,
  },
  nextCard: {
    gap: 14,
  },
  reservationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderLeftWidth: 6,
    borderLeftColor: colors.primary,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resCardMain: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  dateBlock: {
    backgroundColor: colors.primarySoft || "#FEF3C7",
    borderRadius: 12,
    width: 60,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  dateWeekDay: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primaryStrong || "#B45309",
    marginBottom: -4,
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryStrong || "#B45309",
  },
  infoBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  rowTitle: {
    color: "#1E293B",
    fontWeight: "900",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  sedeText: {
    color: colors.textSoft,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textLight,
    marginBottom: 2,
  },
  tagValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  actionFooter: {
    flexDirection: "row",
    gap: 12,
  },
  checkinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primaryStrong || "#B45309",
    borderRadius: 12,
    height: 44,
  },
  checkinText: {
    color: colors.primaryStrong || "#B45309",
    fontWeight: "900",
    fontSize: 14,
  },
  cancelIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  rowMeta: {
    color: colors.textSoft,
    fontWeight: "700",
    fontSize: 12,
  },
  daysCard: {
    gap: 12,
  },
  daysRow: {
    gap: 10,
  },
  dayButton: {
    width: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  dayButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryPale,
  },
  dayLabel: {
    color: colors.text,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  dayValue: {
    color: colors.textSoft,
    fontWeight: "800",
    marginTop: 4,
  },
  dayLabelActive: {
    color: colors.primaryStrong,
  },
  messageCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryPale,
  },
  messageInline: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    backgroundColor: colors.primaryPale,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageText: {
    color: colors.primaryStrong,
    fontWeight: "900",
  },
  loadingCard: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: colors.textSoft,
    fontWeight: "800",
  },
  availabilityCard: {
    gap: 12,
  },
  turnosSection: {
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  availabilityGroup: {
    gap: 12,
  },
  sedeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sedeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  slotCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  slotCardFull: {
    opacity: 0.72,
    backgroundColor: colors.surfaceSoft,
  },
  slotTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  timeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.primaryPale,
  },
  timeText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
  },
  timeMeta: {
    color: colors.textSoft,
    fontWeight: "800",
    fontSize: 11,
  },
  slotBody: {
    gap: 6,
  },
  slotMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  slotFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  slotHint: {
    flex: 1,
    color: colors.textSoft,
    fontWeight: "800",
    fontSize: 12,
  },
  reserveButton: {
    minWidth: 112,
  },
  confirmHero: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    padding: 16,
    gap: 8,
  },
  confirmIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryPale,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  confirmText: {
    color: colors.textSoft,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    textAlign: "center",
  },
  confirmDetails: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  confirmDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  confirmDetailCopy: {
    flex: 1,
    gap: 2,
  },
  confirmDetailLabel: {
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  confirmDetailValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  confirmFooter: {
    flexDirection: "row",
    gap: 10,
  },
  confirmButton: {
    flex: 1,
  },
  cancelActionLabel: {
    color: colors.danger,
  },
});
