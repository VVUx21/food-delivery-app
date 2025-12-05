import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, isLoading, isAuthenticated, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF9500" />
          <Text className="mt-4 text-base text-gray-600">
            Loading your profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-2xl font-bold text-orange-500 mb-2">
            No profile
          </Text>
          <Text className="text-base text-gray-600 text-center">
            You're not logged in. Please sign in to view your profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = user.name || "User";
  const email = user.email || "";
  const initial = displayName.charAt(0).toUpperCase() || "U";

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace("/(auth)/sign-in");
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with title and search */}
      <View className="flex-row items-center justify-center px-5 py-4 border-b border-gray-100">
        <CustomHeader title="Your Profile" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        bounces={true}
      >
        {/* Avatar Section */}
        <View className="items-center pt-10 pb-8">
          <View className="relative">
            {/* Avatar Circle */}
            <View className="h-32 w-32 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-orange-50">
              {user.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-5xl font-bold text-orange-500">
                  {initial}
                </Text>
              )}
            </View>

            <View className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-orange-500 border-4 border-white flex items-center justify-center shadow-sm">
              <Text className="text-white text-lg font-bold">✓</Text>
            </View>
          </View>
        </View>

        <View className="px-5 space-y-3 mb-10">
          <InfoRow
            icon={images.user}
            label="Full Name"
            value={displayName}
          />

          <InfoRow
            icon={images.user}
            label="Email"
            value={email || "-"}
          />
        </View>

        <View className="px-5">
          <TouchableOpacity
            activeOpacity={0.7}
            className="border-2 border-orange-500 rounded-full mb-4 py-4 px-6 flex-row items-center justify-center active:bg-orange-50"
          >
            <Text className="text-orange-500 font-bold text-base">
              Edit Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="border-2 border-red-300 rounded-full py-4 px-6 flex-row items-center justify-center bg-red-50 active:bg-red-100"
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Text className="text-red-500 font-bold text-base">Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

type InfoRowProps = {
  icon: any;
  label: string;
  value: string;
};

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View className="flex-row items-center gap-4 bg-gray-50 rounded-2xl p-4">
    {/* Icon Container */}
    <View className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
      <Image
        source={icon}
        className="h-6 w-6"
        resizeMode="contain"
        tintColor="#FF9500"
      />
    </View>

    {/* Content */}
    <View className="flex-1">
      <Text className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
        {label}
      </Text>
      <Text className="text-base font-semibold text-gray-900 leading-5">
        {value}
      </Text>
    </View>
  </View>
);

export default Profile;