import { useThemeContext } from '@/hooks/theme-context';
import { FirebaseService, auth } from '@/services/firebase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CookbookScreen() {
    const { isDark } = useThemeContext();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Subscribe to Firestore collection real-time updates (Firebase Integrator Feature)
    const unsubscribe = FirebaseService.subscribeToCookbook(user.uid, (data) => {
      // Sort by saved time descending if available
      const sorted = [...data].sort((a, b) => {
        return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime();
      });
      setRecipes(sorted);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleRemove = (recipeId: string, recipeName: string) => {
    Alert.alert(
      'Hapus Resep',
      `Apakah Anda yakin ingin menghapus "${recipeName}" dari Cookbook Anda?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await FirebaseService.removeFromCookbook(user.uid, recipeId);
            } catch (err: any) {
              Alert.alert('Gagal menghapus', err.message);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar dari FlavorForge?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              await FirebaseService.logout();
              // Redirect handled by auth state listener in _layout.tsx
            } catch (err: any) {
              Alert.alert('Gagal keluar', err.message);
            }
          }
        }
      ]
    );
  };

  return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#121212' : '#F5F5F5',
          },
        ]}
      >
      {/* Profile & Logout Header */}
      <View style={styles.profileHeader}>
        <View style={styles.userInfo}>
          <MaterialIcons name="account-circle" size={40} color="#FF6B6B" />
          <View style={styles.userTextContainer}>
          <Text
            style={[
              styles.welcomeText,
              {
                color: isDark ? '#aaa' : '#666',
              },
            ]}
          >
            Cookbook Pribadi
          </Text>
            <Text
              style={[
                styles.emailText,
                {
                  color: isDark ? '#FFFFFF' : '#121212',
                },
              ]}
              numberOfLines={1}
            >
              {user?.email || 'Guest User'}
            </Text>
          </View>
        </View>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: isDark
                  ? 'rgba(255,107,107,0.1)'
                  : '#FFEAEA',
              },
            ]}
            onPress={handleLogout}
          >
          <MaterialIcons name="logout" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

            <Text
            style={[
              styles.sectionTitle,
              {
                color: isDark ? '#FFFFFF' : '#121212',
              },
            ]}
          >
            Resep Favorit Anda
          </Text>

      {loading ? (
        <View style={styles.centerWrapper}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Menghubungkan ke Cloud Firestore...</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="restaurant-menu" size={64} color="#555" />
          <Text style={styles.emptyText}>Cookbook Kosong</Text>
          <Text style={styles.emptySubText}>
            Jelajahi resep di Beranda dan simpan resep favorit Anda di sini.
          </Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.exploreButtonText}>Cari Resep Sekarang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.idMeal}
          renderItem={({ item }) => (
            <View
              style={[
                styles.recipeCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
                  borderColor: isDark ? '#2D2D2D' : '#E5E5E5',
                },
              ]}
            >
              <TouchableOpacity
                style={styles.cardClickable}
                onPress={() => router.push(`/recipe/${item.idMeal}`)}
              >
                <Image source={{ uri: item.strMealThumb }} style={styles.recipeImage} />
                <View style={styles.recipeDetails}>
                  <Text
                    style={[
                      styles.recipeTitle,
                      {
                        color: isDark ? '#FFFFFF' : '#121212',
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.strMeal}
                  </Text>
                    <Text
                      style={[
                        styles.recipeCategory,
                        {
                          color: isDark ? '#888' : '#666',
                        },
                      ]}
                    >
                      {item.strCategory}
                    </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.idMeal, item.strMeal)}
              >
                <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 12,
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D2D2D',
    alignItems: 'center',
  },
  cardClickable: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  recipeImage: {
    width: 80,
    height: 80,
    backgroundColor: '#2D2D2D',
  },
  recipeDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  recipeCategory: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
