import { Platform, View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const isIOS = Platform.OS === 'ios';
const isAndroid = Platform.OS === 'android';
const isWeb = Platform.OS === 'web';

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  /** Frosted glass plate behind the tab items. */
  const TabBarBackground = () => (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: 28,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: theme.tabBarBorder,
          backgroundColor: isWeb ? theme.tabBar : 'transparent',
        },
      ]}
    >
      {!isWeb && !isAndroid && (
        <BlurView
          style={StyleSheet.absoluteFill}
          intensity={70}
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
        />
      )}

      {!isWeb && isAndroid && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.tabBar, opacity: 0.5 },
          ]}
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.tabBar, opacity: isWeb ? 0 : 0.5 }]} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.iconMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingTop: 10,
        },
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom > 0 ? insets.bottom - 2 : 14,
          height: 68,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          shadowColor: theme.glassShadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          paddingBottom: isIOS ? 6 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'دستیار',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={23}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lending"
        options={{
          title: 'وام‌دهی',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cash' : 'cash-outline'} size={23} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
