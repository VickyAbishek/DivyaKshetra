import { View, Text } from 'react-native';
import { colors } from '../../constants/colors';
export default function StatusTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood, alignItems: 'center', justifyContent: 'center' }}>
      <Text>📋 My Submissions — coming soon</Text>
    </View>
  );
}
