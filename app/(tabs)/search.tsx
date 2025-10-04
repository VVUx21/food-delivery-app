import { View, Text, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import seed from '@/lib/seed'

const search = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <Text>search</Text>
      <View>
        <Button title='Seed Data' onPress={async () => {
          await seed();
        }} />
      </View>
    </SafeAreaView>
  )
}

export default search