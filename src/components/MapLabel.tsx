import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

/** Black caption box in a map's top-left corner, e.g. "Pyörän sijainti". */
export function MapLabel({ text }: { text: string }) {
  return (
    <View style={styles.label} pointerEvents="none">
      <AppText upper size={18}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000, // above Leaflet's panes on web
    backgroundColor: '#111',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
