import { Tabs } from 'expo-router/js-tabs';

import { brandHeaderOptions } from '@/components/BrandHeader';
import { BikeIcon, MenuIcon, PinIcon } from '@/components/icons';
import { colors, fonts } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        ...brandHeaderOptions,
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: { backgroundColor: colors.chrome, borderTopWidth: 0, height: 84, paddingTop: 10 },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.regular, fontSize: 12, letterSpacing: 1, marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'SIJAINTI', tabBarIcon: ({ color }) => <PinIcon color={color} /> }}
      />
      <Tabs.Screen
        name="bikes"
        options={{ title: 'PYÖRÄT', tabBarIcon: ({ color }) => <BikeIcon color={color} size={28} /> }}
      />
      <Tabs.Screen
        name="more"
        options={{ title: 'MUUT', tabBarIcon: ({ color }) => <MenuIcon color={color} size={22} /> }}
      />
    </Tabs>
  );
}
