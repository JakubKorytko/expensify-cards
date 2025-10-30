import {View} from 'react-native';
import HeaderWithBackButton from '@components/MultifactorAuthentication/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import styles from '@src/styles';

function SuccessPage() {
    const {info, trigger} = useMultifactorAuthenticationContext();

    return (
        <View style={styles.callbackContainer}>
            <View>
                <HeaderWithBackButton />
                <View style={styles.gap15}>
                    <Text style={styles.hugeText}>{info.title}</Text>
                    <Text>{info.message}</Text>
                </View>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.greenButton}
                onPress={() => {
                    trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.FULFILL);
                }}
            >
                <Text style={styles.greenButtonText}>Got it</Text>
            </Pressable>
        </View>
    );
}

SuccessPage.displayName = 'SuccessPage';

export default SuccessPage;
