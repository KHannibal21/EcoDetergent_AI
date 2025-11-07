import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react-native';
import { aiAnalysisService } from '../services/aiAnalysisService';
import { storage } from '../utils/storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState<'off' | 'on'>('off');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const FRAME_SIZE = Math.min(screenWidth, screenHeight) * 0.75;
  const FRAME_TOP = (screenHeight - FRAME_SIZE) / 2;

  // Проверяем разрешения при монтировании
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Камера рұқсаттарын тексеру...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Камераға рұқсат қажет</Text>
        <Text style={styles.permissionText}>
          Өнімді сканерлеу үшін камераға рұқсат беру керек
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Рұқсат беру</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cameraError) {
    return (
      <View style={styles.errorContainer}>
        <Camera size={64} color="#ef4444" />
        <Text style={styles.errorTitle}>Камера қатесі</Text>
        <Text style={styles.errorText}>{cameraError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setCameraError(null)}
        >
          <Text style={styles.retryButtonText}>Қайталау</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Артқа оралу</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const processAndCropImage = async (photoUri: string, photoWidth: number, photoHeight: number): Promise<string | null> => {
    try {
      console.log('Starting image processing...');
      console.log('Original photo dimensions:', photoWidth, 'x', photoHeight);

      // Упрощенная обрезка - берем центральную часть
      const cropSize = Math.min(photoWidth, photoHeight) * 0.8;
      const cropX = (photoWidth - cropSize) / 2;
      const cropY = (photoHeight - cropSize) / 2;

      const cropConfig = {
        originX: Math.max(0, cropX),
        originY: Math.max(0, cropY),
        width: Math.min(cropSize, photoWidth - cropX),
        height: Math.min(cropSize, photoHeight - cropY),
      };

      console.log('Crop configuration:', cropConfig);

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photoUri,
        [
          { crop: cropConfig },
          { resize: { width: 800, height: 800 } } // Уменьшим размер для стабильности
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      console.log('Image processed successfully');
      return manipulatedImage.base64 || null;

    } catch (error) {
      console.error('Image processing error:', error);
      return null;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || !isCameraReady || isProcessing) {
      console.log('Camera not ready or processing');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Taking picture...');

      // Добавляем задержку для стабильности
      await new Promise(resolve => setTimeout(resolve, 100));

      // Проверяем, что камера все еще доступна
      if (!cameraRef.current) {
        throw new Error('Камера қолжетімді емес');
      }

      // Упрощенные настройки фото
      const photoOptions = {
        quality: 0.7,
        base64: false,
        exif: false,
        skipProcessing: true, // Отключаем обработку для стабильности
      };

      console.log('Taking picture with options:', photoOptions);

      const photo = await cameraRef.current.takePictureAsync(photoOptions);

      if (!photo?.uri) {
        throw new Error('Сурет алынбады');
      }

      console.log('Photo taken successfully:', photo.uri);
      console.log('Photo dimensions:', photo.width, 'x', photo.height);

      // Обрабатываем изображение
      const processedImage = await processAndCropImage(
        photo.uri,
        photo.width,
        photo.height
      );

      if (!processedImage) {
        throw new Error('Суретті өңдеу сәтсіз аяқталды');
      }

      console.log('Starting AI analysis...');

      // Анализируем изображение с таймаутом
      const analysisPromise = aiAnalysisService.analyzeImage(processedImage);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Талдау уақыты асқындЫ')), 30000)
      );

      const analysisResult = await Promise.race([analysisPromise, timeoutPromise]);

      // Проверяем качество распознавания
      if (analysisResult.confidence < 40) {
        Alert.alert(
          'Талдау нәтижесі нашар',
          `AI жүйесі өнімді толық танымады (сенімділік: ${analysisResult.confidence}%).`,
          [
            {
              text: 'Қайта түсіру',
              onPress: () => setIsProcessing(false),
              style: 'cancel'
            },
            {
              text: 'Сонда да көрсету',
              onPress: () => saveAndNavigate(analysisResult),
              style: 'default'
            }
          ]
        );
        return;
      }

      // Сохраняем и переходим
      await saveAndNavigate(analysisResult);

    } catch (error: any) {
      console.error('Scanning error:', error);

      let errorMessage = 'Өнімді сканерлеу кезінде қате орын алды';

      if (error.message.includes('Failed to capture image')) {
        errorMessage = 'Суретті түсіру сәтсіз аяқталды. Камераны қайта іске қосып көріңіз.';
        setCameraError(errorMessage);
      } else if (error.message.includes('Талдау уақыты асқындЫ')) {
        errorMessage = 'Талдау уақыты асқындЫ. Интернет байланысын тексеріп, қайталап көріңіз.';
      } else if (error.message.includes('Камера қолжетімді емес')) {
        errorMessage = 'Камера қолжетімді емес. Басқа қолданбаны жауып, қайталап көріңіз.';
        setCameraError(errorMessage);
      }

      if (!error.message.includes('Failed to capture image') && !error.message.includes('Камера қолжетімді емес')) {
        Alert.alert(
          'Сканерлеу сәтсіз',
          errorMessage,
          [{
            text: 'Түсінікті',
            onPress: () => setIsProcessing(false),
            style: 'default'
          }]
        );
      }
    }
  };

  const saveAndNavigate = async (analysisResult: any) => {
    try {
      // Сохраняем результаты
      const scanId = `scan_${Date.now()}`;
      await storage.setItem('current_analysis', JSON.stringify(analysisResult));
      await storage.setItem('last_analysis_time', Date.now().toString());
      await storage.setItem('last_scan_id', scanId);

      console.log('Analysis completed successfully');

      // Переходим к результатам
      router.push({
        pathname: '/(tabs)/analytics',
        params: {
          hasNewAnalysis: 'true',
          timestamp: Date.now().toString()
        }
      });

    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Қате', 'Деректерді сақтау кезінде қате орын алды');
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === 'off' ? 'on' : 'off');
  };

  const goBack = () => {
    if (!isProcessing) {
      router.back();
    }
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setIsCameraReady(true);
  };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    setCameraError('Камераны іске қосу кезінде қате орын алды');
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={handleCameraReady}
        onMountError={handleCameraError}
        ratio="16:9"
        autofocus="on"
        flash={flashMode}
      >
        {/* Хедер */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, isProcessing && styles.disabledButton]}
            onPress={goBack}
            disabled={isProcessing}
          >
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          <Text style={styles.title}>Сканерлеу</Text>

          <TouchableOpacity
            style={[styles.controlButton, isProcessing && styles.disabledButton]}
            onPress={toggleFlash}
            disabled={isProcessing}
          >
            {flashMode === 'on' ? (
              <Flashlight size={24} color="#ffffff" />
            ) : (
              <FlashlightOff size={24} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Центр сканирования */}
        <View style={[styles.scanFrame, { top: FRAME_TOP }]}>
          <View style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          <Text style={styles.scanText}>
            Өнімді сканерлеу үшін оны рамка ішіне орналастырыңыз
          </Text>
        </View>

        {/* Футер */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              isProcessing && styles.disabledButton,
              !isCameraReady && styles.disabledButton
            ]}
            onPress={takePicture}
            disabled={isProcessing || !isCameraReady}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <View style={styles.scanButtonInner} />
            )}
          </TouchableOpacity>

          <Text style={styles.footerText}>
            {isCameraReady
              ? 'Түсіру үшін түймені басыңыз'
              : 'Камера дайындалуда...'
            }
          </Text>
        </View>

        {/* Оверлей обработки */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingContent}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={styles.processingText}>Өнімді талдау...</Text>
              <Text style={styles.processingSubText}>Бір сәт күтіңіз</Text>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  scanFrame: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frame: {
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#10b981',
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  scanText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
    maxWidth: '90%',
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 12,
  },
  scanButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#10b981',
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
    borderRadius: 16,
  },
  processingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubText: {
    color: '#d1d5db',
    fontSize: 14,
    opacity: 0.8,
  },
});