import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import CONST from '@src/CONST';
import styles from '@src/styles';

function HeaderWithBackButton() {
    const {trigger} = useMultifactorAuthenticationContext();

    return (
        <Pressable
            accessibilityRole="button"
            style={styles.headerBackButton}
            onPress={() => {
                trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.CANCEL);
            }}
        >
            <Text>{'< Go back'}</Text>
        </Pressable>
    );
}

export default HeaderWithBackButton;
