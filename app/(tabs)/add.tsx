import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { colors } from '../../constants/colors';

export default function AddTab() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/add/step1-location' as any);
  }, []);
  return <View style={{ flex: 1, backgroundColor: colors.sandalwood }} />;
}
