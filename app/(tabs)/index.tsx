import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Link } from 'expo-router';
import { Camera, BarChart3, Leaf, Shield, Zap, Sparkles } from 'lucide-react-native';

export default function DashboardScreen() {
  const quickActions = [
    {
      title: 'Сканерлеу',
      description: 'Өнімді камерамен сканерлеп, қауіпсіздігін тексеру',
      icon: Camera,
      color: '#10b981',
      href: '/scan/camera'
    },
    {
      title: 'Талдау',
      description: 'Сканерлеу нәтижелерін қарау және талдау',
      icon: BarChart3,
      color: '#8b5cf6',
      href: '/(tabs)/analytics'
    },
    {
      title: 'Эко Білім',
      description: 'Экологиялық таза өмір салты туралы білім алу',
      icon: Leaf,
      color: '#06b6d4',
      href: '/(tabs)/eco'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'AI Технологиясы',
      description: 'Жасанды интеллект жуғыш заттардың құрамын талдайды'
    },
    {
      icon: Zap,
      title: 'Жылдам Талдау',
      description: 'Бірнеше секунд ішінде нәтиже алыңыз'
    },
    {
      icon: Leaf,
      title: 'Эко Ұсыныстар',
      description: 'Қауіпсіз альтернативаларды ұсынамыз'
    },
    {
      icon: Sparkles,
      title: 'Қарапайым Интерфейс',
      description: 'Пайдалану оңай және интуитивті'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Header */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.logoBadge}>
            <Shield size={32} color="#10b981" />
          </View>
          <Text style={styles.heroTitle}>EcoDetergent AI</Text>
          <Text style={styles.heroSubtitle}>
            Жуғыш заттардың қауіпсіздігін тексеруге арналған интеллектуалды қолданба
          </Text>
        </View>
        <View style={styles.heroPattern} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Не істей аласыз?</Text>
          <View style={styles.titleLine} />
        </View>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href} asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                  <action.icon size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc}>{action.description}</Text>
                <View style={[styles.actionArrow, { backgroundColor: action.color }]} />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Негізгі Ерекшеліктер</Text>
          <View style={styles.titleLine} />
        </View>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <feature.icon size={24} color="#10b981" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Қалай Жұмыс Істейді?</Text>
          <View style={styles.titleLine} />
        </View>
        <View style={styles.processContainer}>
          <View style={styles.processStep}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Сканерлеу</Text>
              <Text style={styles.stepText}>
                Өнімді камера арқылы сканерлеңіз. Қаптаманың аты мен ингредиенттері толық көрінуі керек.
              </Text>
            </View>
          </View>

          <View style={styles.processConnector} />

          <View style={styles.processStep}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>AI Талдау</Text>
              <Text style={styles.stepText}>
                Жасанды интеллект өнімнің құрамын талдап, қауіпті химиялық заттарды анықтайды.
              </Text>
            </View>
          </View>

          <View style={styles.processConnector} />

          <View style={styles.processStep}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Нәтиже</Text>
              <Text style={styles.stepText}>
                Толық талдау нәтижесін алыңыз және қауіпсіз альтернативалармен танысыңыз.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaContent}>
          <View style={styles.ctaIconContainer}>
            <Shield size={32} color="#ffffff" />
          </View>
          <Text style={styles.ctaTitle}>Денсаулығыңызды қорғаңыз</Text>
          <Text style={styles.ctaText}>
            Әрбір сканерлеу - бұл сіздің және отбасыңыздың денсаулығына инвестиция
          </Text>
          <Link href="/scan/camera" asChild>
            <TouchableOpacity style={styles.ctaButton}>
              <Camera size={20} color="#000000" />
              <Text style={styles.ctaButtonText}>Қазір сканерлеу</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  heroSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 12
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300
  },
  heroPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: '#10b981',
    opacity: 0.05,
    borderRadius: 100
  },
  section: {
    padding: 24
  },
  sectionHeader: {
    marginBottom: 24,
    alignItems: 'flex-start'
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  titleLine: {
    width: 60,
    height: 4,
    backgroundColor: '#10b981',
    borderRadius: 2
  },
  actionsGrid: {
    gap: 16
  },
  actionCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative'
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  actionDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  actionArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%', // Четко 2 колонки
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 140, // Фиксированная высота для всех карточек
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'left',
  },
  featureDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    textAlign: 'left',
    flex: 1,
  },
  processContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  stepContent: {
    flex: 1,
    paddingBottom: 32
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20
  },
  processConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 19,
    marginBottom: 12
  },
  ctaSection: {
    padding: 24,
    paddingBottom: 60, // Увеличили отступ снизу для иконки
    marginBottom: 20
  },
  ctaContent: {
    backgroundColor: '#10b981',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative'
  },
  ctaIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center'
  },
  ctaText: {
    fontSize: 16,
    color: '#d1fae5',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  ctaButtonText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: 'bold'
  }
});