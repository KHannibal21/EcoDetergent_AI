import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Camera as CameraIcon, Upload, Scan, AlertTriangle, Zap, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';
import { aiAnalysisService } from '../services/aiAnalysisService';
import { storage } from '../utils/storage';

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const router = useRouter();

  // Запрос разрешений при загрузке компонента
  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(status === 'granted');

        // Также запрашиваем разрешение для галереи
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (galleryStatus.status !== 'granted') {
          console.log('Gallery permission not granted');
        }
      } catch (error) {
        console.error('Камера рұқсаты қатесі:', error);
        setCameraPermission(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      // Запрашиваем разрешение на доступ к галерее
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Рұқсат қажет',
          'Галереяға қол жеткізу үшін рұқсат беру керек',
          [{ text: 'Түсінікті' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // Добавляем base64 прямо в ImagePicker
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);

        // Если есть base64 от ImagePicker, используем его
        if (result.assets[0].base64) {
          await analyzeImageWithBase64(result.assets[0].base64);
        } else {
          // Иначе конвертируем через FileSystem
          await analyzeImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Галерея қатесі:', error);
      Alert.alert('Қате', 'Суретті таңдау мүмкін болмады');
    }
  };

  const handleCameraScan = async () => {
    if (cameraPermission === null) {
      Alert.alert('Күте тұрыңыз', 'Камера рұқсаты тексерілуде...');
      return;
    }

    if (!cameraPermission) {
      Alert.alert(
        'Камера рұқсаты қажет',
        'Сканерлеу үшін камераға рұқсат беру керек',
        [
          { text: 'Бас тарту', style: 'cancel' },
          {
            text: 'Рұқсат беру',
            onPress: async () => {
              try {
                const { status } = await Camera.requestCameraPermissionsAsync();
                setCameraPermission(status === 'granted');
                if (status === 'granted') {
                  router.push('/scan/camera');
                }
              } catch (error) {
                Alert.alert('Қате', 'Камера рұқсатын алу мүмкін болмады');
              }
            }
          }
        ]
      );
      return;
    }

    router.push('/scan/camera');
  };

  // Анализ с готовым base64
  const analyzeImageWithBase64 = async (base64: string) => {
    setScanning(true);
    try {
      console.log('Starting image analysis with provided base64...');

      // Анализируем изображение через AI сервис
      const analysisResult = await aiAnalysisService.analyzeImage(base64);

      console.log('AI analysis completed:', analysisResult);

      // Сохраняем результаты
      const scanId = `scan_${Date.now()}`;
      await saveAnalysisData(scanId, base64, analysisResult);

      console.log('Analysis data saved, navigating to analytics...');

      // Немедленно переходим к результатам
      router.push({
        pathname: '/(tabs)/analytics',
        params: {
          hasNewAnalysis: 'true',
          timestamp: Date.now().toString(),
          source: 'gallery'
        }
      });

    } catch (error: any) {
      console.error('Талдау қатесі:', error);
      handleAnalysisError(error);
    } finally {
      setScanning(false);
      setSelectedImage(null);
    }
  };

  // Анализ с конвертацией через FileSystem
  const analyzeImage = async (imageUri: string) => {
    setScanning(true);
    try {
      console.log('Starting image analysis with FileSystem conversion...');

      // Читаем файл и конвертируем в base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64, // Исправленная строка
      });

      console.log('Image converted to base64, length:', base64.length);

      // Анализируем изображение через AI сервис
      const analysisResult = await aiAnalysisService.analyzeImage(base64);

      console.log('AI analysis completed:', analysisResult);

      // Сохраняем результаты
      const scanId = `scan_${Date.now()}`;
      await saveAnalysisData(scanId, base64, analysisResult);

      console.log('Analysis data saved, navigating to analytics...');

      // Немедленно переходим к результатам
      router.push({
        pathname: '/(tabs)/analytics',
        params: {
          hasNewAnalysis: 'true',
          timestamp: Date.now().toString(),
          source: 'gallery'
        }
      });

    } catch (error: any) {
      console.error('Талдау қатесі:', error);
      handleAnalysisError(error);
    } finally {
      setScanning(false);
      setSelectedImage(null);
    }
  };

  // Обработка ошибок анализа
  const handleAnalysisError = (error: any) => {
    let errorMessage = 'Суретті талдау кезінде қате орын алды';

    if (error.message?.includes('storage') || error.message?.includes('full')) {
      errorMessage = 'Жад жеткіліксіз. Кейбір ескі сканерлерді жойып, қайталап көріңіз.';
    } else if (error.message?.includes('network') || error.message?.includes('API')) {
      errorMessage = 'Интернет байланысында қате. Қайталап көріңіз.';
    } else if (error.message?.includes('Base64') || error.message?.includes('encoding')) {
      errorMessage = 'Суретті өңдеу кезінде қате орын алды. Басқа суретті таңдап көріңіз.';
    }

    Alert.alert(
      'Талдау сәтсіз',
      errorMessage,
      [{ text: 'Түсінікті', style: 'default' }]
    );
  };

  // Функция сохранения данных анализа
  const saveAnalysisData = async (scanId: string, imageBase64: string, analysisResult: any) => {
    try {
      // Очищаем старые данные перед сохранением новых
      await cleanupOldScans();

      await storage.setItem('current_analysis', JSON.stringify(analysisResult));
      await storage.setItem('last_analysis_time', Date.now().toString());
      await storage.setItem('last_scan_id', scanId);

      console.log('Analysis data saved successfully');
    } catch (error: any) {
      console.error('Storage save error:', error);

      // Если ошибка связана с переполнением памяти
      if (error.code === 13 || error.message?.includes('full')) {
        console.log('Storage full, performing emergency cleanup...');
        await emergencyCleanup();
        // Повторяем попытку сохранения
        await storage.setItem('current_analysis', JSON.stringify(analysisResult));
        await storage.setItem('last_analysis_time', Date.now().toString());
      } else {
        throw error;
      }
    }
  };

  // Очистка старых сканов
  const cleanupOldScans = async () => {
    try {
      const allKeys = await storage.getAllKeys();
      const scanKeys = allKeys.filter(key => key.startsWith('scan_'));

      // Оставляем только последние 3 скана
      if (scanKeys.length > 3) {
        scanKeys.sort();
        const keysToRemove = scanKeys.slice(0, scanKeys.length - 3);

        for (const key of keysToRemove) {
          await storage.removeItem(key);
          console.log('Removed old scan:', key);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // Аварийная очистка хранилища
  const emergencyCleanup = async () => {
    try {
      const allKeys = await storage.getAllKeys();
      const scanKeys = allKeys.filter(key =>
        key.startsWith('scan_') ||
        key === 'current_analysis' ||
        key === 'last_analysis_time'
      );

      for (const key of scanKeys) {
        await storage.removeItem(key);
      }

      console.log('Emergency cleanup completed');
    } catch (error) {
      console.error('Emergency cleanup failed:', error);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Жуғыш заттар талдағышы</Text>
        <Text style={styles.subtitle}>Талдау үшін қаптаманы сканерлеңіз не фото жүктеңіз</Text>
      </View>

      {/* Scanner Options */}
      <View style={styles.scannerOptions}>
        <TouchableOpacity
          style={[styles.scanOption, styles.primaryOption]}
          onPress={handleCameraScan}
          disabled={scanning}
        >
          <View style={[styles.optionIcon, styles.cameraIcon]}>
            <CameraIcon size={32} color="#ffffff" />
          </View>
          <Text style={[styles.optionTitle, styles.whiteText]}>Камерамен сканерлеу</Text>
          <Text style={[styles.optionDesc, styles.whiteText]}>
            Қаптамаға тікелей бағыттап, лезде талдау
          </Text>
          <View style={styles.optionBadge}>
            <Text style={styles.optionBadgeText}>Жылдам</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanOption, styles.secondaryOption]}
          onPress={pickImage}
          disabled={scanning}
        >
          <View style={[styles.optionIcon, styles.uploadIcon]}>
            <Upload size={32} color="#ffffff" />
          </View>
          <Text style={styles.optionTitle}>Галереядан жүктеу</Text>
          <Text style={styles.optionDesc}>
            Сақталған фотоны таңдап, автоматты түрде талдау
          </Text>
          <View style={[styles.optionBadge, styles.uploadBadge]}>
            <Text style={styles.optionBadgeText}>Автоматты</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreviewSection}>
          <View style={styles.imagePreviewHeader}>
            <Text style={styles.imagePreviewTitle}>Таңдалған сурет</Text>
            <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        </View>
      )}

      {/* Processing Overlay */}
      {scanning && (
        <View style={styles.processingSection}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.processingText}>Өнімді талдау...</Text>
            <Text style={styles.processingSubText}>
              Жасанды интеллект қаптаманы талдап жатыр
            </Text>
            <View style={styles.processingSteps}>
              <Text style={styles.processingStep}>✓ Сурет жүктелді</Text>
              <Text style={styles.processingStep}>⏳ Қаптама танылуда</Text>
              <Text style={styles.processingStep}>◯ Химиялық талдау</Text>
            </View>
          </View>
        </View>
      )}

      {/* AI Features */}
      <View style={styles.features}>
        <Text style={styles.featuresTitle}>ЖИ мүмкіндіктері</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, styles.scanIcon]}>
              <Scan size={24} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>Қаптаманы тану</Text>
            <Text style={styles.featureDesc}>Бренд пен атауын автоматты түрде анықтау</Text>
          </View>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, styles.phIcon]}>
              <Zap size={24} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>Құрам талдау</Text>
            <Text style={styles.featureDesc}>Химиялық құрамды егжей-тегжейлі талдау</Text>
          </View>
          <View style={styles.feature}>
            <View style={[styles.featureIcon, styles.riskIcon]}>
              <AlertTriangle size={24} color="#ffffff" />
            </View>
            <Text style={styles.featureTitle}>Қауіпті бағалау</Text>
            <Text style={styles.featureDesc}>Денсаулыққа әсерін бағалау</Text>
          </View>
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Жақсы нәтиже алу үшін</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Жарықтылық</Text>
              <Text style={styles.tip}>Жарық жақсы болған кезде сканерлеңіз</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Анықтық</Text>
              <Text style={styles.tip}>Қаптаманың аты мен ингредиенттері анық көрінуі керек</Text>
            </View>
          </View>
          <View style={styles.tipItem}>
            <View style={styles.tipBullet} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Бұрыш</Text>
              <Text style={styles.tip}>Қаптаманы тікелей камераға бағыттаңыз</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Spacer */}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20
  },
  scannerOptions: {
    padding: 24,
    gap: 20
  },
  scanOption: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  primaryOption: {
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0da271'
  },
  secondaryOption: {
    backgroundColor: '#ffffff',
  },
  optionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraIcon: {
    backgroundColor: '#0da271',
    borderWidth: 3,
    borderColor: '#ffffff'
  },
  uploadIcon: {
    backgroundColor: '#3b82f6',
    borderWidth: 3,
    borderColor: '#ffffff'
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8
  },
  whiteText: {
    color: '#ffffff'
  },
  optionDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20
  },
  optionBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  uploadBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)'
  },
  optionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff'
  },
  imagePreviewSection: {
    padding: 24,
    paddingTop: 0
  },
  imagePreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  imagePreviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  clearButton: {
    padding: 4
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f3f4f6'
  },
  processingSection: {
    padding: 24,
    paddingTop: 0
  },
  processingContent: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  processingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
  processingSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20
  },
  processingSteps: {
    width: '100%',
    gap: 8
  },
  processingStep: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  features: {
    padding: 24,
    paddingTop: 0
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  featuresGrid: {
    gap: 16
  },
  feature: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  featureDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  scanIcon: {
    backgroundColor: '#10b981',
  },
  phIcon: {
    backgroundColor: '#f59e0b',
  },
  riskIcon: {
    backgroundColor: '#ef4444',
  },
  tips: {
    backgroundColor: '#ffffff',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center'
  },
  tipsList: {
    gap: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginTop: 8,
  },
  tipContent: {
    flex: 1
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  tip: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  spacer: {
    height: 40,
  },
});