import axios, { AxiosError } from 'axios';

// Base URL for The MealDB API (100% free and open)
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';

// Create Axios Instance with timeout and header config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Types/Interfaces for API Response
export interface MealCategory {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface MealSummary {
  strMeal: string;
  strMealThumb: string;
  idMeal: string;
}

export interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  // Ingredients dynamic parsing helper
  ingredients: { name: string; measure: string }[];
}

/**
 * Handle Axios Errors cleanly
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.code === 'ECONNABORTED') {
      return 'Koneksi timeout. Silakan coba beberapa saat lagi.';
    }
    if (!axiosError.response) {
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    }
    // Server responded with status code outside of 2xx range
    switch (axiosError.response.status) {
      case 400:
        return 'Permintaan tidak valid (Bad Request).';
      case 404:
        return 'Data tidak ditemukan.';
      case 500:
        return 'Terjadi masalah pada server. Silakan coba lagi nanti.';
      default:
        return `Kesalahan Server: ${axiosError.response.status}`;
    }
  }
  return error?.message || 'Terjadi kesalahan yang tidak terduga.';
};

/**
 * API Services
 */
export const ApiService = {
  /**
   * Fetch all meal categories
   */
  async getCategories(): Promise<MealCategory[]> {
    try {
      const response = await apiClient.get<{ categories: MealCategory[] }>('categories.php');
      return response.data.categories || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Fetch meals belonging to a specific category
   */
  async getMealsByCategory(category: string): Promise<MealSummary[]> {
    try {
      const response = await apiClient.get<{ meals: MealSummary[] }>(`filter.php?c=${encodeURIComponent(category)}`);
      return response.data.meals || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Search meals by search term/query
   */
  async searchMeals(query: string): Promise<MealSummary[]> {
    try {
      const response = await apiClient.get<{ meals: MealSummary[] }>(`search.php?s=${encodeURIComponent(query)}`);
      return response.data.meals || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Fetch full meal details by its ID
   */
  async getMealDetails(id: string): Promise<MealDetail> {
    try {
      const response = await apiClient.get<{ meals: any[] }>(`lookup.php?i=${id}`);
      const rawMeal = response.data.meals?.[0];
      
      if (!rawMeal) {
        throw new Error('Resep tidak ditemukan.');
      }

      // Parse ingredients dynamically (strIngredient1..20 and strMeasure1..20)
      const ingredients: { name: string; measure: string }[] = [];
      for (let i = 1; i <= 20; i++) {
        const name = rawMeal[`strIngredient${i}`];
        const measure = rawMeal[`strMeasure${i}`];
        if (name && name.trim() !== '') {
          ingredients.push({
            name: name.trim(),
            measure: measure ? measure.trim() : '',
          });
        }
      }

      return {
        idMeal: rawMeal.idMeal,
        strMeal: rawMeal.strMeal,
        strCategory: rawMeal.strCategory,
        strArea: rawMeal.strArea,
        strInstructions: rawMeal.strInstructions,
        strMealThumb: rawMeal.strMealThumb,
        strTags: rawMeal.strTags,
        strYoutube: rawMeal.strYoutube,
        ingredients,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
