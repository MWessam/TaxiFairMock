import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import { getAvailableGovernorates } from '@/constants/Colors';

export default function TabLayout() {
  const { currentGovernorate } = useTheme();
  const availableGovernorates = getAvailableGovernorates();
  const currentGovData = availableGovernorates.find(gov => gov.key === currentGovernorate);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentGovData?.primary || '#007AFF',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="SubmitTrip"
        options={{
          title: 'شارك رحلتك',
          tabBarIcon: ({ color }) => <TabBarIcon name="car" color={color} />,
        }}
      />
      <Tabs.Screen
        name="TrackRide"
        options={{
          title: 'تتبع الرحلة',
          tabBarIcon: ({ color }) => <TabBarIcon name="location" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, color }}>
      {name === 'home' && '🏠'}
      {name === 'car' && '🚗'}
      {name === 'location' && '📍'}
    </Text>
  );
} 