import {View} from 'react-native';
import HeaderWithBackButton from '@components/MultifactorAuthentication/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import CONST from '@src/CONST';
import styles from '@src/styles';

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage() {
    const {trigger} = useMultifactorAuthenticationContext();

    return (
        <View style={styles.callbackContainer}>
            <View>
                <HeaderWithBackButton />
                <View style={styles.gap15}>
                    <Text style={styles.hugeText}>You should not be here!</Text>
                    <Text>Please go back</Text>
                </View>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.greenButton}
                onPress={() => {
                    trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL);
                }}
            >
                <Text style={styles.greenButtonText}>Got it</Text>
            </Pressable>
        </View>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
