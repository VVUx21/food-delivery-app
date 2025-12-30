import CustomButton from '@/components/CustomButton';
import ProductStats from '@/components/ProductStats';
import SimilarProductCard from '@/components/SimilarProductCard';
import CustomizationCard from '@/components/CustomizationCard';
import { images } from '@/constants';
import { getMenuItemById, getMenuItemCustomizations, getSimilarMenuItems } from '@/lib/appwrite';
import { useCartStore } from '@/store/cart.store';
import { Customization, MenuItem } from '@/type';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProductDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [similarProducts, setSimilarProducts] = useState<MenuItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const toppings = customizations.filter(c => c.type === 'topping');
  const sides = customizations.filter(c => c.type === 'side');

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);
  
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      const item = await getMenuItemById(id as string);
      setMenuItem(item as unknown as MenuItem);
      
      const customizationData = await getMenuItemCustomizations(id as string);
      setCustomizations(customizationData as unknown as Customization[]);
      
      if (item.categories) {
        const similar = await getSimilarMenuItems(item.categories, id as string, 6);
        setSimilarProducts(similar as unknown as MenuItem[]);
      }
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCustomization = (customizationId: string) => {
    setSelectedCustomizations(prev => 
      prev.includes(customizationId)
        ? prev.filter(id => id !== customizationId)
        : [...prev, customizationId]
    );
  };

  const calculateTotalPrice = () => {
    if (!menuItem) return 0;
    
    const basePrice = menuItem.price;
    const customizationPrice = selectedCustomizations.reduce((total, id) => {
      const customization = customizations.find(c => c.$id === id);
      return total + (customization?.price || 0);
    }, 0);
    
    return (basePrice + customizationPrice / 100) * quantity;
  };

  const handleAddToCart = () => {
    if (!menuItem) return;
    
    const selectedCustomizationDetails = selectedCustomizations.map(id => {
      const customization = customizations.find(c => c.$id === id);
      return {
        id: customization!.$id,
        name: customization!.name,
        price: customization!.price / 100,
        type: customization!.type,
      };
    });

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: menuItem.$id,
        name: menuItem.name,
        price: menuItem.price,
        image_url: menuItem.image_url,
        customizations: selectedCustomizationDetails,
      });
    }

    Alert.alert(
      'Added to Cart',
      `${quantity} ${menuItem.name}${quantity > 1 ? 's' : ''} added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text key={star} className={`text-lg ${star <= rating ? 'text-primary' : 'text-gray-300'}`}>
            ★
          </Text>
        ))}
        <Text className="ml-2 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF9500" />
        <Text className="mt-4 text-base text-gray-600">Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</Text>
        <Text className="text-base text-gray-600 mb-8 text-center">
          Sorry, we couldn't find this product.
        </Text>
        <CustomButton title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FlatList
        data={[1]}
        keyExtractor={() => 'product-detail'}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        ListHeaderComponent={() => (
          <View className="mb-6">
            <View className="flex-row items-center justify-between px-2 py-1">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full"
              >
                <Image source={images.arrowBack} className="w-5 h-5" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/search')}
                className="w-10 h-10 items-center justify-center rounded-full"
              >
                <Image source={images.search} className="w-5 h-5" />
              </TouchableOpacity>
            </View>

            {/* Product Hero Image with subtle background */}
            <View className="items-center py-8">
              <View className="w-64 h-64 items-center justify-center rounded-3xl">
                <Image 
                  source={{ uri: menuItem.image_url }} 
                  className="w-64 h-64"
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Product Info Card */}
            <View className="bg-white px-6 pt-6 pb-4 rounded-t-3xl border-t-2 border-primary -mt-6 shadow-sm">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-4">
                  <Text className="h2-bold text-dark-100 mb-2">{menuItem.name}</Text>
                  {renderStars(menuItem.rating)}
                </View>
                <View className="bg-primary/10 px-4 py-3 rounded-2xl">
                  <Text className="text-2xl font-bold text-primary">
                    ${menuItem.price.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <Text className="body-regular text-gray-600 mb-4 leading-6">
                {menuItem.description}
              </Text>

              <ProductStats 
                calories={menuItem.calories}
                protein={menuItem.protein}
                bunType={menuItem.bun_type}
              />

              <View className="flex-row items-center gap-3 mb-6">
                <View className="flex-row items-center bg-primary/10 rounded-xl px-4 py-2.5 border border-primary/20">
                  <Text className="text-primary text-base mr-1.5 font-semibold">$</Text>
                  <Text className="text-sm font-semibold text-primary">Free Delivery</Text>
                </View>
                <View className="flex-row items-center bg-green-50 rounded-xl px-4 py-2.5 border border-green-200">
                  <Text className="text-base mr-1.5">🕐</Text>
                  <Text className="text-sm font-semibold text-green-700">20-30 mins</Text>
                </View>
                <View className="flex-row items-center bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-200">
                  <Text className="text-base mr-1.5">⭐</Text>
                  <Text className="text-sm font-semibold text-amber-700">{menuItem.rating}</Text>
                </View>
              </View>
            </View>
            <View className="bg-white px-6 py-3 rounded-2xl">
              {toppings.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="h3-bold text-dark-100">Choose Toppings</Text>
                    <Text className="text-sm text-gray-500">Optional</Text>
                  </View>
                  <View className="flex-row gap-3">
                    {toppings.map((topping) => (
                      <View key={topping.$id} className="w-fit">
                        <CustomizationCard
                          item={topping}
                          isSelected={selectedCustomizations.includes(topping.$id)}
                          onToggle={() => handleToggleCustomization(topping.$id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {sides.length > 0 && (
                <View className={toppings.length > 0 ? 'pt-6' : ''}>
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="h3-bold text-dark-100">Side Options</Text>
                    <Text className="text-sm text-gray-500">Optional</Text>
                  </View>
                  <View className="flex-row gap-3">
                    {sides.map((side) => (
                      <View key={side.$id} className="w-fit">
                        <CustomizationCard
                          item={side}
                          isSelected={selectedCustomizations.includes(side.$id)}
                          onToggle={() => handleToggleCustomization(side.$id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {similarProducts.length > 0 && (
              <View className="px-6 py-6 rounded-2xl">
                <Text className="h3-bold text-dark-100 mb-4">Similar Products</Text>
                <FlatList
                  data={similarProducts}
                  keyExtractor={(item) => item.$id}
                  renderItem={({ item }) => <SimilarProductCard item={item} />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="justify-start"
                />
              </View>
            )}
          </View>
        )}
      />

      {/* Enhanced Sticky Add to Cart Bar */}
      <View style={{
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#1a1a1a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
      }}>
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Text 
                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="text-2xl font-bold text-primary w-8 text-center"
              >
                  -
              </Text>
              <Text className="text-xl font-bold text-dark-100 w-8 text-center">
                {quantity}
              </Text>
              <Text 
                onPress={() => setQuantity(prev => prev + 1)}
                className="text-2xl font-bold text-primary w-8 text-center"
              >
                  +
              </Text>
            </View>
          <View className="w-1/2">
            <CustomButton
              title={`Add to Cart - $${calculateTotalPrice().toFixed(2)}`}
              onPress={handleAddToCart}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;