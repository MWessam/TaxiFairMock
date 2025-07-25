import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { distillRoute, calculateRouteDistance, getGovernorateFromCoords } from '../../routeHelpers';
import { saveTrip } from '../../firestoreHelpers';

export default function TrackRide() {
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState([]);
  const [startLoc, setStartLoc] = useState(null);
  const [endLoc, setEndLoc] = useState(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState('');
  const [passengers, setPassengers] = useState('');
  const [loading, setLoading] = useState(false);
  const watchId = useRef(null);
  const router = useRouter();

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('يرجى السماح للتطبيق بالوصول إلى الموقع');
      return;
    }
    setTracking(true);
    setRoute([]);
    setStartLoc(null);
    setEndLoc(null);
    setStartTime(new Date());
    watchId.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setRoute((prev) => [...prev, { latitude, longitude }]);
        if (!startLoc) setStartLoc({ latitude, longitude });
      }
    );
  };

  const endTracking = async () => {
    setTracking(false);
    if (watchId.current) {
      watchId.current.remove();
      watchId.current = null;
    }
    if (route.length > 0) {
      setEndLoc(route[route.length - 1]);
    }
    setLoading(true);
    try {
      const distilledRoute = distillRoute(route, 20);
      const distance = calculateRouteDistance(route);
      const governorate = startLoc ? await getGovernorateFromCoords(startLoc.latitude, startLoc.longitude) : '';
      const tripData = {
        from: startLoc ? { lat: startLoc.latitude, lng: startLoc.longitude, name: startAddress } : {},
        to: route.length > 0 ? { lat: route[route.length - 1].latitude, lng: route[route.length - 1].longitude, name: endAddress } : {},
        start_time: startTime ? startTime.toISOString() : null,
        created_at: new Date().toISOString(),
        duration: duration ? Number(duration) : null,
        passenger_count: passengers ? Number(passengers) : 1,
        governorate,
        route: distilledRoute,
        distance,
      };
      const success = await saveTrip(tripData);
      setLoading(false);
      if (success) {
        Alert.alert('تم حفظ الرحلة بنجاح');
        setRoute([]);
        setStartLoc(null);
        setEndLoc(null);
        setStartTime(null);
        setDuration('');
        setPassengers('');
      } else {
        Alert.alert('حدث خطأ أثناء حفظ الرحلة');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('حدث خطأ أثناء حفظ الرحلة');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: 30.0444,
          longitude: 31.2357,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="#d32f2f" strokeWidth={4} />
        )}
        {startLoc && (
          <Marker coordinate={startLoc} title="نقطة البداية" pinColor="green" />
        )}
        {endLoc && (
          <Marker coordinate={endLoc} title="نقطة النهاية" pinColor="red" />
        )}
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </MapView>
      <View style={styles.bottomPanel}>
        <Text style={styles.title}>ابدأ تتبع رحلتك</Text>
        <TextInput
          style={styles.input}
          placeholder="عدد الركاب (اختياري)"
          keyboardType="numeric"
          value={passengers}
          onChangeText={setPassengers}
        />
        <TextInput
          style={styles.input}
          placeholder="مدة الرحلة (دقائق) (اختياري)"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
        {!tracking ? (
          <TouchableOpacity style={styles.button} onPress={startTracking}>
            <Text style={styles.buttonText}>ابدأ التتبع</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, { backgroundColor: '#222' }]} onPress={endTracking}>
            <Text style={styles.buttonText}>انهاء التتبع</Text>
          </TouchableOpacity>
        )}
        {loading && (
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <ActivityIndicator size="large" color="#d32f2f" />
            <Text style={{ color: '#d32f2f', marginTop: 8 }}>جاري الحفظ...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 