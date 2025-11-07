import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Dimensions } from 'react-native';
import { Leaf, Recycle, Zap, Droplets, Shield, BookOpen, Award, TrendingUp, ShoppingBag, Heart, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function EcoScreen() {
  const ecoProducts = [
    {
      id: 1,
      name: 'Экологиялық ұнтақ',
      description: 'Табиғи негізгі кір жуғыш порошок',
      benefits: ['Фосфатсыз', 'Биологиялық ыдырайтын', 'Гипоаллергенді'],
      usage: '1 кірге 2 ас қасық',
      image: '🧴',
      rating: 4.8,
      searchQuery: 'экологиялық кір жуғыш порошок'
    },
    {
      id: 2,
      name: 'Жуу гелі',
      description: 'Концентрацияланған эко-гель',
      benefits: ['Су үнемдейтін', 'Жоғары тиімділік', 'Жұмсақ әсер'],
      usage: '1 кірге 30 мл',
      image: '🧪',
      rating: 4.6,
      searchQuery: 'экологиялық гель для стирки'
    },
    {
      id: 3,
      name: 'Ыдыс-аяқ гелі',
      description: 'Табиғи компоненттер негізіндегі ыдыс жуғыш гель',
      benefits: ['Улы емес', 'Теріге қауіпсіз', 'Тез шаюға болады'],
      usage: '5-10 тамшы ыдыс жуғыш губкаға',
      image: '🍽️',
      rating: 4.7,
      searchQuery: 'экологиялық гель для посуды'
    },
    {
      id: 4,
      name: 'Сабын жаңғақтары',
      description: 'Табиғи сапонин қамтитын жуғыш жаңғақтар',
      benefits: ['100% биологиялық ыдырайтын', 'Гипоаллергенді', '5 рет қолдануға болады'],
      usage: '1 кірге 5-6 жаңғак',
      image: '🌰',
      rating: 4.5,
      searchQuery: 'сабын жаңғақтары сатып алу'
    },
    {
      id: 5,
      name: 'Балқытатын таблетки',
      description: 'Кір жуғыш машинаға арналған эко-таблетки',
      benefits: ['Дәл дозалау', 'Пластик қаптамасыз', 'Толық ыдырайды'],
      usage: '1 таблетка 1 кірге',
      image: '💊',
      rating: 4.9,
      searchQuery: 'экологиялық кір жуғыш таблетки'
    },
    {
      id: 6,
      name: 'Кондиционер',
      description: 'Табиғи кондиционер киімге арналған',
      benefits: ['Химиялық жұмсартқышсыз', 'Табиғи хош иіс', 'Теріге қауіпсіз'],
      usage: '1 кірге 20 мл',
      image: '👕',
      rating: 4.4,
      searchQuery: 'экологиялық кондиционер для белья'
    },
    {
      id: 7,
      name: 'Көпмақсатты тазартқыш',
      description: 'Үйге арналған көпмақсатты эко-тазартқыш',
      benefits: ['Барлық беттерге', 'Улы емес', 'Балаларға қауіпсіз'],
      usage: '1:10 сумен сұйылту',
      image: '🧹',
      rating: 4.6,
      searchQuery: 'көпмақсатты экологиялық тазартқыш'
    },
    {
      id: 8,
      name: 'Шәйнек тазартқышы',
      description: 'Табиғи негізді шәйнек және кофеварка тазартқышы',
      benefits: ['Лимон қышқылы негізінде', 'Пластик қаптамасыз', 'Толық биологиялық ыдырау'],
      usage: '1 доза 1 литр суға',
      image: '☕',
      rating: 4.7,
      searchQuery: 'экологиялық шәйнек тазартқыш'
    }
  ];

  const ecoFacts = [
    {
      id: 1,
      icon: '💧',
      title: 'Су үнемдеу',
      fact: 'Дұрыс дозалау арқылы әр кір жуу кезінде 30 литр суға дейін үнемдеуге болады',
      tip: 'Өндірушінің ұсынылған мөлшерін пайдаланыңыз'
    },
    {
      id: 2,
      title: 'Биологиялық ыдырау',
      fact: 'Дұрыс таңдалған жуғыш заттар 28 күн ішінде 90% биологиялық ыдырайды',
      tip: 'ECOCERT сертификаты бар өнімдерді іздеңіз',
      icon: '🌿'
    },
    {
      id: 3,
      title: 'Энергия тиімділігі',
      fact: '30°C температурада жуу 40°C-қа қарағанда 40% аз энергия жұмсайды',
      tip: 'Төмен температурада жууға болатын өнімдерді таңдаңыз',
      icon: '⚡'
    },
    {
      id: 4,
      title: 'Денсаулық қауіпсіздігі',
      fact: 'Фосфатсыз жуғыш заттар терінің аллергиясы тәуекелін 60% азайтады',
      tip: 'Құрамында фосфат жоқ өнімдерді пайдаланыңыз',
      icon: '🛡️'
    }
  ];

  const importancePoints = [
    {
      icon: '💚',
      title: 'Денсаулықты қорғау',
      description: 'Химиялық қалдықтар теріге және тыныс алу жолдарына зиянды'
    },
    {
      icon: '🌍',
      title: 'Қоршаған ортаны қорғау',
      description: 'Фосфаттар мен ПАС су ағындарын ластайды'
    },
    {
      icon: '💰',
      title: 'Үнемдеу',
      description: 'Дұрыс дозалау және табиғи баламалар арзан'
    },
    {
      icon: '🔬',
      title: 'Ұрпақтардың болашағы',
      description: 'Таза су ресурстарын сақтап қалу'
    }
  ];

  const productCategories = [
    {
      name: 'Порошоктар',
      icon: '🧴',
      count: '3 түрі'
    },
    {
      name: 'Гельдер',
      icon: '🧪',
      count: '4 түрі'
    },
    {
      name: 'Таблеткилар',
      icon: '💊',
      count: '2 түрі'
    },
    {
      name: 'Табиғи өнімдер',
      icon: '🌿',
      count: '5 түрі'
    }
  ];

  const openProductSearch = (searchQuery: string) => {
    const encodedQuery = encodeURIComponent(searchQuery);
    Linking.openURL(`https://www.google.com/search?q=${encodedQuery}`);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              { color: star <= rating ? '#f59e0b' : '#d1d5db' }
            ]}
          >
            {star <= rating ? '★' : '☆'}
          </Text>
        ))}
        <Text style={styles.ratingText}>({rating})</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Тақырып */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Leaf size={32} color="#10b981" />
          <Text style={styles.title}>Эко Білім</Text>
          <Text style={styles.subtitle}>Қауіпсіз жуғыш заттар мен тазартқыштар</Text>
        </View>
      </View>

      {/* Категориялар */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Recycle size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Өнім категориялары</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {productCategories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Негізгі эко-фактілер */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <BookOpen size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Негізгі эко-фактілер</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Күнделікті таңдаударыңызды жақсартуға көмектесетін қарапайым ақиқаттар
        </Text>

        <View style={styles.factsGrid}>
          {ecoFacts.map((fact) => (
            <View key={fact.id} style={styles.factCard}>
              <Text style={styles.factIcon}>{fact.icon}</Text>
              <Text style={styles.factTitle}>{fact.title}</Text>
              <Text style={styles.factText}>{fact.fact}</Text>
              <View style={styles.tipContainer}>
                <Text style={styles.tipLabel}>Кеңес:</Text>
                <Text style={styles.tipText}>{fact.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Ұсынылатын өнімдер */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ShoppingBag size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Ұсынылатын эко-өнімдер</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Сіздің денсаулығыңыз және қоршаған орта үшін қауіпсіз баламалар
        </Text>

        <View style={styles.productsGrid}>
          {ecoProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => openProductSearch(product.searchQuery)}
            >
              <View style={styles.productHeader}>
                <Text style={styles.productIcon}>{product.image}</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                  {renderStars(product.rating)}
                </View>
              </View>

              <View style={styles.benefitsContainer}>
                {product.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitDot}>•</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.usageContainer}>
                <Text style={styles.usageLabel}>Қолдану тәсілі:</Text>
                <Text style={styles.usageText}>{product.usage}</Text>
              </View>

              <View style={styles.buyButton}>
                <ShoppingBag size={16} color="#10b981" />
                <Text style={styles.buyButtonText}>Сатып алу</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Неге маңызды? */}
      <View style={[styles.section, styles.importanceSection]}>
        <View style={styles.sectionHeader}>
          <Target size={20} color="#10b981" />
          <Text style={styles.sectionTitle}>Неге эко-таңдау маңызды?</Text>
        </View>

        <View style={styles.importanceGrid}>
          {importancePoints.map((point, index) => (
            <View key={index} style={styles.importanceCard}>
              <Text style={styles.importanceIcon}>{point.icon}</Text>
              <View style={styles.importanceContent}>
                <Text style={styles.importanceTitle}>{point.title}</Text>
                <Text style={styles.importanceDescription}>{point.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.conclusionContainer}>
          <Heart size={20} color="#10b981" />
          <Text style={styles.conclusionText}>
            Әрбір эко-таңдау - бұл сіздің денсаулығыңызға және біздің планетамызға жасалған инвестиция
          </Text>
        </View>
      </View>

      {/* Экологиялық әсер */}
      <View style={[styles.section, styles.impactSection]}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#ffffff" />
          <Text style={[styles.sectionTitle, styles.whiteText]}>Экологиялық әсер</Text>
        </View>

        <View style={styles.impactList}>
          <View style={styles.impactItem}>
            <View style={styles.impactMetric}>
              <Text style={styles.impactMetricText}>1 кг фосфат</Text>
            </View>
            <View style={styles.impactArrow}>
              <Text style={styles.impactArrowText}>→</Text>
            </View>
            <View style={styles.impactResult}>
              <Text style={styles.impactResultText}>1,000 литр суды ластайды</Text>
            </View>
          </View>
          <View style={styles.impactItem}>
            <View style={styles.impactMetric}>
              <Text style={styles.impactMetricText}>Дұрыс дозалау</Text>
            </View>
            <View style={styles.impactArrow}>
              <Text style={styles.impactArrowText}>→</Text>
            </View>
            <View style={styles.impactResult}>
              <Text style={styles.impactResultText}>30% өнім үнемдейді</Text>
            </View>
          </View>
          <View style={styles.impactItem}>
            <View style={styles.impactMetric}>
              <Text style={styles.impactMetricText}>Эко-балама</Text>
            </View>
            <View style={styles.impactArrow}>
              <Text style={styles.impactArrowText}>→</Text>
            </View>
            <View style={styles.impactResult}>
              <Text style={styles.impactResultText}>50% CO₂ төмендетеді</Text>
            </View>
          </View>
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
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    paddingTop: 20,
  },
  headerContent: {
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20
  },
  section: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8
  },
  whiteText: {
    color: '#ffffff'
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20
  },
  // Категориялар стильдері
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7'
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4
  },
  categoryCount: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center'
  },
  factsGrid: {
    gap: 12
  },
  factCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  factIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8
  },
  factText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8
  },
  tipContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7'
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4
  },
  tipText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16
  },
  productsGrid: {
    gap: 16
  },
  productCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  productIcon: {
    fontSize: 32,
    marginRight: 12
  },
  productInfo: {
    flex: 1
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  productDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 18
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  star: {
    fontSize: 14,
    marginRight: 2
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6
  },
  benefitsContainer: {
    marginBottom: 12
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  benefitDot: {
    fontSize: 12,
    color: '#10b981',
    marginRight: 6,
    marginTop: 1
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 16
  },
  usageContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  usageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4
  },
  usageText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic'
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  importanceSection: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
    borderWidth: 1
  },
  importanceGrid: {
    gap: 12,
    marginBottom: 16
  },
  importanceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  importanceIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
    flexShrink: 0,
  },
  importanceContent: {
    flex: 1,
    flexDirection: 'column',
    paddingRight: 8,
    flexShrink: 1,
  },
  importanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  importanceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  conclusionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  conclusionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
    fontStyle: 'italic'
  },
  impactSection: {
    backgroundColor: '#10b981',
  },
  impactList: {
    gap: 12
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  impactMetric: {
    flex: 2,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 6
  },
  impactMetricText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center'
  },
  impactArrow: {
    flex: 1,
    alignItems: 'center'
  },
  impactArrowText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold'
  },
  impactResult: {
    flex: 2,
    backgroundColor: '#059669',
    padding: 8,
    borderRadius: 6
  },
  impactResultText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center'
  }
});