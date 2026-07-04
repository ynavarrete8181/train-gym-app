import { View } from "react-native";
import { Text } from "react-native-paper";
import { useRouter } from "expo-router";
import AppCard from "../common/AppCard";
import ProgressChip from "./ProgressChip";
import SeriesRow from "./SeriesRow";
import { colors } from "../../theme/colors";

import WebSemanticButton from '../common/WebSemanticButton';

export default function ExerciseCard({ item, planId, onRegisterPress }) {
  const router = useRouter();
  const isCompleted = item.status === 'COMPLETADO';

  return (
    <AppCard style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 17, fontWeight: "900", color: colors.text }}>{item.name}</Text>
          {item.note ? <Text style={{ color: colors.textSoft }}>{item.note}</Text> : null}
        </View>
        <ProgressChip status={item.status} />
      </View>

      <View>
        <SeriesRow label="Plan" value={`${item.series} x ${item.reps}`} />
        <SeriesRow label="Carga / RPE Obj" value={`${item.load} / ${item.rpe || '-'}`} />
        
        {item.ejecucion && (
          <View style={{ 
            marginTop: 8, padding: 8, borderRadius: 6,
            backgroundColor: item.status === 'COMPLETADO' ? 'rgba(46, 125, 50, 0.10)' : 
                             item.status === 'PARCIAL' ? 'rgba(224, 161, 0, 0.10)' : 'rgba(15, 23, 42, 0.08)'
          }}>
            <Text style={{ 
              fontWeight: '800', fontSize: 13,
              color: item.status === 'COMPLETADO' ? colors.success : 
                     item.status === 'PARCIAL' ? colors.goldDark : colors.textSoft
            }}>
              {item.status === 'COMPLETADO' ? '✅ Completado: ' : 
               item.status === 'PARCIAL' ? '⚠️ Parcial: ' : '⏭️ Omitido'}
              {item.status !== 'OMITIDO' ? `${item.ejecucion.series?.filter(s => s.completado)?.length || 0}/${item.series} series` : ''}
            </Text>
            {item.ejecucion.obs ? (
              <Text style={{ color: colors.textSoft, fontSize: 12, marginTop: 4 }}>
                Nota: {item.ejecucion.obs}
              </Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={{ marginTop: 4 }}>
        <WebSemanticButton 
          label="VER DETALLE"
          icon="eye"
          tone="neutral"
          onPress={() => router.push({
            pathname: `/exercise/${item.id}`,
            params: {
              series: item.series,
              reps: item.reps,
              load: item.load,
              rpe: item.rpe,
              plan_id: planId
            }
          })} 
        />
      </View>
    </AppCard>
  );
}
