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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="SubmitTrip"
        options={{
          title: 'شارك رحلتك',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="car" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="TrackRide"
        options={{
          title: 'تتبع الرحلة',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="location" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabBarIcon({ name, color, focused }: { name: string; color: string; focused?: boolean }) {
  return (
    <Text style={{ 
      fontSize: focused ? 24 : 20, 
      color,
      transform: [{ scale: focused ? 1.1 : 1 }],
    }}>
      {name === 'home' && '🏠'}
      {name === 'car' && '🚗'}
      {name === 'location' && '📍'}
    </Text>
  );
} 