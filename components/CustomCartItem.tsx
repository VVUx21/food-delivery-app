import { images } from "@/constants";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CartItem = ({ item }: { item: CartItemType }) => {
    const { increaseQty, decreaseQty, removeItem } = useCartStore();

    const hasCustomizations = item.customizations && item.customizations.length > 0;
    const customizationsPrice = hasCustomizations 
        ? item.customizations!.reduce((sum, c) => sum + c.price, 0) 
        : 0;
    const totalItemPrice = item.price + customizationsPrice;

    return (
        <View className="cart-item">
            <View className="flex flex-row items-center gap-x-3">
                <View className="cart-item__image">
                    <Image
                        source={{ uri: item.image_url }}
                        className="size-4/5 rounded-lg"
                        resizeMode="cover"
                    />
                </View>

                <View className="flex-1">
                    <Text className="base-bold text-dark-100">{item.name}</Text>
                    
                    {hasCustomizations && (
                        <View className="mt-1 mb-1">
                            <Text className="text-xs text-gray-500 mb-0.5">Customizations:</Text>
                            {item.customizations!.map((customization) => (
                                <View key={customization.id} className="flex-row items-center gap-1">
                                    <Text className="text-xs text-gray-600">
                                        • {customization.name}
                                    </Text>
                                    {customization.price > 0 && (
                                        <Text className="text-xs text-primary font-semibold">
                                            (+${customization.price.toFixed(2)})
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                    
                    <View className="flex-row items-center gap-2">
                        <Text className="paragraph-bold text-primary">
                            ${totalItemPrice.toFixed(2)}
                        </Text>
                        {hasCustomizations && (
                            <Text className="text-xs text-gray-400 line-through">
                                ${item.price.toFixed(2)}
                            </Text>
                        )}
                    </View>

                    <View className="flex flex-row items-center gap-x-4 mt-2">
                        <TouchableOpacity
                            onPress={() => decreaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.minus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>

                        <Text className="base-bold text-dark-100">{item.quantity}</Text>

                        <TouchableOpacity
                            onPress={() => increaseQty(item.id, item.customizations!)}
                            className="cart-item__actions"
                        >
                            <Image
                                source={images.plus}
                                className="size-1/2"
                                resizeMode="contain"
                                tintColor={"#FF9C01"}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => removeItem(item.id, item.customizations!)}
                className="flex-center"
            >
                <Image source={images.trash} className="size-5" resizeMode="contain" />
            </TouchableOpacity>
        </View>
    );
};

export default CartItem;