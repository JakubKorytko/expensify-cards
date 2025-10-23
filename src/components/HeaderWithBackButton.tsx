import styles from '@src/styles';
import {useMultifactorAuthenticationContext} from './MultifactorAuthenticationContext';
import {Pressable} from './Pressable';
import Text from './Text';

function HeaderWithBackButton() {
    const {cancel} = useMultifactorAuthenticationContext();

    return (
        <Pressable
            accessibilityRole="button"
            style={styles.headerBackButton}
            onPress={() => {
                cancel();
            }}
        >
            <Text>{'< Go back'}</Text>
        </Pressable>
    );
}

export default HeaderWithBackButton;
