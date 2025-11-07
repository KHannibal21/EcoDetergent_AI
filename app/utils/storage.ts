import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  // Сохранить данные
  async setItem(key: string, value: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage save error:', error);
      return false;
    }
  },

  // Получить данные
  async getItem(key: string) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage read error:', error);
      return null;
    }
  },

  // Удалить данные
  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  // Получить все ключи
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  },

  // Очистить все данные
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};