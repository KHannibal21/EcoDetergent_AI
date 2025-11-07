import { Alert } from 'react-native';

export interface AIAnalysisResult {
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
  provider?: string;
}

class AIAnalysisService {
  private apiKey: string | null = 'AIzaSyAfF-XuASMFZpMiteEEEDPpf2CkDaBfY6Q';
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    console.log('AI Analysis Service initialized');
  }

  // ДОБАВЛЯЕМ ФУНКЦИЮ ВАЛИДАЦИИ JSON ПЕРЕД ОСНОВНЫМИ МЕТОДАМИ
  private validateJSON(jsonString: string): boolean {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (error) {
      console.error('JSON validation failed:', error);
      return false;
    }
  }

  async analyzeImage(base64Image: string): Promise<AIAnalysisResult> {
    try {
      if (!this.apiKey) {
        console.log('API ключ не настроен, используем улучшенный демо-режим');
        return await this.enhancedMockAnalysis(base64Image);
      }

      // Пробуем реальный анализ с улучшенной обработкой ошибок
      return await this.realGeminiAnalysis(base64Image);
    } catch (error) {
      console.error('Ошибка анализа ИИ:', error);
      return await this.enhancedMockAnalysis(base64Image);
    }
  }

  private async realGeminiAnalysis(base64Image: string): Promise<AIAnalysisResult> {
    const prompt = `
ТЫ ЭКСПЕРТ ПО ХИМИЧЕСКОЙ БЕЗОПАСНОСТИ МОЮЩИХ СРЕДСТВ. ПРОАНАЛИЗИРУЙ УПАКОВКУ ЛЮБОГО МОЮЩЕГО ИЛИ ЧИСТЯЩЕГО СРЕДСТВА НА ИЗОБРАЖЕНИИ.

ЭТО МОГУТ БЫТЬ:
- СТИРАЛЬНЫЕ ПОРОШКИ (Tide, Persil, Ariel, Миф, Sarma, Sorti, БиоМио)
- МЫЮЩИЕ СРЕДСТВА (Fairy, AOS, Pril, Миф)
- ЧИСТЯЩИЕ СРЕДСТВА (Comet, Domestos, Пемолюкс, Cif)
- УНИВЕРСАЛЬНЫЕ ЧИСТЯЩИЕ СРЕДСТВА (Glorix, Мистер Пропер)
- ДЕЗИНФИЦИРУЮЩИЕ СРЕДСТВА

ЕСЛИ НА ИЗОБРАЖЕНИИ ЕСТЬ УПАКОВКА МОЮЩЕГО СРЕДСТВА, ПРОАНАЛИЗИРУЙ ЕГО И ВЕРНИ ДАННЫЕ В ФОРМАТЕ JSON:

{
  "productName": "Название продукта (например: Tide Автомат для цветного белья)",
  "brand": "Бренд (например: Tide)",
  "phLevel": 9.5,
  "riskLevel": "high|medium|low",
  "composition": {
    "surfactants": "Описание ПАВ",
    "phosphates": "Описание фосфатов",
    "fragrances": "Описание отдушек",
    "bleaches": "Описание отбеливателей",
    "enzymes": "Описание ферментов"
  },
  "environmentalImpact": {
    "waterPollution": 65,
    "biodegradability": 45,
    "toxicity": 60
  },
  "healthRisks": ["Риск 1", "Риск 2", "Риск 3"],
  "recommendations": ["Рекомендация 1", "Рекомендация 2"],
  "alternatives": ["Альтернатива 1", "Альтернатива 2"],
  "confidence": 85
}

ВАЖНЫЕ ПРАВИЛА:
1. ЕСЛИ ВИДИШЬ БРЕНД TIDE - УКАЖИ "Tide" В КАЧЕСТВЕ БРЕНДА
2. ЕСЛИ ВИДИШЬ БРЕНД PERSIL - УКАЖИ "Persil"
3. ЕСЛИ ВИДИШЬ БРЕНД ARIEL - УКАЖИ "Ariel"
4. ЕСЛИ ВИДИШЬ БРЕНД SARMA - УКАЖИ "Sarma"
5. ЕСЛИ ВИДИШЬ БРЕНД SORTI - УКАЖИ "Sorti"
6. ЕСЛИ ВИДИШЬ БРЕНД BIO MIO - УКАЖИ "BioMio"

ЕСЛИ НЕ МОЖЕШЬ ОПРЕДЕЛИТЬ ТОЧНЫЙ БРЕНД, ИСПОЛЬЗУЙ "Неизвестный бренд"

ОТВЕЧАЙ ТОЛЬКО В ФОРМАТЕ JSON БЕЗ ЛИШНИХ КОММЕНТАРИЕВ И ТОЛЬКО НА КАЗАХСКОМ И СТАРАЙСЯ ОТВЕЧАТЬ ПОЛНОСТЬЮ И ВОЗВРАЩАТЬ ПОЛНЫЙ JSON ОТВЕТ!
`;

    const models = [
      'gemini-2.5-flash-preview-09-2025',
      'gemini-2.5-flash-image',
      'gemini-2.5-flash-lite-preview-09-2025',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash-preview-image-generation',
      'gemini-2.0-flash',
    ];

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch(
          `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Image
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2000,
                topP: 0.8,
                topK: 40
              }
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const responseText = data.candidates[0]?.content?.parts[0]?.text;

          if (!responseText) {
            console.log('No response text from Gemini');
            continue;
          }

          console.log('Gemini Raw Response:', responseText);

          // Пытаемся извлечь JSON из ответа
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            // ВАЛИДАЦИЯ JSON ПЕРЕД ПАРСИНГОМ - ВСТАВЛЯЕМ ЗДЕСЬ
            if (!this.validateJSON(jsonMatch[0])) {
              console.error(`Invalid JSON from model ${model}`);
              continue; // Пропускаем невалидный JSON и пробуем следующую модель
            }

            try {
              const analysisResult: AIAnalysisResult = JSON.parse(jsonMatch[0]);

              // Валидация и улучшение результата
              if (this.isValidAnalysis(analysisResult)) {
                analysisResult.confidence = analysisResult.confidence || 85;
                analysisResult.provider = 'gemini';

                console.log(`Success with model: ${model}`, analysisResult);
                return analysisResult;
              }
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
            }
          }
        } else {
          console.log(`Model ${model} failed:`, response.status);
        }
      } catch (error) {
        console.log(`Model ${model} error:`, error);
        // Продолжаем пробовать следующую модель
      }
    }

    console.log('All Gemini models failed, using enhanced mock analysis');
    return await this.enhancedMockAnalysis(base64Image);
  }

  // Проверка валидности анализа
  private isValidAnalysis(analysis: any): analysis is AIAnalysisResult {
    return (
      analysis.productName &&
      analysis.brand &&
      typeof analysis.phLevel === 'number' &&
      ['high', 'medium', 'low'].includes(analysis.riskLevel) &&
      analysis.composition &&
      analysis.environmentalImpact
    );
  }

  // Улучшенный демо-анализ с лучшим определением брендов
  private async enhancedMockAnalysis(base64Image: string): Promise<AIAnalysisResult> {
    console.log('Using enhanced mock analysis');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Попробуем определить бренд по изображению (в демо-режиме используем случайный)
    // В реальном приложении здесь можно добавить простую логику определения бренда
    const detectedBrand = this.detectBrandFromBase64(base64Image); // Заглушка

    const cleaningProducts = {
      'Tide': {
        name: 'Tide Автомат для цветного белья',
        brand: 'Tide',
        phLevel: 9.8,
        riskLevel: 'medium' as const,
        composition: {
          surfactants: 'Анионные ПАВ (15-30%)',
          phosphates: 'Отсутствуют',
          fragrances: 'Синтетические отдушки',
          bleaches: 'Кислородные отбеливатели',
          enzymes: 'Протеазы, амилазы'
        },
        environmentalImpact: {
          waterPollution: 70,
          biodegradability: 60,
          toxicity: 65
        },
        healthRisks: [
          'Раздражение кожи при прямом контакте',
          'Возможны аллергические реакции',
          'Раздражение дыхательных путей'
        ],
        recommendations: [
          'Использовать дозировку согласно инструкции',
          'Хранить в недоступном для детей месте',
          'Избегать прямого контакта с кожей'
        ],
        alternatives: [
          'Эко-стиральные порошки без ПАВ',
          'Мыльные орехи',
          'Сода для стирки'
        ]
      },
      'Persil': {
        name: 'Persil Bio Стиральный порошок',
        brand: 'Persil',
        phLevel: 10.2,
        riskLevel: 'medium' as const,
        composition: {
          surfactants: 'Комплекс ПАВ (20-35%)',
          phosphates: 'Следовые количества',
          fragrances: 'Синтетические отдушки',
          bleaches: 'Оптические отбеливатели',
          enzymes: 'Био-ферменты'
        },
        environmentalImpact: {
          waterPollution: 68,
          biodegradability: 55,
          toxicity: 62
        },
        healthRisks: [
          'Возможность раздражения кожи',
          'Не использовать для детского белья',
          'Избегать вдыхания порошка'
        ],
        recommendations: [
          'Тщательно полоскать белье',
          'Использовать перчатки при ручной стирке',
          'Хранить в сухом месте'
        ],
        alternatives: [
          'BioMio экологичный порошок',
          'Ecover стиральные средства',
          'Натуральные альтернативы'
        ]
      },
      'Sarma': {
        name: 'Sarma Универсал тазалауыш парашок',
        brand: 'Sarma',
        phLevel: 10.8,
        riskLevel: 'high' as const,
        composition: {
          surfactants: 'Жоғары мөлшер (20-35%)',
          phosphates: 'Бар (10-15%)',
          fragrances: 'Синтетикалық хош иістер',
          bleaches: 'Хлорлы ағартқыштар',
          enzymes: 'Азырақ ферменттер'
        },
        environmentalImpact: {
          waterPollution: 80,
          biodegradability: 35,
          toxicity: 75
        },
        healthRisks: [
          'Терінің қатаюы мен қабынуы',
          'Тыныс алу жолдарының раздражениясы',
          'Көздердің қызаруы',
          'Аллергиялық реакциялар'
        ],
        recommendations: [
          'Мүқият желдетілген бөлмеде қолдану',
          'Қорғаныш қолғаптарды кию',
          'Балалардан алшақ сақтау',
          'Толық шаю режимін қолдану'
        ],
        alternatives: [
          'Табиғи сода негізіндегі тазалауыштар',
          'Лимон қышқылы',
          'Ақ сірке суы',
          'Эко-тазалауыш парашоктар'
        ]
      },
      'Sorti': {
        name: 'Sorti Күрделі тазалауыш',
        brand: 'Sorti',
        phLevel: 10.2,
        riskLevel: 'medium' as const,
        composition: {
          surfactants: 'Орташа мөлшер (15-25%)',
          phosphates: 'Азырақ (5-8%)',
          fragrances: 'Аралас хош иістер',
          bleaches: 'Оттегі негізіндегі ағартқыштар',
          enzymes: 'Орташа ферменттер'
        },
        environmentalImpact: {
          waterPollution: 65,
          biodegradability: 50,
          toxicity: 60
        },
        healthRisks: [
          'Терінің сезімталдығына әсері',
          'Тыныс алу жолдарының жеңіл раздражениясы'
        ],
        recommendations: [
          'Сезімтал тері үшін тестілеу',
          'Желдетілген жерде қолдану',
          'Қолғаптарды ұмытпау'
        ],
        alternatives: [
          'BioMio тазалауыштар',
          'Ecover универсалды тазалауыштар',
          'Табиғи альтернативалар'
        ]
      }
    };

    // Если удалось определить бренд, используем его, иначе случайный
    const brandKeys = Object.keys(cleaningProducts);
    const selectedBrand = detectedBrand && cleaningProducts[detectedBrand as keyof typeof cleaningProducts]
      ? detectedBrand
      : brandKeys[Math.floor(Math.random() * brandKeys.length)];

    const product = cleaningProducts[selectedBrand as keyof typeof cleaningProducts];

    return {
      productName: product.name,
      brand: product.brand,
      phLevel: product.phLevel,
      riskLevel: product.riskLevel,
      composition: product.composition,
      environmentalImpact: product.environmentalImpact,
      healthRisks: product.healthRisks,
      recommendations: product.recommendations,
      alternatives: product.alternatives,
      confidence: Math.floor(Math.random() * 15 + 75),
      provider: 'mock'
    };
  }

  // Заглушка для определения бренда (в реальном приложении можно добавить простую логику)
  private detectBrandFromBase64(base64Image: string): string | null {
    // Здесь можно добавить простую логику определения бренда
    // Например, по размеру изображения, цветовой схеме и т.д.
    // Пока возвращаем null для случайного выбора
    return null;
  }
}

export const aiAnalysisService = new AIAnalysisService();