import { View } from "react-native";
import { Text } from "react-native-paper";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";

const TYPE_LABELS = {
  LIBRE: "Libre",
  PORCENTAJE_RM: "% RM",
  PESO_FIJO: "Peso fijo",
  RPE: "RPE",
  TIEMPO: "Tiempo",
  DISTANCIA: "Distancia",
};

export const TYPE_HELP = [
  ["Libre", "El atleta ajusta la carga o ejecución según indicación del entrenador."],
  ["% RM", "Carga calculada desde el récord máximo del ejercicio."],
  ["Peso fijo", "Carga exacta prescrita para la serie."],
  ["RPE", "Esfuerzo percibido objetivo en escala de 1 a 10."],
  ["Tiempo", "Trabajo medido por duración."],
  ["Distancia", "Trabajo medido por metros."],
];

export default function PlannedSeriesList({ series = [], compact = false, showLegend = false }) {
  if (!Array.isArray(series) || series.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={[typography.sectionTitle, { fontSize: compact ? 13 : 14, fontWeight: "900" }]}>
        Series planificadas
      </Text>

      <View style={{ gap: compact ? 6 : 8 }}>
        {series.map((item, index) => (
          <View
            key={`${item.numero_serie || index}-${item.reps || ""}`}
            style={{
              gap: 10,
              paddingVertical: compact ? 7 : 9,
              paddingHorizontal: compact ? 10 : 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surfaceSoft,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
              <Text style={[typography.cardTitle, { fontWeight: "900", fontSize: compact ? 12 : 13 }]}>
                Serie {item.numero_serie || index + 1}
              </Text>
              <Text style={{ color: colors.primaryStrong, fontWeight: "900", fontSize: compact ? 12 : 13 }}>
                {getTypeLabel(item.tipo_carga)}
              </Text>
            </View>

            <Text style={[typography.itemSubtitle, { fontWeight: "800", fontSize: compact ? 12 : 13 }]}>
              {formatSerieTarget(item)}
            </Text>
          </View>
        ))}
      </View>

      {showLegend ? (
        <View style={{ gap: 8, marginTop: 6 }}>
          <Text style={[typography.sectionTitle, { fontSize: 13, fontWeight: "900" }]}>
            Significado de tipos
          </Text>
          {TYPE_HELP.map(([label, description]) => (
            <View key={label} style={{ gap: 2 }}>
              <Text style={[typography.cardTitle, { fontSize: 12, fontWeight: "900" }]}>{label}</Text>
              <Text style={[typography.itemSubtitle, { fontSize: 12 }]}>{description}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function getTypeLabel(type) {
  return TYPE_LABELS[String(type || "LIBRE").toUpperCase()] || type || "Libre";
}

function formatSerieTarget(item) {
  const parts = [];
  const type = String(item.tipo_carga || "LIBRE").toUpperCase();

  if (item.reps) {
    parts.push(`${item.reps} reps`);
  }

  if (type === "TIEMPO" && item.tiempo_segundos != null) {
    parts.push(`${item.tiempo_segundos} seg`);
  }

  if (type === "DISTANCIA" && item.distancia_metros != null) {
    parts.push(`${item.distancia_metros} m`);
  }

  if (item.rpe != null) {
    parts.push(`RPE ${item.rpe}`);
  }

  if (item.target_load && item.target_load !== "Libre" && !parts.includes(item.target_load)) {
    parts.push(item.target_load);
  }

  if (type === "PORCENTAJE_RM" && item.porcentaje_rm != null) {
    parts.push(`${item.porcentaje_rm}% RM`);
  }

  if (item.descanso_segundos != null) {
    parts.push(`descanso ${item.descanso_segundos} seg`);
  }

  return parts.length ? parts.join(" · ") : "Libre";
}
