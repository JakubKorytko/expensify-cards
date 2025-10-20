import {View} from 'react-native';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import styles from '@src/styles';

type InfoModalProps = {
    onClose?: () => void;
    title?: string;
    message?: string;
    success?: boolean;
};

function InfoModal({success = true, title, message, onClose}: InfoModalProps) {
    return (
        <View style={styles.callbackContainer}>
            <View style={styles.gap15}>
                <Text style={styles.hugeText}>{title}</Text>
                <Text>{message}</Text>
            </View>
            <Pressable
                accessibilityRole="button"
                style={success ? styles.greenButton : styles.buttonNegative}
                onPress={onClose}
            >
                <Text style={success ? styles.greenButtonText : styles.buttonTextNegative}>Got it</Text>
            </Pressable>
        </View>
    );
}

InfoModal.displayName = 'InfoModal';

export default InfoModal;
