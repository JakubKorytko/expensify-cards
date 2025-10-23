// eslint-disable-next-line import/extensions
import styles from '@/styles';
import {Pressable} from './Pressable';
import Text from './Text';

function RevokeButton({show = false, revoke}: {show?: boolean; revoke: () => unknown}) {
    return (
        show && (
            <Pressable
                accessibilityRole="button"
                style={styles.buttonNegativeSmall}
                onPress={() => {
                    revoke();
                }}
            >
                <Text style={styles.buttonTextNegative}>Remove</Text>
            </Pressable>
        )
    );
}

export default RevokeButton;
