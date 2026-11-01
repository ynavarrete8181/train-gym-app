import { useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { normalizeAssetUrl } from "../../../api/apiClient";

// Hasta disponer del catálogo móvil público, las promociones no indican precios ni stock.
const editorial = [
  { title: "POWER & ENERGÍA", subtitle: "Prepárate para tu próximo reto", icon: "bottle-soda-classic-outline", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop" },
  { title: "HIDRATACIÓN", subtitle: "Acompaña cada entrenamiento", icon: "water-outline", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop" },
  { title: "VIDA ACTIVA", subtitle: "Descubre lo que viene en REVIVE", icon: "dumbbell", image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1000&auto=format&fit=crop" },
];

export default function ProductsShowcase({ products = [] }) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(260, width - 40);
  const [index, setIndex] = useState(0);
  const slides = useMemo(() => {
    const valid = Array.isArray(products) ? products.filter(p => p?.imagen_url && p?.nombre) : [];
    if (!valid.length) return editorial;
    return valid.slice(0, 6).map(p => ({
      title: p.nombre,
      subtitle: p.precio_venta != null ? `$${Number(p.precio_venta).toFixed(2)}` : "Disponible en REVIVE",
      image: normalizeAssetUrl(p.imagen_url),
      icon: "shopping-outline",
    }));
  }, [products]);
  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.heading}>Productos destacados</Text>
        <Text style={styles.sectionMeta}>REVIVE Store</Text>
      </View>
      <View style={styles.viewport}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => setIndex(Math.max(0, Math.round(e.nativeEvent.contentOffset.x / cardWidth)))}>
          {slides.map((slide, i) => (
            <View key={i} style={[styles.slide, { width: cardWidth }]}>
              <ImageBackground source={{ uri: slide.image }} style={styles.image} imageStyle={styles.rounded}>
                <View style={styles.scrim} />
                <View style={styles.copy}>
                  <View style={styles.kicker}><MaterialCommunityIcons name={slide.icon} size={17} color={colors.accent} /><Text style={styles.kickerText}>REVIVE SPORTS</Text></View>
                  <Text style={styles.productTitle} numberOfLines={2}>{slide.title}</Text>
                  <Text style={styles.productSubtitle}>{slide.subtitle}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.dots}>
        {slides.map((_, i) => <View key={i} style={[styles.dot, i === index && styles.dotSelected]} />)}
      </View>
      {!Array.isArray(products) || products.length === 0 ? <Text style={styles.note}>Imágenes referenciales. Próximamente catálogo y precios por sede.</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  heading: { color: colors.text, fontSize: 19, fontWeight: "900" },
  sectionMeta: { fontSize: 11, fontWeight: "800", color: colors.accentDark },
  viewport: { borderRadius: 18, overflow: "hidden" },
  slide: { height: 174 },
  image: { flex: 1, justifyContent: "flex-end", backgroundColor: colors.primaryDark },
  rounded: { borderRadius: 18 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,12,24,0.57)" },
  copy: { padding: 19 },
  kicker: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  kickerText: { color: colors.accent, fontWeight: "900", fontSize: 10, letterSpacing: 0.9 },
  productTitle: { fontSize: 23, fontWeight: "900", color: colors.white },
  productSubtitle: { color: "#E7EAF0", fontSize: 13, marginTop: 4 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginTop: 11 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#D6D9E1" },
  dotSelected: { width: 21, backgroundColor: colors.accent },
  note: { marginTop: 6, color: colors.textSoft, textAlign: "center", fontSize: 10 },
});