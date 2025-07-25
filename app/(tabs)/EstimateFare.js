import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getRouteDistanceORS, getGovernorateFromCoords } from '../../routeHelpers';

export default function EstimateFare() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [from, setFrom] = useState({ address: '', lat: null, lng: null });
  const [to, setTo] = useState({ address: '', lat: null, lng: null });
  const [duration, setDuration] = useState('');
  const [passengers, setPassengers] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.from_name && params.from_lat && params.from_lng) {
      setFrom({ address: params.from_name, lat: Number(params.from_lat), lng: Number(params.from_lng) });
    }
    if (params.to_name && params.to_lat && params.to_lng) {
      setTo({ address: params.to_name, lat: Number(params.to_lat), lng: Number(params.to_lng) });
    }
  }, [params.from_name, params.from_lat, params.from_lng, params.to_name, params.to_lat, params.to_lng]);

  const handleSubmit = async () => {
    if (!from.address || !to.address || !time) {
      Alert.alert('يرجى اختيار نقطة البداية والنهاية والوقت');
      return;
    }
    setLoading(true);
    try {
      const fromObj = { lat: from.lat, lng: from.lng, name: from.address };
      const toObj = { lat: to.lat, lng: to.lng, name: to.address };
      const distance = await getRouteDistanceORS(fromObj, toObj);
      const governorate = await getGovernorateFromCoords(fromObj.lat, fromObj.lng);
      // Mock estimate for now
      const estimate = 38;
      setLoading(false);
      router.push({
        pathname: '/(tabs)/FareResults',
        params: {
          from: from.address,
          to: to.address,
          time: time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          duration,
          passengers,
          estimate,
          distance,
          governorate,
        },
      });
    } catch (err) {
      setLoading(false);
      Alert.alert('حدث خطأ أثناء حساب المسافة أو التقدير');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>احسب اجرة رحلتك</Text>
          <View style={styles.locationBoxes}>
            <TouchableOpacity
              style={styles.locationBox}
              onPress={() => router.push({ pathname: '/(tabs)/PlacePicker', params: { type: 'from', lat: from.lat, lng: from.lng, returnTo: '/(tabs)/EstimateFare' } })}
            >
              <View style={styles.locationIcon}><Text style={styles.locationIconText}>🔵</Text></View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>من</Text>
                <Text style={styles.locationAddress}>{from.address || 'اختر نقطة البداية'}</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.connectingLine} />
            <TouchableOpacity
              style={styles.locationBox}
              onPress={() => router.push({ pathname: '/(tabs)/PlacePicker', params: { type: 'to', lat: to.lat, lng: to.lng, returnTo: '/(tabs)/EstimateFare' } })}
            >
              <View style={styles.locationIcon}><Text style={styles.locationIconText}>🔴</Text></View>
              <View style={styles.locationContent}>
                <Text style={styles.locationLabel}>إلى</Text>
                <Text style={styles.locationAddress}>{to.address || 'اختر نقطة النهاية'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: time ? '#222' : '#999', fontSize: 16 }}>
                {time ? time.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'وقت الرحلة (مطلوب)'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={time || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) setTime(selectedDate);
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="مدة الرحلة (دقائق) (اختياري)"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
            <TextInput
              style={styles.input}
              placeholder="عدد الركاب (اختياري)"
              keyboardType="numeric"
              value={passengers}
              onChangeText={setPassengers}
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitButtonText}>احسب الأجرة</Text>
            </TouchableOpacity>
            {loading && (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <ActivityIndicator size="large" color="#d32f2f" />
                <Text style={{ color: '#d32f2f', marginTop: 8 }}>جاري الحساب...</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 24,
    textAlign: 'center',
  },
  locationBoxes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationIconText: {
    fontSize: 20,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 16,
    color: '#222',
  },
  connectingLine: {
    width: 16,
    height: 2,
    backgroundColor: '#d32f2f',
    marginHorizontal: 8,
    borderRadius: 1,
  },
  form: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: '#222',
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 