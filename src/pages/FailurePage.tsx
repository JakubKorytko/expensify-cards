import {View} from 'react-native';
import HeaderWithBackButton from '@src/components/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@src/components/MultifactorAuthenticationContext';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import styles from '@src/styles';

function FailurePage() {
    const {title, message, cancel} = useMultifactorAuthenticationContext();

    return (
        <View style={styles.callbackContainer}>
            <View style={styles.gap15}>
                <HeaderWithBackButton />
                <Text style={styles.hugeText}>{title}</Text>
                <Text>{message}</Text>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.buttonNegative}
                onPress={cancel}
            >
                <Text style={styles.buttonTextNegative}>Got it</Text>
            </Pressable>
        </View>
    );
}

FailurePage.displayName = 'FailurePage';

export default FailurePage;
