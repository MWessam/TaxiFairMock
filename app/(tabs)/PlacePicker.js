import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PlacePicker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [activeField, setActiveField] = useState(params.type || 'from');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapPin, setMapPin] = useState({ latitude: 30.0444, longitude: 31.2357 });
  const [pinAddress, setPinAddress] = useState('');
  const [fromLocation, setFromLocation] = useState(null);
  const [toLocation, setToLocation] = useState(null);
  const debounceRef = useRef();

  useEffect(() => {
    if (activeField === 'from' && fromQuery.length > 2) {
      debouncedSearch(fromQuery);
    } else if (activeField === 'to' && toQuery.length > 2) {
      debouncedSearch(toQuery);
    } else {
      setResults([]);
    }
  }, [fromQuery, toQuery, activeField]);

  const debouncedSearch = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(query), 400);
  };

  const searchPlaces = async (query) => {
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=ar,en&countrycodes=eg`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TaxiFairApp/1.0',
        },
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSelect = (item) => {
    const loc = {
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      display_name: item.display_name,
    };
    if (activeField === 'from') {
      setFromQuery(item.display_name);
      setFromLocation(loc);
      setMapPin({ latitude: loc.latitude, longitude: loc.longitude });
      setActiveField('to');
    } else {
      setToQuery(item.display_name);
      setToLocation(loc);
      router.back();
      setTimeout(() => {
        router.replace({
          pathname: params.returnTo || '/(tabs)/SubmitTrip',
          params: {
            from_lat: fromLocation?.latitude,
            from_lng: fromLocation?.longitude,
            from_name: fromQuery,
            to_lat: toLocation?.latitude,
            to_lng: toLocation?.longitude,
            to_name: toLocation?.display_name,
          },
        });
      }, 100);
    }
  };

  const handleMapSelection = async () => {
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPin.latitude}&lon=${mapPin.longitude}&zoom=16&addressdetails=1`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'TaxiFairApp/1.0',
          'Accept-Language': 'ar,en',
        },
      });
      const data = await res.json();
      setPinAddress(data.display_name || '');
      
      const currentLocation = {
        latitude: mapPin.latitude,
        longitude: mapPin.longitude,
        display_name: data.display_name || '',
      };
      
      if (activeField === 'from') {
        setFromQuery(data.display_name || '');
        setFromLocation(currentLocation);
        setActiveField('to');
      } else {
        setToQuery(data.display_name || '');
        setToLocation(currentLocation);
        router.back();
        setTimeout(() => {
          router.replace({
            pathname: params.returnTo || '/(tabs)/SubmitTrip',
            params: {
              from_lat: fromLocation?.latitude,
              from_lng: fromLocation?.longitude,
              from_name: fromQuery,
              to_lat: currentLocation.latitude,
              to_lng: currentLocation.longitude,
              to_name: currentLocation.display_name,
            },
          });
        }, 100);
      }
    } catch (err) {
      setPinAddress('');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.inputPanel}>
        <TextInput
          style={[styles.input, activeField === 'from' && styles.activeInput]}
          placeholder="من (اكتب أو اختر من الخريطة)"
          value={fromQuery}
          onChangeText={setFromQuery}
          onFocus={() => setActiveField('from')}
        />
        <TextInput
          style={[styles.input, activeField === 'to' && styles.activeInput]}
          placeholder="إلى (اكتب أو اختر من الخريطة)"
          value={toQuery}
          onChangeText={setToQuery}
          onFocus={() => setActiveField('to')}
        />
      </View>
      {loading && <ActivityIndicator size="large" color="#d32f2f" style={{ margin: 12 }} />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            <Text style={styles.resultText}>{item.display_name}</Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 180 }}
      />
      <MapView
        style={{ flex: 1, minHeight: SCREEN_HEIGHT * 0.4 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: mapPin.latitude,
          longitude: mapPin.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={e => setMapPin(e.nativeEvent.coordinate)}
        onRegionChangeComplete={region => setMapPin({ latitude: region.latitude, longitude: region.longitude })}
      >
        <Marker coordinate={mapPin} draggable onDragEnd={e => setMapPin(e.nativeEvent.coordinate)} />
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </MapView>
      <TouchableOpacity style={styles.mapButton} onPress={handleMapSelection}>
        <Text style={styles.mapButtonText}>اختر هذه النقطة</Text>
      </TouchableOpacity>
      {pinAddress ? <Text style={styles.pinAddress}>{pinAddress}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputPanel: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginHorizontal: 4,
    color: '#222',
  },
  activeInput: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  resultText: {
    fontSize: 16,
    color: '#222',
  },
  mapButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    margin: 12,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pinAddress: {
    textAlign: 'center',
    color: '#222',
    marginBottom: 8,
  },
}); 