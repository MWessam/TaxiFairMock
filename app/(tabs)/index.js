import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/constants/ThemeContext';
import { getAvailableGovernorates } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const { theme, currentGovernorate, changeGovernorate } = useTheme();
  const [showGovernorateModal, setShowGovernorateModal] = useState(false);
  const availableGovernorates = getAvailableGovernorates();
  const currentGovData = availableGovernorates.find(gov => gov.key === currentGovernorate);

  const handleGovernorateSelect = (governorateKey) => {
    changeGovernorate(governorateKey);
    setShowGovernorateModal(false);
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header with governorate selector */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>تاكسي مصر</Text>
        <TouchableOpacity 
          style={styles.governorateSelector}
          onPress={() => setShowGovernorateModal(true)}
        >
          <Text style={styles.governorateSelectorText}>
            📍 {currentGovData?.name || 'المنصورة'}
          </Text>
          <Text style={styles.governorateSelectorArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainContent}>
          <Text style={styles.welcomeText}>مرحباً بك في تطبيق تاكسي مصر</Text>
          <Text style={styles.subtitleText}>اختر الخدمة المناسبة لك</Text>

          {/* Three main buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={() => router.push('/(tabs)/SubmitTrip')}
            >
              <Text style={styles.buttonIcon}>🚗</Text>
              <Text style={styles.buttonTitle}>شارك رحلتك</Text>
              <Text style={styles.buttonSubtitle}>شارك تكلفة الرحلة مع الآخرين</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={() => router.push('/(tabs)/EstimateFare')}
            >
              <Text style={styles.buttonIcon}>💰</Text>
              <Text style={styles.buttonTitle}>احسب الأجرة</Text>
              <Text style={styles.buttonSubtitle}>احسب تكلفة رحلتك قبل السفر</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={() => router.push('/(tabs)/TrackRide')}
            >
              <Text style={styles.buttonIcon}>📍</Text>
              <Text style={styles.buttonTitle}>تتبع الرحلة</Text>
              <Text style={styles.buttonSubtitle}>تتبع رحلتك في الوقت الفعلي</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Governorate Selection Modal */}
      <Modal
        visible={showGovernorateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGovernorateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر المحافظة</Text>
              <TouchableOpacity 
                onPress={() => setShowGovernorateModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableGovernorates}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.governorateItem,
                    currentGovernorate === item.key && styles.selectedGovernorateItem
                  ]}
                  onPress={() => handleGovernorateSelect(item.key)}
                >
                  <View style={[styles.colorPreview, { backgroundColor: item.primary }]} />
                  <Text style={[
                    styles.governorateItemText,
                    currentGovernorate === item.key && styles.selectedGovernorateItemText
                  ]}>
                    {item.name}
                  </Text>
                  {currentGovernorate === item.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.textOnPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  governorateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  governorateSelectorText: {
    fontSize: 16,
    color: theme.text,
    marginRight: 8,
  },
  governorateSelectorArrow: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  mainButton: {
    backgroundColor: theme.surface,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.textSecondary,
  },
  governorateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  selectedGovernorateItem: {
    backgroundColor: theme.surface,
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: theme.border,
  },
  governorateItemText: {
    flex: 1,
    fontSize: 18,
    color: theme.text,
  },
  selectedGovernorateItemText: {
    fontWeight: 'bold',
    color: theme.primary,
  },
  checkmark: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: 'bold',
  },
}); 