import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accent } from '../../theme';
import type { BackButtonProps } from './Glass.types';

export function BackButton({ onPress, style }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.inner}>
        <Ionicons name="chevron-back" size={22} color={accent[500]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 0,
    end: 16,
    width: 40,
    height: 40,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inner: { alignItems: 'center', justifyContent: 'center' },
});
