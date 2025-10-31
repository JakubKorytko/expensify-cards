import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import CONST from '@src/CONST';
import styles from '@src/styles';

function RevokeButton() {
    const {trigger, info} = useMultifactorAuthenticationContext();

    return (
        info.isBiometryConfigured && (
            <Pressable
                accessibilityRole="button"
                style={styles.buttonNegativeSmall}
                onPress={() => {
                    trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE);
                }}
            >
                <Text style={styles.buttonTextNegative}>Remove</Text>
            </Pressable>
        )
    );
}

export default RevokeButton;
