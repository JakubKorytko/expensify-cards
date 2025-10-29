import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import styles from '@src/styles';
import {useMultifactorAuthenticationContext} from './MultifactorAuthenticationContext';

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
