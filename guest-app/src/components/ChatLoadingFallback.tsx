import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function ChatLoadingFallback() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#0f172a" />
      <Text style={styles.text}>Chargement…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
});
