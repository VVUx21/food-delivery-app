import React from 'react';
import { Text, View } from 'react-native';

interface ProductStatsProps {
  calories: number;
  protein: number;
  bunType?: string;
}

const ProductStats = ({ calories, protein, bunType }: ProductStatsProps) => {
  return (
    <View className="flex-row gap-2 my-5">
      <View className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3.5 items-center border border-orange-100">
        <Text className="text-xs text-gray-600 mb-1 font-medium">Calories</Text>
        <Text className="text-base font-bold text-dark-100">{calories}</Text>
        <Text className="text-xs text-gray-500">Cal</Text>
      </View>
      
      <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-3.5 items-center border border-green-100">
        <Text className="text-xs text-gray-600 mb-1 font-medium">Protein</Text>
        <Text className="text-base font-bold text-dark-100">{protein}</Text>
        <Text className="text-xs text-gray-500">grams</Text>
      </View>
      
      {bunType && (
        <View className="flex-1 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-3.5 items-center border border-amber-100">
          <Text className="text-xs text-gray-600 mb-1 font-medium">Bun Type</Text>
          <Text className="text-xs font-semibold text-dark-100 text-center leading-4" numberOfLines={2}>
            {bunType}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProductStats;