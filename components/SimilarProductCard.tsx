import { MenuItem } from '@/type';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface SimilarProductCardProps {
  item: MenuItem;
}

const SimilarProductCard = ({ item }: SimilarProductCardProps) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.$id}` as any)}
      activeOpacity={0.7}
      className="w-44 flex-shrink-0"
    >
      <View className="bg-white rounded-2xl ml-5 border border-gray-100 overflow-hidden">
        <View className="bg-gray-50 h-24 items-center justify-center">
          <Image 
            source={{ uri: item.image_url }} 
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
        <View className="p-3">
          <Text className="small-semibold text-dark-100 mb-1" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="small-bold text-primary">
              ${item.price.toFixed(2)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-primary text-xs">★</Text>
              <Text className="text-xs text-gray-500 ml-1">
                {item.rating}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SimilarProductCard;
