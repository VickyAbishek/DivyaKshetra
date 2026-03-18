import { Tabs } from 'expo-router';
import { colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.deepEbony, borderTopColor: colors.templeBrown },
        tabBarActiveTintColor: colors.sacredGold,
        tabBarInactiveTintColor: colors.terracotta,
      }}
    >
      <Tabs.Screen name="index"  options={{ title: '🗺 Explore',        tabBarIcon: () => null }} />
      <Tabs.Screen name="search" options={{ title: '🔍 Search',         tabBarIcon: () => null }} />
      <Tabs.Screen name="add"    options={{ title: '➕ Add',             tabBarIcon: () => null }} />
      <Tabs.Screen name="status" options={{ title: '📋 My Submissions', tabBarIcon: () => null }} />
    </Tabs>
  );
}
