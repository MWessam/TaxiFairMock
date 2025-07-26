import React, { useState, useRef, useEffect } from 'react';

import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Modal, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function PlacePicker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [from, setFrom] = useState({ name: '', lat: null, lng: null });
  const [to, setTo] = useState({ name: '', lat: null, lng: null });
  const [activeField, setActiveField] = useState('from');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapPin, setMapPin] = useState({ latitude: 30.0444, longitude: 31.2357 });
  const [pinAddress, setPinAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const debounceRef = useRef();

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      
      // Update map pin to current location if it's still default
      if (mapPin.latitude === 30.0444 && mapPin.longitude === 31.2357) {
        setMapPin({ latitude, longitude });
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  // Calculate viewbox coordinates (5km radius)
  const getViewbox = () => {
    if (!currentLocation) return null;
    
    // 5km in degrees (approximate)
    const latDelta = 5 / 111; // 1 degree ≈ 111km
    const lngDelta = 5 / (111 * Math.cos(currentLocation.latitude * Math.PI / 180));
    
    const minLat = currentLocation.latitude - latDelta;
    const maxLat = currentLocation.latitude + latDelta;
    const minLng = currentLocation.longitude - lngDelta;
    const maxLng = currentLocation.longitude + lngDelta;
    
    return `${minLng},${minLat},${maxLng},${maxLat}`;
  };

  // Search locations
  const debouncedSearch = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlaces(query), 400);
  };

  const searchPlaces = async (query) => {
    setLoading(true);
    try {
      const viewbox = getViewbox();
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&accept-language=ar,en`;
      
      // Add viewbox if we have current location
      if (viewbox) {
        url += `&viewbox=${viewbox}&bounded=0`;
      }
      
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TaxiFairApp/1.0' },
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  // Handle text input change
  const handleInputChange = (field, value) => {
    setSearch(value);
    setActiveField(field);
    
    // Update the corresponding field state
    if (field === 'from') {
      setFrom(prev => ({ ...prev, name: value }));
    } else {
      setTo(prev => ({ ...prev, name: value }));
    }
    
    debouncedSearch(value);
  };

  // Handle selecting a location from the list
  const handleSelect = (item) => {
    const loc = {
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    };
    if (activeField === 'from') {
      setFrom(loc);
    } else {
      setTo(loc);
    }
    setSearch('');
    setResults([]);
    // If both fields are filled, return
    setTimeout(() => {
      if (from.name && to.name) {
        router.back();
        setTimeout(() => {
          router.replace({
            pathname: params.returnTo || '/(tabs)/SubmitTrip',
            params: {
              from_lat: activeField === 'from' ? loc.lat : from.lat,
              from_lng: activeField === 'from' ? loc.lng : from.lng,
              from_name: activeField === 'from' ? loc.name : from.name,
              to_lat: activeField === 'to' ? loc.lat : to.lat,
              to_lng: activeField === 'to' ? loc.lng : to.lng,
              to_name: activeField === 'to' ? loc.name : to.name,
            },
          });
        }, 100);
      }
    }, 100);
  };

  // Map logic
  const openMap = (field) => {
    setActiveField(field);
    setShowMap(true);
    setPinAddress('');
  };

  const handleMapRegionChange = (region) => {
    setMapPin({ latitude: region.latitude, longitude: region.longitude });
  };

  const handleMapPinDragEnd = (e) => {
    setMapPin(e.nativeEvent.coordinate);
  };

  const reverseGeocode = async () => {
    setPinAddress('');
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPin.latitude}&lon=${mapPin.longitude}&zoom=16&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TaxiFairApp/1.0', 'Accept-Language': 'ar,en' },
      });
      const data = await res.json();
      setPinAddress(data.display_name || '');
    } catch (err) {
      setPinAddress('');
    }
  };

  // When map pin moves, reverse geocode
  React.useEffect(() => {
    if (showMap) reverseGeocode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPin.latitude, mapPin.longitude, showMap]);

  // Handle picking from map
  const handlePickFromMap = () => {
    const loc = {
      name: pinAddress,
      lat: mapPin.latitude,
      lng: mapPin.longitude,
    };
    if (activeField === 'from') {
      setFrom(loc);
    } else {
      setTo(loc);
    }
    setShowMap(false);
    // If both fields are filled, return
    setTimeout(() => {
      if ((activeField === 'from' ? loc.name : from.name) && (activeField === 'to' ? loc.name : to.name)) {
        router.back();
        setTimeout(() => {
          router.replace({
            pathname: params.returnTo || '/(tabs)/SubmitTrip',
            params: {
              from_lat: activeField === 'from' ? loc.lat : from.lat,
              from_lng: activeField === 'from' ? loc.lng : from.lng,
              from_name: activeField === 'from' ? loc.name : from.name,
              to_lat: activeField === 'to' ? loc.lat : to.lat,
              to_lng: activeField === 'to' ? loc.lng : to.lng,
              to_name: activeField === 'to' ? loc.name : to.name,
            },
          });
        }, 100);
      }
    }, 100);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اختر المواقع</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.inputPanel}>
        <TextInput
          style={[styles.input, activeField === 'from' && styles.activeInput]}
          placeholder="من (اكتب اسم المكان أو اختر من الخريطة)"
          value={from.name}
          onFocus={() => setActiveField('from')}
          onChangeText={v => handleInputChange('from', v)}
        />
        <TextInput
          style={[styles.input, activeField === 'to' && styles.activeInput]}
          placeholder="إلى (اكتب اسم المكان أو اختر من الخريطة)"
          value={to.name}
          onFocus={() => setActiveField('to')}
          onChangeText={v => handleInputChange('to', v)}
        />
        <TouchableOpacity style={styles.mapButton} onPress={() => openMap(activeField)}>
          <Text style={styles.mapButtonText}>اختر من الخريطة</Text>
        </TouchableOpacity>
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
      {/* Map Modal */}
      <Modal 
        visible={showMap} 
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: mapPin.latitude,
              longitude: mapPin.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onRegionChangeComplete={handleMapRegionChange}
            mapType="standard"
          >
            <Marker
              coordinate={mapPin}
              draggable
              onDragEnd={handleMapPinDragEnd}
            />
            <UrlTile
              urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
              flipY={false}
            />
          </MapView>
          
          {/* Back Button */}
          <TouchableOpacity style={styles.mapBackButton} onPress={() => setShowMap(false)}>
            <Text style={styles.mapBackButtonText}>←</Text>
          </TouchableOpacity>

          {/* Map Bottom Panel */}
          <View style={styles.mapBottomPanel}>
            <Text style={styles.pinAddress} numberOfLines={2}>
              {pinAddress || 'جاري جلب العنوان...'}
            </Text>
            <TouchableOpacity style={styles.doneButton} onPress={handlePickFromMap}>
              <Text style={styles.doneButtonText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50, // Add some top margin
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#222',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSpacer: {
    width: 40, // Adjust as needed for spacing
  },
  inputPanel: {
    padding: 16,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  activeInput: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  mapButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  mapPanel: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  pinAddress: {
    textAlign: 'center',
    color: '#222',
    marginBottom: 12,
    fontSize: 16,
  },
  pickButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 10,
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#eee',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  mapBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBackButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  mapBottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
