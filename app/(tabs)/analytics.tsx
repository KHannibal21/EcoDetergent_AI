import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BarChart3, AlertTriangle, CheckCircle, XCircle, Leaf, Shield, RotateCcw } from 'lucide-react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { storage } from '../utils/storage';

// Интерфейс для результатов анализа (должен совпадать с aiAnalysisService.ts)
interface AnalysisResult {
  productName: string;
  brand: string;
  phLevel: number;
  riskLevel: 'high' | 'medium' | 'low';
  composition: {
    surfactants: string;
    phosphates: string;
    fragrances: string;
    bleaches: string;
    enzymes: string;
  };
  environmentalImpact: {
    waterPollution: number;
    biodegradability: number;
    toxicity: number;
  };
  healthRisks: string[];
  recommendations: string[];
  alternatives: string[];
  confidence: number;
}

export default function AnalysisScreen() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewAnalysis, setHasNewAnalysis] = useState(false);
  const params = useLocalSearchParams();

  // Основной эффект для загрузки данных
  useEffect(() => {
    loadAnalysisData();
  }, []);

  // Эффект для обработки параметров навигации
  useEffect(() => {
    if (params?.hasNewAnalysis === 'true') {
      setHasNewAnalysis(true);
      // Перезагружаем данные при получении параметра о новом анализе
      loadAnalysisData();
      // Сбрасываем параметр после использования
      // router.setParams не работает в Expo Router, используем альтернативный подход
    }
  }, []);

  // Обновляем данные при каждом фокусе на экране
  useFocusEffect(
    useCallback(() => {
      console.log('AnalysisScreen focused, reloading data...');
      loadAnalysisData();
    }, [])
  );

  const loadAnalysisData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading analysis data from storage...');

      // Пытаемся получить последний анализ из хранилища
      const currentAnalysis = await storage.getItem('current_analysis');

      if (currentAnalysis) {
        console.log('Analysis found:', currentAnalysis);
        const parsedAnalysis = JSON.parse(currentAnalysis);
        setAnalysis(parsedAnalysis);
      } else {
        console.log('No analysis data found');
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      Alert.alert('Қате', 'Талдау деректерін жүктеу кезінде қате орын алды');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScan = () => {
    router.push('/scan/camera');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high': return <XCircle size={20} color="#ef4444" />;
      case 'medium': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'low': return <CheckCircle size={20} color="#10b981" />;
    }
  };

  // Рассчитываем эко-рейтинг на основе данных анализа
  const calculateEcoScore = (analysis: AnalysisResult): number => {
    const { environmentalImpact, riskLevel, phLevel } = analysis;

    let score = 100;

    // Вычитаем баллы за воздействие на окружающую среду
    score -= environmentalImpact.waterPollution * 0.3;
    score -= environmentalImpact.toxicity * 0.4;
    score += environmentalImpact.biodegradability * 0.3;

    // Вычитаем баллы за уровень риска
    if (riskLevel === 'high') score -= 30;
    else if (riskLevel === 'medium') score -= 15;

    // Вычитаем баллы за высокий pH
    if (phLevel > 10) score -= 10;
    else if (phLevel > 9) score -= 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getEcoRating = (score: number) => {
    if (score >= 80) return { text: 'Өте жақсы', color: '#10b981' };
    if (score >= 60) return { text: 'Жақсы', color: '#22c55e' };
    if (score >= 40) return { text: 'Қанағаттанарлық', color: '#f59e0b' };
    return { text: 'Нашар', color: '#ef4444' };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingTitle}>Талдау жүктелуде...</Text>
        <Text style={styles.loadingText}>Өнім деректерін дайындау</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.emptyContainer}>
        <BarChart3 size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Талдау деректері жоқ</Text>
        <Text style={styles.emptyText}>
          Өнімнің құрамы мен экологиялық сипаттамасын алу үшін сканерлеңіз
        </Text>
        <TouchableOpacity style={styles.scanButton} onPress={handleNewScan}>
          <Text style={styles.scanButtonText}>Жаңа сканерлеу</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ecoScore = calculateEcoScore(analysis);
  const ecoRating = getEcoRating(ecoScore);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Уведомление о новом анализе */}
      {hasNewAnalysis && (
        <View style={styles.successBanner}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.successText}>Жаңа талдау сәтті аяқталды!</Text>
          <TouchableOpacity
            onPress={() => setHasNewAnalysis(false)}
            style={styles.closeBannerButton}
          >
            <XCircle size={16} color="#10b981" />
          </TouchableOpacity>
        </View>
      )}

      {/* Заголовок */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Өнімді талдау</Text>
          <Text style={styles.subtitle}>ЖСН егжей-тегжейлі есебі</Text>
        </View>
        <TouchableOpacity style={styles.newScanButton} onPress={handleNewScan}>
          <RotateCcw size={20} color="#10b981" />
          <Text style={styles.newScanText}>Жаңа сканерлеу</Text>
        </TouchableOpacity>
      </View>

      {/* Информация о продукте */}
      <View style={styles.card}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{analysis.productName}</Text>
            <Text style={styles.productBrand}>{analysis.brand}</Text>
            <Text style={styles.confidenceText}>
              Сенімділік: {analysis.confidence}%
            </Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(analysis.riskLevel)}20` }]}>
            {getRiskIcon(analysis.riskLevel)}
            <Text style={[styles.riskText, { color: getRiskColor(analysis.riskLevel) }]}>
              {analysis.riskLevel === 'high' ? 'ЖОҒАРЫ ТӘУЕКЕЛ' :
               analysis.riskLevel === 'medium' ? 'ОРТАША ТӘУЕКЕЛ' : 'ТӘУЕКЕЛСІЗ'}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analysis.phLevel.toFixed(1)}</Text>
            <Text style={styles.statLabel}>pH деңгейі</Text>
            <Text style={[styles.statSubtext, { color: analysis.phLevel > 9 ? '#ef4444' : '#10b981' }]}>
              {analysis.phLevel > 9 ? 'Сілтілі' : analysis.phLevel < 7 ? 'Қышқылды' : 'Бейтарап'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: ecoRating.color }]}>
              {ecoScore}%
            </Text>
            <Text style={styles.statLabel}>Эко-рейтинг</Text>
            <Text style={[styles.statSubtext, { color: ecoRating.color }]}>
              {ecoRating.text}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Leaf size={24} color={getRiskColor(analysis.riskLevel)} />
            <Text style={styles.statLabel}>Әсері</Text>
            <Text style={[styles.statSubtext, { color: getRiskColor(analysis.riskLevel) }]}>
              {analysis.riskLevel === 'high' ? 'Жоғары' :
               analysis.riskLevel === 'medium' ? 'Орташа' : 'Төмен'}
            </Text>
          </View>
        </View>
      </View>

      {/* Химический состав */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Химиялық құрамы</Text>
        {Object.entries(analysis.composition).map(([key, value]) => (
          <View key={key} style={styles.compositionRow}>
            <Text style={styles.compositionLabel}>
              {key === 'surfactants' && 'ПАС'}
              {key === 'phosphates' && 'Фосфаттар'}
              {key === 'fragrances' && 'Хош иіс берушілер'}
              {key === 'bleaches' && 'Ағартқыштар'}
              {key === 'enzymes' && 'Ферменттер'}
            </Text>
            <Text style={styles.compositionValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Воздействие на окружающую среду */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Қоршаған ортаға әсері</Text>
        {Object.entries(analysis.environmentalImpact).map(([key, value]) => (
          <View key={key} style={styles.impactRow}>
            <View style={styles.impactInfo}>
              <Shield size={16} color="#6b7280" />
              <Text style={styles.impactLabel}>
                {key === 'waterPollution' && 'Судың ластануы'}
                {key === 'biodegradability' && 'Биологиялық ыдырау'}
                {key === 'toxicity' && 'Улылық'}
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${value}%`,
                    backgroundColor: value > 70 ? '#ef4444' : value > 40 ? '#f59e0b' : '#10b981'
                  }
                ]}
              />
              <Text style={styles.progressText}>{value}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Риски для здоровья */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Денсаулыққа тәуекелдер</Text>
        {analysis.healthRisks.map((risk, index) => (
          <View key={index} style={styles.riskItem}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={styles.riskItemText}>{risk}</Text>
          </View>
        ))}
      </View>

      {/* Рекомендации */}
      <View style={[styles.card, styles.recommendationsCard]}>
        <Text style={styles.cardTitle}>Ұсыныстар</Text>
        {analysis.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.recommendationText}>{rec}</Text>
          </View>
        ))}
      </View>

      {/* Альтернативы */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Экологиялық баламалар</Text>
        {analysis.alternatives.map((alt, index) => (
          <Text key={index} style={styles.alternativeText}>• {alt}</Text>
        ))}
      </View>

      {/* Время анализа */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          AI талдауымен жасалған • Сенімділік: {analysis.confidence}%
        </Text>
      </View>
    </ScrollView>
  );
}

// Стили остаются без изменений...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  scanButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
    position: 'relative'
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8
  },
  closeBannerButton: {
    position: 'absolute',
    right: 12,
    padding: 4
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2
  },
  newScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7'
  },
  newScanText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  productBrand: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4
  },
  confidenceText: {
    fontSize: 12,
    color: '#9ca3af'
  },
  riskBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  riskText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2
  },
  statSubtext: {
    fontSize: 11,
    fontWeight: '600'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16
  },
  compositionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  compositionLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },
  compositionValue: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  impactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  impactLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8
  },
  progressContainer: {
    width: 100,
    height: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  progressBar: {
    height: '100%',
    borderRadius: 10
  },
  progressText: {
    position: 'absolute',
    right: 8,
    top: 2,
    fontSize: 10,
    color: '#374151',
    fontWeight: '600'
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  riskItemText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  recommendationsCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    borderWidth: 1
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  recommendationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20
  },
  alternativeText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20
  },
  footer: {
    padding: 20,
    alignItems: 'center'
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center'
  }
});