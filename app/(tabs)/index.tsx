import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ApiService, MealCategory, MealSummary } from '@/services/api';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemeContext } from '@/hooks/theme-context';

export default function HomeScreen() {
  const { isDark, toggleTheme } = useThemeContext();
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading & Error States
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    setError(null);
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].strCategory);
        loadMealsByCategory(data[0].strCategory);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat kategori resep.');
      setLoadingCategories(false);
    }
  };

  const loadMealsByCategory = async (category: string) => {
    setLoadingMeals(true);
    setError(null);
    try {
      const data = await ApiService.getMealsByCategory(category);
      setMeals(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat resep.');
    } finally {
      setLoadingMeals(false);
      setLoadingCategories(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery(''); // Clear search when category changes
    loadMealsByCategory(category);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search query is empty, reload selected category meals
      if (selectedCategory) {
        loadMealsByCategory(selectedCategory);
      }
      return;
    }
    
    setLoadingMeals(true);
    setError(null);
    try {
      const data = await ApiService.searchMeals(searchQuery.trim());
      setMeals(data);
    } catch (err: any) {
      setError(err.message || 'Gagal mencari resep.');
    } finally {
      setLoadingMeals(false);
    }
  };

  return (
    <SafeAreaView
  style={[
    styles.container,
    {
      backgroundColor: isDark
        ? '#121212'
        : '#F5F5F5',
    },
  ]}
>
      <StatusBar
  barStyle={
    isDark
      ? 'light-content'
      : 'dark-content'
  }
/>
      
      {/* App Header */}
<View style={styles.header}>
  <View>
    <Text
      style={[
        styles.welcomeText,
        {
          color: isDark
            ? '#aaa'
            : '#666',
        },
      ]}
    >
      Halo, Koki!
    </Text>

    <Text
      style={[
        styles.titleText,
        {
          color: isDark
            ? '#fff'
            : '#121212',
        },
      ]}
    >
      FlavorForge
    </Text>
  </View>

  <TouchableOpacity
    onPress={toggleTheme}
    style={{
      width: 82,
      height: 42,
      borderRadius: 21,
      backgroundColor: isDark
        ? '#1E1E1E'
        : '#E5E5E5',
      justifyContent: 'center',
      paddingHorizontal: 4,
    }}
  >
    <View
      style={{
        position: 'absolute',
        left: isDark ? 42 : 4,
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#fff',
      }}
    />

    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
      }}
    >
      <Ionicons
        name="sunny"
        size={16}
        color={
          isDark
            ? '#666'
            : '#FFB800'
        }
      />

      <Ionicons
        name="moon"
        size={16}
        color={
          isDark
            ? '#FFFFFF'
            : '#666'
        }
      />
    </View>
  </TouchableOpacity>
</View>
<View style={styles.searchSection}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: isDark
                      ? '#1E1E1E'
                      : '#FFFFFF',

                    color: isDark
                      ? '#FFFFFF'
                      : '#121212',

                    borderColor: isDark
                      ? '#2D2D2D'
                      : '#E5E5E5',
                  },
                ]}
                placeholder="Cari resep makanan..."
                placeholderTextColor={
                  isDark
                    ? '#999'
                    : '#666'
                }
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>
                  Cari
                </Text>
              </TouchableOpacity>
              </View>

      {/* Error State View with Retry (Axios Error Handling Demonstration) */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Ups! Terjadi Masalah</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={categories.length === 0 ? loadCategories : () => loadMealsByCategory(selectedCategory)}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Categories Horizontal List */}
          {loadingCategories ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="small" color="#FF6B6B" />
            </View>
          ) : (
            <View style={styles.categoryContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.idCategory}
                renderItem={({ item }) => {
                  const isSelected = item.strCategory === selectedCategory;
                  return (
                   <TouchableOpacity
                        style={[
                          styles.categoryItem,
                          {
                            backgroundColor: isDark
                              ? '#1E1E1E'
                              : '#FFFFFF',

                            borderColor: isDark
                              ? '#2D2D2D'
                              : '#E5E5E5',
                          },
                          isSelected && styles.categoryItemActive,
                        ]}
                        onPress={() => handleCategorySelect(item.strCategory)}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            {
                              color: isDark
                                ? '#AAA'
                                : '#666',
                            },
                            isSelected && styles.categoryTextActive,
                          ]}
                        >
                        {item.strCategory}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.categoryList}
              />
            </View>
          )}

          {/* Meals Grid/List */}
          {loadingMeals ? (
            <View style={styles.loadingWrapperLarge}>
              <ActivityIndicator size="large" color="#FF6B6B" />
              <Text style={styles.loadingText}>Mengambil resep lezat...</Text>
            </View>
          ) : (
            <FlatList
              data={meals}
              keyExtractor={(item) => item.idMeal}
              numColumns={2}
              columnWrapperStyle={styles.mealRow}
              renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.mealCard,
                  {
                    backgroundColor: isDark
                      ? '#1E1E1E'
                      : '#FFFFFF',

                    borderColor: isDark
                      ? '#2D2D2D'
                      : '#E5E5E5',
                  },
                ]}
                onPress={() => router.push(`/recipe/${item.idMeal}`)}
              >
                  <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
                  <View style={styles.mealDetails}>
                    <Text
                      style={[
                        styles.mealTitle,
                        {
                          color: isDark
                            ? '#FFFFFF'
                            : '#121212',
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.strMeal}
                    </Text>
                    <Text style={styles.mealCategoryBadge}>
                      {selectedCategory || 'Resep'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Tidak ada resep ditemukan.</Text>
                  <Text style={styles.emptySubText}>Coba kata kunci lain atau pilih kategori berbeda.</Text>
                </View>
              }
              contentContainerStyle={styles.mealList}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 14,
  },
  titleText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoryContainer: {
    height: 48,
    marginBottom: 10,
  },
  categoryList: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 38,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  categoryItemActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  loadingWrapper: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrapperLarge: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
  },
  mealList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  mealRow: {
    justifyContent: 'space-between',
  },
  mealCard: {
    backgroundColor: '#1E1E1E',
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  mealImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#2D2D2D',
  },
  mealDetails: {
    padding: 12,
  },
  mealTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    height: 36,
  },
  mealCategoryBadge: {
    color: '#FF6B6B',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
