import { useMemo, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { normalizeAssetUrl } from "../../../api/apiClient";

export default function ProductsShowcase({ products = [] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(260, width - 40);
  const [index, setIndex] = useState(0);

  const slides = useMemo(
    () => (Array.isArray(products) ? products : [])
      .filter(product => product && product.nombre)
      .slice(0, 8)
      .map(product => ({
        id: product.id,
        title: product.nombre,
        brand: product.marca || "REVIVE SPORTS",
        price: product.precio_venta,
        image: normalizeAssetUrl(product.imagen_url || ""),
        available: product.disponible !== false,
      })),
    [products]
  );

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Productos destacados</Text>
        <Text style={styles.sectionMeta}>REVIVE Store</Text>
      </View>

      {slides.length ? (
        <>
          <View style={styles.viewport}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={e => setIndex(Math.max(0, Math.round(e.nativeEvent.contentOffset.x / cardWidth)))}
            >
              {slides.map(slide => (
                <View key={String(slide.id)} style={[styles.slide, { width: cardWidth }]}>
                  {slide.image ? (
                    <ImageBackground source={{ uri: slide.image }} style={styles.banner} imageStyle={styles.image}>
                      <View style={styles.overlay} />
                      <View style={styles.copy}>
                        <Text style={styles.brand}>{slide.brand}</Text>
                        <Text style={styles.productName} numberOfLines={2}>{slide.title}</Text>
                        <Text style={styles.price}>
                          {slide.price != null && Number.isFinite(Number(slide.price)) ? `$${Number(slide.price).toFixed(2)}` : "Consultar precio"}
                        </Text>
                        {!slide.available && <Text style={styles.unavailable}>Temporalmente sin stock</Text>}
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={styles.banner}>
                      <View style={styles.emptyImage}>
                        <MaterialCommunityIcons name="shopping-outline" size={59} color={colors.accent} />
                      </View>
                      <View style={styles.copy}>
                        <Text style={styles.brand}>{slide.brand}</Text>
                        <Text style={styles.productName} numberOfLines={2}>{slide.title}</Text>
                        <Text style={styles.price}>
                          {slide.price != null && Number.isFinite(Number(slide.price)) ? `$${Number(slide.price).toFixed(2)}` : "Consultar precio"}
                        </Text>
                        {!slide.available && <Text style={styles.unavailable}>Temporalmente sin stock</Text>}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
          {slides.length > 1 && <View style={styles.dots}>
            {slides.map((slide, i) => <View key={String(slide.id)} style={[styles.dot, i === index && styles.activeDot]} />)}
          </View>}
        </>
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
  sectionMeta: { fontSize: 11, fontWeight: "800", color: colors.accentDark },
  viewport: { borderRadius: 19, overflow: "hidden" },
  slide: { height: 185 },
  banner: { height: 185, justifyContent: "flex-end", backgroundColor: "#11243B", overflow: "hidden" },
  image: { resizeMode: "cover" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,12,24,0.53)" },
  emptyImage: { position: "absolute", top: 12, right: 22, opacity: 0.28 },
  copy: { padding: 19 },
  brand: { color: colors.accent, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  productName: { marginTop: 5, fontSize: 23, fontWeight: "900", color: colors.white },
  price: { fontSize: 19, color: colors.white, fontWeight: "800", marginTop: 5 },
  unavailable: { fontSize: 11, color: "#FDE68A", marginTop: 4 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 12 },
  dot: { width: 7, height: 7, backgroundColor: "#D6D9E1", borderRadius: 4 },
  activeDot: { backgroundColor: colors.accent, width: 21 },
  emptyCard: { padding: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyIcon: { backgroundColor: colors.primaryPale, padding: 11, borderRadius: 12 },
  emptyTitle: { color: colors.text, fontSize: 14, fontWeight: "900" },
  emptyDescription: { color: colors.textSoft, fontSize: 12, marginTop: 3, lineHeight: 17 },
});
