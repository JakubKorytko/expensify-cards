import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import styles from '@src/styles';

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
