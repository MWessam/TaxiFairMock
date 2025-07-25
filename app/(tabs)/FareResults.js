import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveTrip } from '../../firestoreHelpers';

export default function FareResults() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [paidFare, setPaidFare] = useState(params.paidFare || '');
  const [showResults, setShowResults] = useState(!!params.paidFare);
  const [inputValue, setInputValue] = useState(params.paidFare || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params.paidFare) {
      setPaidFare('');
      setShowResults(false);
      setInputValue('');
    } else {
      setPaidFare(params.paidFare);
      setShowResults(true);
      setInputValue(params.paidFare);
    }
  }, [params.paidFare, params.from, params.to, params.estimate]);

  const handlePaidFareSubmit = async () => {
    if (!inputValue) return;
    setPaidFare(inputValue);
    setShowResults(true);
    
    // If we have trip data and we're in estimate mode, save the trip
    if (params.tripData) {
      setSaving(true);
      try {
        const tripData = JSON.parse(params.tripData);
        // Update the trip data with the paid fare
        tripData.fare = Number(inputValue);
        
        const success = await saveTrip(tripData);
        if (success) {
          Alert.alert('تم حفظ الرحلة بنجاح');
        } else {
          Alert.alert('حدث خطأ أثناء حفظ الرحلة');
        }
      } catch (error) {
        console.error('Error saving trip:', error);
        Alert.alert('حدث خطأ أثناء حفظ الرحلة');
      } finally {
        setSaving(false);
      }
    }
  };

  // Mock analysis data
  const analysis = [
    { label: 'متوسط الأجرة لرحلات مماثلة', avg: 40, graph: [10, 20, 30, 40, 30, 20, 10] },
    { label: 'متوسط الأجرة حسب الوقت', avg: 38, graph: [15, 25, 35, 38, 35, 25, 15] },
    { label: 'متوسط الأجرة حسب المسافة', avg: 42, graph: [12, 22, 32, 42, 32, 22, 12] },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>نتيجة الأجرة</Text>
        {!showResults && (
          <View style={styles.paidInputBox}>
            <Text style={styles.paidInputLabel}>كم دفعت؟</Text>
            <TextInput
              style={styles.paidInput}
              placeholder="الأجرة المدفوعة (جنيه)"
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <TouchableOpacity 
              style={styles.paidInputButton} 
              onPress={handlePaidFareSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.paidInputButtonText}>تأكيد</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>الأجرة المتوقعة</Text>
          <Text style={styles.estimateValue}>{params.estimate || 38} جنيه</Text>
          {showResults && paidFare && (
            <>
              <Text style={styles.summaryLabel}>ما دفعته فعلياً</Text>
              <Text style={styles.paidValue}>{paidFare} جنيه</Text>
            </>
          )}
        </View>
        {analysis.map((a, i) => (
          <View key={i} style={styles.analysisBox}>
            <Text style={styles.analysisAvg}>متوسط: {a.avg} جنيه</Text>
            <Text style={styles.analysisLabel}>{a.label}</Text>
            <View style={styles.graphBarContainer}>
              {a.graph.map((v, j) => (
                <View key={j} style={[styles.graphBar, { height: 20 + v, backgroundColor: '#d32f2f', marginRight: 4 }]} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
  paidInputBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  paidInputLabel: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  paidInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    width: 120,
    textAlign: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  paidInputButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  paidInputButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#888',
    marginBottom: 4,
  },
  estimateValue: {
    fontSize: 32,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paidValue: {
    fontSize: 28,
    color: '#1976d2',
    fontWeight: 'bold',
    marginTop: 4,
  },
  analysisBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  analysisAvg: {
    fontSize: 16,
    color: '#222',
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  graphBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  graphBar: {
    width: 16,
    borderRadius: 4,
    backgroundColor: '#d32f2f',
  },
}); 