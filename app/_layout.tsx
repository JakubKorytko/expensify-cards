import {Stack} from 'expo-router';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from '@src/styles';

const SCREEN_OPTIONS = {
    headerShown: false,
} as const;

export default function RootLayout() {
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Stack screenOptions={SCREEN_OPTIONS} />
        </SafeAreaView>
    );
}
