import { Stack } from 'expo-router';
import { AddFormProvider } from '../../lib/addFormStore';

export default function AddLayout() {
  return (
    <AddFormProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AddFormProvider>
  );
}
