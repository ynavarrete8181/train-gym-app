import { Chip } from "react-native-paper";
import { colors } from "../../theme/colors";

const toneMap = {
  PENDIENTE: { borderColor: colors.border, textColor: colors.textSoft },
  EN_PROGRESO: { borderColor: colors.accent, textColor: colors.accent },
  COMPLETADO: { borderColor: colors.success, textColor: colors.success },
  COMPLETADO_CON_AJUSTE: { borderColor: colors.warning, textColor: colors.warning },
  OMITIDO: { borderColor: colors.danger, textColor: colors.danger },
};

export default function ProgressChip({ status }) {
  const tone = toneMap[status] || toneMap.PENDIENTE;

  return (
    <Chip
      mode="outlined"
      textStyle={{ color: tone.textColor, fontWeight: "700", fontSize: 12 }}
      style={{ borderColor: tone.borderColor, backgroundColor: "#fff" }}
    >
      {status.replaceAll("_", " ")}
    </Chip>
  );
}
