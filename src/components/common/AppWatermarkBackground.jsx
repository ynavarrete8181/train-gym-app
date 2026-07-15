import { ImageBackground, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

const WATERMARK = require("../../../assets/images/revive-home-watermark.png");

export default function AppWatermarkBackground({ children, contentStyle, imageOpacity = 0.78, style }) {
  return (
    <ImageBackground
      source={WATERMARK}
      resizeMode="cover"
      style={[styles.screen, style]}
      imageStyle={[styles.image, { opacity: imageOpacity }]}
    >
      <View pointerEvents="none" style={styles.overlay} />
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    backgroundColor: colors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245,246,248,0.22)",
  },
  content: {
    flex: 1,
  },
});
