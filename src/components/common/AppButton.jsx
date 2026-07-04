import { Button } from "react-native-paper";
import { colors } from "../../theme/colors";

export default function AppButton({
  mode = "outlined",
  children,
  style,
  contentStyle,
  labelStyle,
  ...props
}) {
  return (
    <Button
      mode={mode}
      buttonColor={mode === "contained" ? colors.primary : undefined}
      textColor={mode === "contained" ? "#111827" : colors.text}
      style={[
        {
          borderRadius: 8,
          borderColor: mode === "outlined" ? colors.border : undefined,
        },
        style,
      ]}
      contentStyle={[{ minHeight: 48 }, contentStyle]}
      labelStyle={[{ fontWeight: "900", fontSize: 13, textTransform: "uppercase" }, labelStyle]}
      {...props}
    >
      {children}
    </Button>
  );
}
