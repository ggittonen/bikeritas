import { StyleSheet, Text, type TextProps } from 'react-native';
import { colors, fonts } from '@/theme';

type Props = TextProps & {
  bold?: boolean;
  /** Most of the UI is uppercase, as in the design. */
  upper?: boolean;
  size?: number;
  color?: string;
};

/** All text in the app goes through this so the monospace font is applied everywhere. */
export function AppText({ bold, upper, size = 15, color = colors.text, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        { fontFamily: bold ? fonts.bold : fonts.regular, fontSize: size, color },
        upper && styles.upper,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { letterSpacing: 0.5 },
  upper: { textTransform: 'uppercase', letterSpacing: 1 },
});
