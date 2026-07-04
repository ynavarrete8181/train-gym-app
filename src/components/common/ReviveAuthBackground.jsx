import { Dimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");

export default function ReviveAuthBackground() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.black,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={["#030303", "#0a0a0a", "#050505"]}
        style={{
          position: "absolute",
          inset: 0,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 22,
          right: -42,
          width: width * 0.42,
          height: 238,
          backgroundColor: "rgba(255,255,255,0.04)",
          borderTopLeftRadius: 170,
          borderBottomLeftRadius: 148,
          transform: [{ rotate: "8deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 82,
          right: 40,
          width: width * 0.18,
          height: 156,
          backgroundColor: "rgba(255,255,255,0.05)",
          borderRadius: 100,
          transform: [{ rotate: "12deg" }],
        }}
      />

      <Svg
        width={width}
        height={140}
        viewBox={`0 0 ${width} 140`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 34,
        }}
      >
        <Path
          d={`
            M0 44
            C ${width * 0.22} 92, ${width * 0.44} 8, ${width * 0.66} 40
            C ${width * 0.83} 66, ${width * 0.94} 48, ${width} 30
            L ${width} 140
            L 0 140
            Z
          `}
          fill="#131313"
        />
      </Svg>

      <Svg
        width={width}
        height={120}
        viewBox={`0 0 ${width} 120`}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 12,
        }}
      >
        <Path
          d={`
            M0 60
            C ${width * 0.22} 96, ${width * 0.44} 18, ${width * 0.66} 46
            C ${width * 0.84} 68, ${width * 0.95} 56, ${width} 22
          `}
          stroke={colors.gold}
          strokeWidth="5"
          fill="none"
        />
      </Svg>
    </View>
  );
}
