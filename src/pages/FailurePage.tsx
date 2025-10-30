import {View} from 'react-native';
import HeaderWithBackButton from '@components/MultifactorAuthentication/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import styles from '@src/styles';

function FailurePage() {
    const {info, trigger} = useMultifactorAuthenticationContext();

    return (
        <View style={styles.callbackContainer}>
            <View style={styles.gap15}>
                <HeaderWithBackButton />
                <Text style={styles.hugeText}>{info.title}</Text>
                <Text>{info.message}</Text>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.buttonNegative}
                onPress={() => {
                    trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL);
                }}
            >
                <Text style={styles.buttonTextNegative}>Got it</Text>
            </Pressable>
        </View>
    );
}

FailurePage.displayName = 'FailurePage';

export default FailurePage;
