import { TextInput } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function AppInput(props) {
  return (
    <TextInput
      mode="outlined"
      outlineColor={colors.border}
      activeOutlineColor={colors.primary}
      textColor={colors.text}
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: 20,
      }}
      theme={{
        roundness: 20,
      }}
      contentStyle={{
        paddingVertical: 10,
      }}
      {...props}
    />
  );
}
