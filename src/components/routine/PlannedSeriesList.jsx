import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppSegmentedSelector from "../common/AppSegmentedSelector";
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!Array.isArray(series) || series.length === 0) {
    return null;
  }

  const activeSerie = series[Math.min(selectedIndex, series.length - 1)] || series[0];
  const activeStatus = getSerieStatus(activeSerie);
  const serieOptions = series.map((item, index) => ({
    value: index,
    label: `Serie ${item.numero_serie || index + 1}`,
  }));

  return (
    <View style={{ gap: 8 }}>
      <Text style={[typography.sectionTitle, { fontSize: compact ? 13 : 14, fontWeight: "900" }]}>
        Series planificadas
      </Text>

      <AppSegmentedSelector options={serieOptions} value={selectedIndex} onChange={setSelectedIndex} compact />

      <View
        style={{
          gap: 10,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: activeStatus.border,
          backgroundColor: activeStatus.background,
          padding: compact ? 10 : 12,
        }}
      >
        <SerieInlineDetail serie={{ ...activeSerie, index: selectedIndex }} />
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

function SerieInlineDetail({ serie }) {
  if (!serie) return null;

  const status = getSerieStatus(serie);
  const prescription = serie.prescripcion_carga || {};

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: "900" }}>
            Serie {serie.numero_serie || serie.index + 1}
          </Text>
          <Text style={{ color: status.color, fontSize: 11, fontWeight: "900" }}>
            {getTypeLabel(serie.tipo_carga)}
          </Text>
        </View>
        <View
          style={{
            borderRadius: 999,
            backgroundColor: "#fff",
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}
        >
          <Text style={{ color: status.color, fontSize: 11, fontWeight: "900" }}>
            {prescription.carga_redondeada
              ? `${formatNumber(prescription.carga_redondeada)} kg`
              : isMissingRmPrescription(serie)
                ? "RM pendiente"
                : serie.target_load || "Libre"}
          </Text>
        </View>
      </View>

      <Text style={{ color: colors.textSoft, fontSize: 12, fontWeight: "800", lineHeight: 17 }}>
        {prescription.carga_redondeada
          ? "Carga de barra"
          : isMissingRmPrescription(serie)
            ? "Ingresa un RM estimado para calcular los pesos de esta sesión."
            : formatSerieTarget(serie)}
      </Text>

      {prescription.carga_redondeada ? (
        <BarSetupLines prescription={prescription} />
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <DetailPill icon="repeat" value={`${serie.reps || "-"} reps`} />
        {serie.porcentaje_rm != null ? <DetailPill icon="percent-outline" value={`${serie.porcentaje_rm}% RM`} /> : null}
        {serie.descanso_segundos != null ? <DetailPill icon="timer-outline" value={`${serie.descanso_segundos}s`} /> : null}
        {serie.rpe != null ? <DetailPill icon="speedometer" value={`RPE ${serie.rpe}`} /> : null}
      </View>

      {prescription.rm_usado ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <MaterialCommunityIcons name="weight-lifter" size={16} color={colors.primaryStrong} />
          <Text style={{ flex: 1, color: colors.textSoft, fontSize: 11, fontWeight: "800" }}>
            RM usado: {formatNumber(prescription.rm_usado)} kg · {formatRmSource(prescription.rm_origen)}
          </Text>
        </View>
      ) : null}

      {prescription.nota ? (
        <View style={{ borderRadius: 8, backgroundColor: "rgba(245,158,11,0.10)", padding: 9 }}>
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: "900" }}>{prescription.nota}</Text>
        </View>
      ) : null}
    </View>
  );
}

function DetailPill({ icon, value }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        borderRadius: 999,
        backgroundColor: "#fff",
        paddingHorizontal: 8,
        paddingVertical: 5,
      }}
    >
      <MaterialCommunityIcons name={icon} size={14} color={colors.primaryStrong} />
      <Text style={{ color: colors.textSoft, fontSize: 11, fontWeight: "900" }}>
        {value}
      </Text>
    </View>
  );
}

function BarSetupLines({ prescription }) {
  const bar = prescription.barra_kg || 20;
  const plates = Array.isArray(prescription.discos_por_lado) ? prescription.discos_por_lado : [];

  return (
    <View style={{ gap: 4 }}>
      <SetupLine label="Barra" value={`${formatNumber(bar)} kg`} />
      <SetupLine label="Por lado" value={plates.length ? "" : "sin discos"} />
      {plates.map((plate) => (
        <SetupLine
          key={`${plate.cantidad}-${plate.peso}`}
          indent
          label={`${plate.cantidad} x`}
          value={`${formatNumber(plate.peso)} kg`}
        />
      ))}
    </View>
  );
}

function SetupLine({ label, value, indent = false }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 8,
      }}
    >
      <Text
        style={{
          width: indent ? 62 : 78,
          marginLeft: indent ? 12 : 0,
          color: colors.textSoft,
          fontSize: 11,
          fontWeight: "900",
          textAlign: indent ? "right" : "left",
        }}
      >
        {label}
      </Text>
      <Text style={{ flex: 1, color: colors.text, fontSize: 12, fontWeight: "900", lineHeight: 14 }}>
        {value}
      </Text>
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
    const percentLabel = `${item.porcentaje_rm}% RM`;
    if (!parts.includes(percentLabel)) {
      parts.push(percentLabel);
    }
  }

  if (item.descanso_segundos != null) {
    parts.push(`descanso ${item.descanso_segundos} seg`);
  }

  return parts.length ? parts.join(" · ") : "Libre";
}

function getSerieStatus(item) {
  if (isMissingRmPrescription(item)) {
    return {
      color: colors.warning,
      border: "rgba(245,158,11,0.34)",
      background: "rgba(245,158,11,0.08)",
    };
  }

  if (item.prescripcion_carga?.carga_redondeada) {
    return {
      color: colors.success,
      border: "rgba(16,185,129,0.28)",
      background: "rgba(16,185,129,0.07)",
    };
  }

  return {
    color: colors.primaryStrong,
    border: colors.border,
    background: colors.surfaceSoft,
  };
}

function isMissingRmPrescription(item) {
  return String(item?.tipo_carga || "").toUpperCase() === "PORCENTAJE_RM"
    && item?.prescripcion_carga
    && !item.prescripcion_carga.carga_redondeada;
}

function formatRmSource(source) {
  switch (source) {
    case "plan_rm_registro":
      return "RM elegido por entrenador";
    case "plan_rm_referencia":
      return "RM de referencia";
    case "ultimo_rm_usuario":
      return "último RM registrado";
    case "estimado_por_historial":
      return "estimado por historial";
    case "estimado_manual_sesion":
      return "estimado de esta sesión";
    default:
      return "RM";
  }
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return String(Math.round(number * 100) / 100).replace(/\\.00$/, "");
}
