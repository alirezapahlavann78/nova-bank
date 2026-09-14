import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { accent } from '../../theme';
import type { TabBarProps } from './Glass.types';

const TABS = [
  { key: 'dashboard', label: 'داشبورد', icon: 'home' },
  { key: 'assistant', label: 'دستیار', icon: 'sparkles' },
  { key: 'loan', label: 'وام‌دهی', icon: 'cash' },
];

export function TabBar({ active, onTabPress, style }: TabBarProps) {
  return (
    <SafeAreaView edges={['bottom']} style={[styles.wrap, style]}>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={70}
        tint="light"
        {...(Platform.OS === 'android' ? { blurMethod: 'dimezisBlurView' as const } : {})}
      />
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => onTabPress?.(tab.key)} style={styles.tab}>
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={isActive ? accent[500] : 'rgba(148,163,184,0.7)'}
              />
              <Text
                style={[
                  styles.label,
                  { color: isActive ? accent[500] : 'rgba(148,163,184,0.7)' },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 83,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  tab: { alignItems: 'center', gap: 4 },
  label: { fontSize: 11, fontWeight: '600' },
});
