import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, StyleSheet, Modal, TouchableOpacity, Image, Platform, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, ActivityIndicator, Searchbar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import { useAuth } from "../../../context/AuthContext";
import { getFacturas } from "../../../features/explore/exploreService";
import { appStyles } from "../../../theme/theme";
import { colors } from "../../../theme/colors";
import { getBottomSafePadding, getScreenBottomPadding, getScreenTopPadding } from "../../../theme/layout";
import AppCard from "../../../components/common/AppCard";
import AppHeader from "../../../components/common/AppHeader";
import WebSemanticButton from "../../../components/common/WebSemanticButton";

export default function FacturasPage() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const { openId } = useLocalSearchParams();
  const [facturas, setFacturas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFactura, setSelectedFactura] = useState(null);

  // PDF Preview and Sharing States
  const [pdfUri, setPdfUri] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const loadFacturas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFacturas();
      setFacturas(data);
      return data;
    } catch (error) {
      console.error("Error loading invoices:", error);
      setFacturas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrint = async (factura) => {
    if (!factura) return;
    setPdfUri(null);
    setGeneratingPdf(true);
    try {
      const userFullName = factura.cliente_nombre || user?.name || "Cliente Revive";
      
      const formatDateSpanish = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const months = [
          "enero", "febrero", "marzo", "abril", "mayo", "junio",
          "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} - ${hours}:${minutes}`;
      };

      const getMetodoPagoText = (forma) => {
        if (!forma) return "Otros";
        if (forma.toUpperCase() === "PENDIENTE") return "POR PAGAR";
        switch (forma.toUpperCase()) {
          case "TARJETA":
            return "TARJETA";
          case "EFECTIVO":
            return "EFECTIVO";
          case "TRANSFERENCIA":
            return "TRANSFERENCIA";
          default:
            return forma.toUpperCase();
        }
      };
      const estadoPagoTexto = (factura.estado_pago || (factura.estado === 1 ? "PAGADO" : "PENDIENTE")).toUpperCase();

      const itemsHtml = (factura.detalles || [])
        .map(
          (detalle) => `
          <tr>
            <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #0F172A; text-align: left; border-bottom: 1px solid #F1F5F9;">
              ${detalle.producto_nombre || "Producto"}
              ${detalle.producto_marca ? `<br/><span style="font-size: 11px; font-weight: normal; color: #64748B;">Marca: ${detalle.producto_marca}</span>` : ""}
            </td>
            <td style="padding: 8px 0; font-size: 13px; color: #0F172A; text-align: center; border-bottom: 1px solid #F1F5F9;">
              ${parseFloat(detalle.cantidad).toFixed(0)}
            </td>
            <td style="padding: 8px 0; font-size: 13px; color: #0F172A; text-align: right; border-bottom: 1px solid #F1F5F9;">
              $${parseFloat(detalle.subtotal).toFixed(2).replace(".", ",")}
            </td>
          </tr>
        `
        )
        .join("");

      const formattedTotal = "$" + parseFloat(factura.total).toFixed(2).replace(".", ",");

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Comprobante de Pago</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0F172A;
              padding: 10px;
              max-width: 480px;
              margin: 0 auto;
              background-color: #fff;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #0F172A;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .brand-name {
              font-size: 22px;
              font-weight: 900;
              color: #0F172A;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .header-meta {
              margin-top: 5px;
              font-size: 12px;
              color: #475569;
            }
            .meta-item {
              margin-right: 12px;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }
            .receipt-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .receipt-table td {
              padding: 6px 0;
              font-size: 13px;
              vertical-align: top;
              line-height: 1.4;
            }
            .label-col {
              text-align: left;
              color: #64748B;
              font-weight: 500;
              width: 40%;
            }
            .value-col {
              text-align: right;
              color: #0F172A;
              font-weight: 700;
              width: 60%;
            }
            .divider {
              height: 1px;
              background-color: #E2E8F0;
              margin-top: 10px;
              margin-bottom: 10px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
              border-top: 1px dashed #E2E8F0;
              padding-top: 15px;
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 50px; vertical-align: middle;">
                <svg width="45" height="45" viewBox="0 0 100 100" style="display: block;">
                  <circle cx="50" cy="50" r="46" fill="#000000" />
                  <circle cx="65" cy="32" r="7" fill="#F2B100" />
                  <path d="M 28 68 C 35 48, 55 42, 68 45" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" />
                  <path d="M 38 68 C 45 52, 60 55, 60 70" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" />
                  <path d="M 28 68 C 30 68, 55 60, 68 32" stroke="#F2B100" stroke-width="4" stroke-linecap="round" fill="none" />
                </svg>
              </td>
              <td style="vertical-align: middle; padding-left: 12px; text-align: left;">
                <div class="brand-name">REVIVE SPORTS</div>
                <div class="header-meta">
                  <span class="meta-item">
                    <span style="font-weight: bold; color: #0F172A;">SEDE:</span>
                    <span>${factura.sede_nombre || "Principal"}</span>
                  </span>
                  <span class="meta-item" style="margin-left: 8px;">
                    <span style="font-weight: bold; color: #0F172A;">TLF:</span>
                    <span>${factura.sede_telefono || "098573894"}</span>
                  </span>
                </div>
              </td>
            </tr>
          </table>

          <table class="receipt-table">
            <tr>
              <td class="label-col">Cliente</td>
              <td class="value-col">${userFullName}</td>
            </tr>
            <tr>
              <td class="label-col">Fecha</td>
              <td class="value-col">${formatDateSpanish(factura.fecha)}</td>
            </tr>
            <tr>
              <td class="label-col">Vendedor</td>
              <td class="value-col">${factura.vendedor_nombre || "Karol Moreira"}</td>
            </tr>
            <tr>
              <td class="label-col">Método de pago</td>
              <td class="value-col">${getMetodoPagoText(factura.forma_pago)}</td>
            </tr>
            <tr>
              <td class="label-col">Estado</td>
              <td class="value-col" style="color: ${estadoPagoTexto === 'PAGADO' ? '#10B981' : '#EF4444'}">${estadoPagoTexto}</td>
            </tr>
            <tr>
              <td class="label-col">Nº de transacción</td>
              <td class="value-col">${factura.id}</td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
            <thead>
              <tr style="border-bottom: 2px solid #E2E8F0;">
                <th style="text-align: left; padding: 8px 0; font-size: 12px; color: #64748B; font-weight: 600; width: 60%;">Detalle</th>
                <th style="text-align: center; padding: 8px 0; font-size: 12px; color: #64748B; font-weight: 600; width: 15%;">Cant.</th>
                <th style="text-align: right; padding: 8px 0; font-size: 12px; color: #64748B; font-weight: 600; width: 25%;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="font-size: 13px; color: #64748B; padding: 4px 0; text-align: left;">Subtotal:</td>
              <td style="font-size: 13px; color: #0F172A; font-weight: 700; padding: 4px 0; text-align: right;">$${parseFloat(factura.subtotal || 0).toFixed(2).replace(".", ",")}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #64748B; padding: 4px 0; text-align: left;">IVA (15%):</td>
              <td style="font-size: 13px; color: #0F172A; font-weight: 700; padding: 4px 0; text-align: right;">$${parseFloat(factura.iva || 0).toFixed(2).replace(".", ",")}</td>
            </tr>
            <tr style="border-top: 1.5px solid #0F172A;">
              <td style="font-size: 16px; font-weight: 850; color: #0F172A; padding: 8px 0; text-align: left;">${estadoPagoTexto === 'PAGADO' ? 'Total Pagado:' : 'Total Pendiente:'}</td>
              <td style="font-size: 18px; font-weight: 900; color: #0F172A; padding: 8px 0; text-align: right;">${formattedTotal}</td>
            </tr>
          </table>

          <div class="footer">
            <p>¡Gracias por tu confianza en Revive Sports!</p>
            <p>Este documento es un comprobante de tu transacción.</p>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      setPdfUri(uri);
      
      if (Platform.OS === 'ios') {
        setPreviewVisible(true);
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Comprobante de Pago',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (error) {
      console.error("Error generating receipt PDF:", error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFacturas().then((data) => {
      if (openId && data) {
        const match = data.find((f) => f.id.toString() === openId.toString());
        if (match) {
          setSelectedFactura(match);
        }
      }
    });
  }, [loadFacturas, openId]);

  const filteredFacturas = useMemo(() => {
    if (!facturas) return [];
    if (!searchQuery) return facturas;
    const lowerQuery = searchQuery.toLowerCase();
    return facturas.filter(
      (f) =>
        (f.referencia && f.referencia.toLowerCase().includes(lowerQuery)) ||
        (f.forma_pago && f.forma_pago.toLowerCase().includes(lowerQuery)) ||
        (f.observacion && f.observacion.toLowerCase().includes(lowerQuery))
    );
  }, [facturas, searchQuery]);

  const pendingSummary = useMemo(() => {
    const pendientes = (facturas || []).filter((factura) => isPendingInvoice(factura));
    return {
      count: pendientes.length,
      total: pendientes.reduce((sum, factura) => sum + getPendingAmount(factura), 0),
    };
  }, [facturas]);

  const getFormaPagoColor = (forma) => {
    if (!forma) return { bg: "rgba(107, 114, 128, 0.1)", text: "#6B7280" };
    switch (forma.toUpperCase()) {
      case "PENDIENTE":
        return { bg: "rgba(245, 158, 11, 0.14)", text: "#D97706" };
      case "TARJETA":
        return { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" };
      case "EFECTIVO":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "#10B981" };
      case "TRANSFERENCIA":
        return { bg: "rgba(139, 92, 246, 0.1)", text: "#8B5CF6" };
      default:
        return { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" };
    }
  };

  if (loading) {
    return (
      <View style={[appStyles.screen, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={appStyles.screen}>
      <AppHeader
        icon="receipt-text-outline"
        title="Mis Facturas"
        subtitle="Pagos, compras y facturas pendientes."
        showBack
        showSettings
      />

      <ScrollView 
        ref={scrollRef} 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: getScreenBottomPadding(insets.bottom), gap: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFacturas} tintColor={colors.primary} />}
      >
        <Searchbar
          placeholder="Buscar factura, pago o deuda..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
          inputStyle={{ color: colors.text }}
        />

        {pendingSummary.count > 0 ? (
          <AppCard style={styles.pendingSummaryCard}>
            <View style={styles.pendingSummaryRow}>
              <View style={styles.pendingIcon}>
                <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#B91C1C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pendingTitle}>Tienes facturas pendientes de pago</Text>
                <Text style={styles.pendingSubtitle}>
                  {pendingSummary.count} {pendingSummary.count === 1 ? "factura" : "facturas"} por cancelar
                </Text>
              </View>
              <Text style={styles.pendingAmount}>${pendingSummary.total.toFixed(2)}</Text>
            </View>
          </AppCard>
        ) : null}

        <View style={{ gap: 12 }}>
          {filteredFacturas.length > 0 ? (
            filteredFacturas.map((factura) => {
              const paymentStyle = getFormaPagoColor(factura.forma_pago);
              const estadoPagoTexto = (factura.estado_pago || (factura.estado === 1 ? "PAGADO" : "PENDIENTE")).toUpperCase();
              const isPending = isPendingInvoice(factura);
              const pendingAmount = getPendingAmount(factura);
              return (
                <AppCard key={factura.id} style={styles.facturaCard}>
                  <View style={styles.facturaHeader}>
                    <View>
                      <Text style={styles.referencia}>{factura.referencia || `FAC-${factura.id}`}</Text>
                      <Text style={styles.fecha}>{new Date(factura.fecha).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: paymentStyle.bg }]}>
                      <Text style={[styles.badgeText, { color: paymentStyle.text }]}>
                        {estadoPagoTexto === "PENDIENTE" ? "POR PAGAR" : (factura.forma_pago || "OTROS")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.facturaBody}>
                    <View>
                      <Text style={styles.totalLabel}>{isPending ? "SALDO PENDIENTE" : "TOTAL"}</Text>
                      <Text style={[styles.totalValue, isPending && { color: "#B91C1C" }]}>
                        ${parseFloat(isPending ? pendingAmount : factura.total).toFixed(2)}
                      </Text>
                      <Text style={[styles.fecha, { color: estadoPagoTexto === "PAGADO" ? "#10b981" : "#b91c1c", marginTop: 4 }]}>
                        {isPending ? "PENDIENTE DE PAGO" : estadoPagoTexto}
                      </Text>
                    </View>
                    <View style={styles.detallesSummary}>
                      <Text style={styles.detallesCount}>
                        {factura.detalles ? factura.detalles.length : 0} {factura.detalles && factura.detalles.length === 1 ? "artículo" : "artículos"}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.buttonContainer, { gap: 12 }]}>
                    <WebSemanticButton
                      label="Ver Detalle"
                      icon="eye"
                      tone="primary"
                      onPress={() => setSelectedFactura(factura)}
                      style={{ flex: 1 }}
                    />
                    <WebSemanticButton
                      label="Comprobante"
                      icon="file-pdf-box"
                      tone="danger"
                      onPress={() => handlePrint(factura)}
                      style={{ flex: 1 }}
                    />
                  </View>
                </AppCard>
              );
            })
          ) : (
            <AppCard>
              <Text style={{ textAlign: "center", color: colors.textSoft }}>
                {searchQuery ? "No se encontraron facturas con ese criterio." : "Aún no tienes facturas o cobros registrados."}
              </Text>
            </AppCard>
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalle de Factura */}
      <Modal
        visible={!!selectedFactura}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedFactura(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                marginTop: getScreenTopPadding(insets.top, 24),
                marginBottom: getBottomSafePadding(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Detalle de Compra</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedFactura ? selectedFactura.referencia || `FAC-${selectedFactura.id}` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFactura(null)} style={styles.modalCloseBtn}>
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {selectedFactura && (
                <View style={{ gap: 20 }}>
                  {isPendingInvoice(selectedFactura) ? (
                    <View style={styles.pendingDetailBox}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#B91C1C" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pendingDetailTitle}>Factura pendiente de pago</Text>
                        <Text style={styles.pendingDetailText}>
                          Saldo por cancelar: ${getPendingAmount(selectedFactura).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.detailMetaRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Fecha</Text>
                      <Text style={styles.value}>
                        {new Date(selectedFactura.fecha).toLocaleDateString()} {new Date(selectedFactura.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.label}>Forma de Pago</Text>
                      <View style={[styles.badge, { backgroundColor: getFormaPagoColor(selectedFactura.forma_pago).bg, marginTop: 4, alignSelf: 'flex-start' }]}>
                        <Text style={[styles.badgeText, { color: getFormaPagoColor(selectedFactura.forma_pago).text }]}>
                          {String(selectedFactura.estado_pago || "").toUpperCase() === "PENDIENTE" ? "POR PAGAR" : (selectedFactura.forma_pago || "OTROS")}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedFactura.observacion ? (
                    <View>
                      <Text style={styles.label}>Observaciones</Text>
                      <Text style={styles.textValue}>{selectedFactura.observacion}</Text>
                    </View>
                  ) : null}

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Productos / Servicios</Text>
                  <View style={{ gap: 12 }}>
                    {selectedFactura.detalles && selectedFactura.detalles.length > 0 ? (
                      selectedFactura.detalles.map((detalle, index) => (
                        <View key={index} style={styles.productRow}>
                          {detalle.producto_imagen_url ? (
                            <Image
                              source={{ uri: detalle.producto_imagen_url }}
                              style={styles.productImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.productImagePlaceholder}>
                              <MaterialCommunityIcons name="image-outline" size={20} color={colors.textSoft} />
                            </View>
                          )}
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.productName} numberOfLines={1}>
                              {detalle.producto_nombre || "Producto"}
                            </Text>
                            <Text style={styles.productDetails}>
                              {detalle.producto_marca ? `${detalle.producto_marca} • ` : ""}
                              {parseFloat(detalle.cantidad).toFixed(0)} {detalle.producto_unidad || "UND"} x ${parseFloat(detalle.precio_unitario).toFixed(2)}
                            </Text>
                          </View>
                          <Text style={styles.productSubtotal}>
                            ${parseFloat(detalle.subtotal).toFixed(2)}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={{ color: colors.textSoft, fontStyle: 'italic' }}>No hay detalles registrados.</Text>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>${parseFloat(selectedFactura.subtotal || 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>IVA (15%)</Text>
                      <Text style={styles.summaryValue}>${parseFloat(selectedFactura.iva || 0).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, { marginTop: 4 }]}>
                      <Text style={styles.totalLabelBig}>{isPendingInvoice(selectedFactura) ? "Saldo pendiente" : "Total pagado"}</Text>
                      <Text style={[styles.totalValueBig, isPendingInvoice(selectedFactura) && { color: "#B91C1C" }]}>
                        ${parseFloat(isPendingInvoice(selectedFactura) ? getPendingAmount(selectedFactura) : selectedFactura.total).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.detailFooter}>
              <TouchableOpacity style={[styles.btnCancel, styles.detailFooterButton]} onPress={() => setSelectedFactura(null)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.danger} />
                  <Text style={styles.btnCancelText}>Cerrar</Text>
                </View>
              </TouchableOpacity>
              <WebSemanticButton
                label="Compartir"
                icon="share-variant"
                tone="primary"
                onPress={() => handlePrint(selectedFactura)}
                style={styles.detailFooterButton}
                borderWidth={1.5}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Indicador de Carga de Generación de PDF (Overlay absoluto en vez de Modal para evitar bloqueos en iOS) */}
      {generatingPdf && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", zIndex: 9999 }]}>
          <View style={{ backgroundColor: "white", padding: 24, borderRadius: 16, alignItems: "center", gap: 12 }}>
            <ActivityIndicator animating color={colors.primary} size="large" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>Generando Comprobante...</Text>
          </View>
        </View>
      )}

      {/* Modal de Vista Previa del PDF (iOS) */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                marginTop: getScreenTopPadding(insets.top, 12),
                marginBottom: getBottomSafePadding(insets.bottom, 12),
                flex: 1,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Comprobante de Pago</Text>
                <Text style={styles.modalSubtitle}>Vista Previa del PDF</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (pdfUri) {
                      await Sharing.shareAsync(pdfUri, {
                        mimeType: 'application/pdf',
                        dialogTitle: 'Comprobante de Pago',
                        UTI: 'com.adobe.pdf'
                      });
                    }
                  }} 
                  style={styles.modalCloseBtn}
                >
                  <MaterialCommunityIcons name="share-variant" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPreviewVisible(false)} style={styles.modalCloseBtn}>
                  <MaterialCommunityIcons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#E2E8F0" }}>
              {pdfUri ? (
                <WebView
                  source={{ uri: pdfUri }}
                  style={{ flex: 1 }}
                  scalesPageToFit={true}
                  originWhitelist={["*"]}
                  allowFileAccess={true}
                  allowUniversalAccessFromFileURLs={true}
                />
              ) : (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              )}
            </View>

            <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)", flexDirection: "row", gap: 12 }}>
              <WebSemanticButton
                label="Cerrar"
                icon="close"
                tone="danger"
                onPress={() => setPreviewVisible(false)}
                style={{ flex: 1 }}
                borderWidth={1.5}
              />
              <WebSemanticButton
                label="Compartir / Guardar"
                icon="share-variant"
                tone="primary"
                onPress={async () => {
                  if (pdfUri) {
                    await Sharing.shareAsync(pdfUri, {
                      mimeType: 'application/pdf',
                      dialogTitle: 'Comprobante de Pago',
                      UTI: 'com.adobe.pdf'
                    });
                  }
                }}
                style={{ flex: 1 }}
                borderWidth={1.5}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function isPendingInvoice(factura) {
  const estado = String(factura?.estado_pago || "").toUpperCase();
  const saldo = Number(factura?.saldo_pendiente || 0);
  return estado === "PENDIENTE" || estado === "ABONADO" || saldo > 0;
}

function getPendingAmount(factura) {
  const saldo = Number(factura?.saldo_pendiente || 0);
  if (saldo > 0) return saldo;
  return Number(factura?.total || 0);
}

const styles = StyleSheet.create({
  darkHeader: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerIconBox: {
    width: 52,
    height: 52,
    backgroundColor: "white",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 4,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: 8,
  },
  pendingSummaryCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(185, 28, 28, 0.18)",
    backgroundColor: "#FEF2F2",
  },
  pendingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pendingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#7F1D1D",
  },
  pendingSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
    marginTop: 2,
  },
  pendingAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#B91C1C",
  },
  facturaCard: {
    padding: 16,
    gap: 14,
  },
  facturaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: 10,
  },
  referencia: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  fecha: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  facturaBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSoft,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginTop: 2,
  },
  detallesSummary: {
    alignItems: "flex-end",
  },
  detallesCount: {
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0F172A",
    borderBottomWidth: 4,
    borderBottomColor: colors.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSoft,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  textValue: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  pendingDetailBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  pendingDetailTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#7F1D1D",
  },
  pendingDetailText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#991B1B",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(17, 24, 39, 0.08)",
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSoft,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  productImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  productImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  productDetails: {
    fontSize: 12,
    color: colors.textSoft,
    marginTop: 2,
  },
  productSubtotal: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  summaryContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSoft,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "700",
  },
  totalLabelBig: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
  },
  totalValueBig: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryStrong,
  },
  detailFooter: {
    padding: 16,
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  detailFooterButton: {
    flex: 1,
  },
  btnCancel: {
    borderWidth: 1.5,
    borderColor: colors.danger,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancelText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
});
