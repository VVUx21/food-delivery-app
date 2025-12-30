import { images } from '@/constants';
import { Customization } from '@/type';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface CustomizationCardProps {
  item: Customization;
  isSelected: boolean;
  onToggle: () => void;
}

const CustomizationCard = ({ item, isSelected, onToggle }: CustomizationCardProps) => {
  const getCustomizationImage = (name: string) => {
    const imageName = name.toLowerCase().replace(/\s+/g, '');
    
    const imageMap: { [key: string]: any } = {
      'avocado': images.avocado,
      'bacon': images.bacon,
      'extracheese': images.cheese,
      'cucumber': images.cucumber,
      'mushrooms': images.mushrooms,
      'onions': images.onions,
      'tomatoes': images.tomatoes,
      'fries': images.fries,
      'onionrings': images.onionRings,
      'mozarellasticks': images.mozarellaSticks,
      'coleslaw': images.coleslaw,
      'salad': images.salad,
    };
    
    return imageMap[imageName] || null;
  };

  const customizationImage = getCustomizationImage(item.name);

  return (
    <TouchableOpacity 
      onPress={onToggle}
      activeOpacity={0.7}
      className="flex-shrink-0 w-[100px]"
    >
      <View className={`bg-white rounded-2xl overflow-hidden shadow-sm ${
        isSelected 
          ? 'border-2 border-primary shadow-primary/20' 
          : 'border border-gray-200'
      }`}>
        <View className={`h-24 items-center justify-center ${
          isSelected ? 'bg-primary/5' : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          {customizationImage ? (
            <Image 
              source={customizationImage} 
              className="w-28 h-28"
              resizeMode="contain"
            />
          ) : (
            <View className={`w-28 h-28 rounded-full items-center justify-center`}>
              <Text className={`text-4xl font-semibold ${
                isSelected ? '' : 'text-gray-700'
              }`}>
                {item.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        <View className={`px-3 py-3 ${
          isSelected ? 'bg-dark-100' : 'bg-gray-900'
        }`}>
          <View className="flex-row items-center justify-between">
            <Text 
              className="text-sm font-semibold text-white flex-1 mr-2" 
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <View className={`w-7 h-7 rounded-full items-center justify-center shadow-sm ${
              isSelected 
                ? 'bg-primary border-2 border-white' 
                : 'bg-white border-2 border-gray-200'
            }`}>
              <Text className={`text-base font-bold ${
                isSelected ? 'text-white' : 'text-primary'
              }`}>
                {isSelected ? '✓' : '+'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      {item.price > 0 && (
        <View className={`absolute top-2 right-2 rounded-xl px-2.5 py-1.5 shadow-md ${
          isSelected 
            ? 'bg-primary' 
            : 'bg-white border border-primary/30'
        }`}>
          <Text className={`text-xs font-bold ${
            isSelected ? 'text-white' : 'text-primary'
          }`}>
            +${(item.price / 100).toFixed(2)}
          </Text>
        </View>
      )}
      {isSelected && (
        <View className="absolute top-0 left-0 right-0 bottom-0 border-2 border-primary rounded-2xl pointer-events-none" />
      )}
    </TouchableOpacity>
  );
};

export default CustomizationCard;