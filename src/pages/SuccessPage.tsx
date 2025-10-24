import {View} from 'react-native';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import HeaderWithBackButton from '@src/components/HeaderWithBackButton';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import styles from '@src/styles';

function SuccessPage() {
    const {title, message, done} = useMultifactorAuthenticationContext();

    return (
        <View style={styles.callbackContainer}>
            <View>
                <HeaderWithBackButton />
                <View style={styles.gap15}>
                    <Text style={styles.hugeText}>{title}</Text>
                    <Text>{message}</Text>
                </View>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.greenButton}
                onPress={done}
            >
                <Text style={styles.greenButtonText}>Got it</Text>
            </Pressable>
        </View>
    );
}

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
