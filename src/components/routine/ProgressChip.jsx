import { View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";

const toneMap = {
  PENDIENTE: { borderColor: "#FDE68A", backgroundColor: "#FFFBEB", textColor: "#B45309" },
  EN_PROGRESO: { borderColor: colors.blue, backgroundColor: colors.blueSoft, textColor: colors.info },
  COMPLETADO: { borderColor: colors.success, backgroundColor: colors.successSoft, textColor: colors.success },
  COMPLETADO_CON_AJUSTE: { borderColor: colors.warning, backgroundColor: colors.yellowSoft, textColor: colors.warning },
  OMITIDO: { borderColor: colors.danger, backgroundColor: colors.dangerSoft, textColor: colors.danger },
};

export default function ProgressChip({ status }) {
  const tone = toneMap[status] || toneMap.PENDIENTE;
  const label = String(status || "PENDIENTE").replaceAll("_", " ");

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: tone.borderColor,
        backgroundColor: tone.backgroundColor,
        borderRadius: 4,
        paddingHorizontal: 9,
        paddingVertical: 5,
      }}
    >
      <Text style={{ color: tone.textColor, fontWeight: "900", fontSize: 11, letterSpacing: 0 }}>
        {label}
      </Text>
    </View>
  );
}
