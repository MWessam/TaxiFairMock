import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaxiFair مصر</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/SubmitTrip')}>
        <Text style={styles.buttonText}>شارك اجرة رحلتك</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/EstimateFare')}>
        <Text style={styles.buttonText}>احسب رحلتك</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/TrackRide')}>
        <Text style={styles.buttonText}>ابدأ تتبع رحلتك</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 