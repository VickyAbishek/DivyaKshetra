import { View, Text } from 'react-native';
import { colors } from '../../constants/colors';
export default function AddTab() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.sandalwood, alignItems: 'center', justifyContent: 'center' }}>
      <Text>➕ Add — coming soon</Text>
    </View>
  );
}
