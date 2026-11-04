import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { normalizeAssetUrl } from "../../../api/apiClient";

const localProductImages = {
  1: require("../../../../assets/images/products/sparkling-water.png"),
  2: require("../../../../assets/images/products/coconut-water.png"),
  3: require("../../../../assets/images/products/still-water.png"),
  4: require("../../../../assets/images/products/immune-drink.png"),
  5: require("../../../../assets/images/products/still-water.png"),
  6: require("../../../../assets/images/products/still-water.png"),
  8: require("../../../../assets/images/products/protein-dessert.png"),
  9: require("../../../../assets/images/products/sports-drink.png"),
  11: require("../../../../assets/images/products/sports-drink.png"),
};

export default function ProductsShowcase({ products = [] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, width - 40);

  const slides = useMemo(
    () => (Array.isArray(products) ? products : [])
      .filter(product => product && product.nombre)
      .slice(0, 12)
      .map(product => ({
        id: product.id,
        title: product.nombre,
        brand: product.marca || "REVIVE SPORTS",
        price: product.precio_venta,
        image: localProductImages[product.id] || (product.imagen_url ? { uri: normalizeAssetUrl(product.imagen_url) } : null),
        available: product.disponible !== false,
      })),
    [products]
  );

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Productos destacados</Text>
        <Text style={styles.sectionMeta}>Desliza para ver más →</Text>
      </View>

      {slides.length ? (
        <View style={styles.viewport}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth + 12}
            snapToAlignment="start"
            contentContainerStyle={styles.carouselContent}
          >
              {slides.map(slide => (
                <View key={String(slide.id)} style={[styles.slide, { width: cardWidth }]}>
                  <View style={styles.banner}>
                    <View style={styles.imagePanel}>
                      {slide.image ? <Image source={slide.image} style={styles.image} resizeMode="contain" /> : <MaterialCommunityIcons name="shopping-outline" size={59} color={colors.accentDark} />}
                    </View>
                    <View style={styles.copy}>
                      <Text style={styles.brand}>{slide.brand}</Text>
                      <Text style={styles.productName} numberOfLines={2}>{slide.title}</Text>
                      <Text style={styles.price}>{slide.price != null && Number.isFinite(Number(slide.price)) ? `$${Number(slide.price).toFixed(2)}` : "Consultar precio"}</Text>
                      <View style={[styles.stockPill, !slide.available && styles.stockPillEmpty]}><Text style={styles.stockText}>{slide.available ? "Disponible" : "Sin stock"}</Text></View>
                    </View>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}><MaterialCommunityIcons name="shopping-outline" size={25} color={colors.accentDark} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyTitle}>Catálogo no disponible</Text>
            <Text style={styles.emptyDescription}>Los productos aparecerán aquí cuando estén disponibles desde el servidor.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  heading: { fontSize: 18, fontWeight: "900", color: colors.text },
  sectionMeta: { fontSize: 10, fontWeight: "800", color: colors.primaryStrong },
  viewport: { marginHorizontal: -20 },
  carouselContent: { paddingHorizontal: 20, paddingBottom: 4, gap: 12 },
  slide: { height: 164 },
  banner: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: "hidden", shadowColor: colors.shadow, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  imagePanel: { position: "absolute", left: 0, top: 0, bottom: 0, width: 148, padding: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC", borderRightWidth: 1, borderRightColor: colors.border },
  image: { width: "100%", height: "100%" },
  copy: { flex: 1, marginLeft: 148, paddingHorizontal: 15, paddingVertical: 13, alignItems: "flex-start", justifyContent: "center" },
  brand: { color: colors.primaryStrong, fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  productName: { marginTop: 4, fontSize: 17, lineHeight: 20, fontWeight: "900", color: colors.text },
  price: { fontSize: 20, color: colors.primaryStrong, fontWeight: "900", marginTop: 7 },
  stockPill: { position: "absolute", right: 9, bottom: 9, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: colors.successSoft },
  stockPillEmpty: { backgroundColor: "#FEF3C7" },
  stockText: { fontSize: 10, fontWeight: "900", color: colors.text },
  emptyCard: { padding: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyIcon: { backgroundColor: colors.primaryPale, padding: 11, borderRadius: 12 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  emptyDescription: { color: colors.textSoft, fontSize: 12, marginTop: 3, lineHeight: 17 },
});
