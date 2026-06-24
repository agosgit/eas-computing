import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ApiService, MealDetail } from '@/services/api';
import { FirebaseService, auth } from '@/services/firebase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useThemeContext } from '@/hooks/theme-context';

export default function RecipeDetailScreen() {
  const { isDark } = useThemeContext();

  const { id } = useLocalSearchParams<{ id: string }>();

  const [recipe, setRecipe] = useState<MealDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local checklist state for ingredients
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  // Saved in Firebase State
  const [isSaved, setIsSaved] = useState(false);
  const user = auth.currentUser;

  // Fetch recipe details using Axios
  useEffect(() => {
    if (id) {
      fetchDetails(id);
    }
  }, [id]);

  // Real-time Firestore sync check if this recipe is in the cookbook (Firebase Integrator Feature)
  useEffect(() => {
    if (!user || !id) return;

    const unsubscribe = FirebaseService.subscribeToCookbook(user.uid, (savedRecipes) => {
      const found = savedRecipes.some((r) => r.idMeal === id);
      setIsSaved(found);
    });

    return () => {
      unsubscribe();
    };
  }, [user, id]);

  const fetchDetails = async (mealId: string) => {
    setLoading(true);
    setError(null);
    try {
      const details = await ApiService.getMealDetails(mealId);
      setRecipe(details);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil detail resep.');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (name: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSaveToggle = async () => {
    if (!user || !recipe) {
      Alert.alert('Masuk Akun', 'Silakan masuk akun terlebih dahulu.');
      return;
    }

    try {
      if (isSaved) {
        await FirebaseService.removeFromCookbook(user.uid, recipe.idMeal);
      } else {
        await FirebaseService.saveToCookbook(user.uid, {
          idMeal: recipe.idMeal,
          strMeal: recipe.strMeal,
          strMealThumb: recipe.strMealThumb,
          strCategory: recipe.strCategory,
        });
      }
    } catch (err: any) {
      Alert.alert('Gagal memperbarui database', err.message);
    }
  };

  const openYoutube = () => {
    if (recipe?.strYoutube) {
      Linking.openURL(recipe.strYoutube).catch(() => {
        Alert.alert('Error', 'Tidak dapat membuka tautan YouTube.');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerWrapper}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Memuat detail resep...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centerWrapper}>
        <Text style={styles.errorTitle}>Gagal Memuat Resep</Text>
        <Text style={styles.errorText}>{error || 'Resep tidak ditemukan.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      
          {/* Header Navigation */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.headerIconButton,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                },
              ]}
              onPress={() => router.back()}
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={isDark ? '#FFFFFF' : '#121212'}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.headerTitle,
                {
                  color: isDark ? '#FFFFFF' : '#121212',
                },
              ]}
              numberOfLines={1}
            >
              {recipe.strMeal}
            </Text>

            <TouchableOpacity
                style={[
                  styles.headerIconButton,
                  {
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                  },
                ]}
                onPress={handleSaveToggle}
              >
                <MaterialIcons
                  name={isSaved ? 'favorite' : 'favorite-border'}
                  size={24}
                  color="#FF6B6B"
                />
              </TouchableOpacity>
            </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recipe Image */}
        <Image source={{ uri: recipe.strMealThumb }} style={styles.recipeImage} />

        {/* Recipe Summary Bar */}
          <View style={styles.summaryContainer}>
            <View
              style={[
                styles.summaryBadge,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                },
              ]}
            >
              <MaterialIcons name="restaurant" size={16} color="#FF6B6B" />
              <Text
                style={[
                  styles.summaryBadgeText,
                  { color: isDark ? '#CCCCCC' : '#121212' },
                ]}
              >
                {recipe.strCategory}
              </Text>
            </View>

            <View
              style={[
                styles.summaryBadge,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                },
              ]}
            >
              <MaterialIcons name="public" size={16} color="#FF6B6B" />
              <Text
                style={[
                  styles.summaryBadgeText,
                  { color: isDark ? '#CCCCCC' : '#121212' },
                ]}
              >
                {recipe.strArea}
              </Text>
            </View>

            {recipe.strYoutube && (
              <TouchableOpacity
                style={[
                  styles.summaryBadge,
                  styles.youtubeBadge,
                  {
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                  },
                ]}
                onPress={openYoutube}
              >
                <MaterialIcons
                  name="play-circle-fill"
                  size={16}
                  color="#FF0000"
                />
                <Text
                  style={[
                    styles.youtubeText,
                    { color: isDark ? '#FFFFFF' : '#121212' },
                  ]}
                >
                  Video
                </Text>
              </TouchableOpacity>
            )}
          </View>

        <View style={styles.infoSection}>
          {/* Ingredients Section (Local State Interactive Feature) */}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? '#FFFFFF' : '#121212',
              },
            ]}
          >
            Bahan-Bahan
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: isDark ? '#AAAAAA' : '#666666',
              },
            ]}
          >
            Ketuk bahan untuk menandai yang sudah Anda siapkan:
          </Text>
          
            <View
              style={[
                styles.ingredientsCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                },
              ]}
            >
            {recipe.ingredients.map((item, index) => {
              const isChecked = !!checkedIngredients[item.name];
              return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.ingredientRow,
                        {
                          borderBottomColor: isDark ? '#2D2D2D' : '#E5E5E5',
                        },
                      ]}
                      onPress={() => toggleIngredient(item.name)}
                    >
                  <MaterialIcons
                    name={isChecked ? "check-box" : "check-box-outline-blank"}
                    size={22}
                    color={isChecked ? "#FF6B6B" : "#aaa"}
                  />
                  <Text
                    style={[
                      styles.ingredientText,
                      {
                        color: isDark ? '#FFFFFF' : '#121212',
                      },
                      isChecked && styles.ingredientTextChecked,
                    ]}
                  >

                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.ingredientMeasure,
                      {
                        color: isDark ? '#FF6B6B' : '#D9534F',
                      },
                    ]}
                  >
                    {item.measure}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

              {/* Instructions Section */}
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDark ? '#FFFFFF' : '#121212',
                  },
                ]}
              >
                Instruksi Memasak
              </Text>

              <View
                style={[
                  styles.instructionsCard,
                  {
                    backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                    borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.instructionsText,
                    {
                      color: isDark ? '#FFFFFF' : '#121212',
                    },
                  ]}
                >
                  {recipe.strInstructions.replace(/\r\n/g, '\n\n')}
                </Text>
              </View>

                {recipe.strTags && (
                  <View
                    style={[
                      styles.tagWrapper,
                      {
                        backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                        borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagTitle,
                        {
                          color: '#FF6B6B',
                        },
                      ]}
                    >
                    Tags:
                  </Text>

                  <Text
                    style={[
                      styles.tagContent,
                      {
                        color: isDark ? '#AAAAAA' : '#666666',
                      },
                    ]}
                  >
                    {recipe.strTags.split(',').join(', ')}
                  </Text>
                </View>
              )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#2D2D2D',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  summaryBadgeText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  youtubeBadge: {
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  youtubeText: {
    color: '#FF0000',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  ingredientsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    marginBottom: 20,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  ingredientText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  ingredientTextChecked: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  ingredientMeasure: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  instructionsText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  tagWrapper: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  tagTitle: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tagContent: {
    color: '#aaa',
    fontSize: 12,
    flex: 1,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 40,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 13,
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
  backButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
