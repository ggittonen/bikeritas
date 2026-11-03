import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type IconProps = { color?: ColorValue; size?: number };

/** The Bikeritas logo: two solid wheels and a line-drawn frame. */
export function BikeIcon({ color = '#fff', size = 40 }: IconProps) {
  return (
    <Svg width={size * 1.4} height={size} viewBox="0 0 56 40">
      <Circle cx={12} cy={28} r={11} fill={color} />
      <Circle cx={44} cy={28} r={11} fill={color} />
      <Path
        d="M12 28 L22 10 L40 10 L44 28 M22 10 L30 26 L40 10 M18 4 L28 4 M36 2 L44 4"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1={23} y1={4} x2={22} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <Line x1={40} y1={3} x2={40} y2={10} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
    </Svg>
  );
}

export function PinIcon({ color = '#fff', size = 30 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={12} cy={10} r={2.5} stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function MenuIcon({ color = '#fff', size = 30 }: IconProps) {
  return (
    <Svg width={size * 1.5} height={size} viewBox="0 0 36 24">
      <Line x1={2} y1={3} x2={34} y2={3} stroke={color} strokeWidth={2.5} />
      <Line x1={2} y1={12} x2={34} y2={12} stroke={color} strokeWidth={2.5} />
      <Line x1={2} y1={21} x2={34} y2={21} stroke={color} strokeWidth={2.5} />
    </Svg>
  );
}
