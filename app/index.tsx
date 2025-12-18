import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-4xl font-bold text-primary mb-4">
          StopShorts
        </Text>
        <Text className="text-lg text-gray-600 text-center">
          5分で止める、人生を取り戻す
        </Text>
      </View>
    </SafeAreaView>
  );
}
