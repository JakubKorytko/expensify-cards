import {View} from 'react-native';
import HeaderWithBackButton from '@components/MultifactorAuthentication/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import useLocalize from '@hooks/useLocalize';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import styles from '@src/styles';

function SoftPromptPage() {
    const {translate} = useLocalize();
    const {softPromptDecision} = useMultifactorAuthenticationContext();

    const title = translate(`multifactorAuthentication.softPromptTitle`);
    const description = translate(`multifactorAuthentication.softPromptDescription`);

    return (
        <View style={styles.softPromptContainer}>
            <View>
                <HeaderWithBackButton />
            </View>
            <View>
                <Text style={styles.hugeText}>{title}</Text>
                <Text style={styles.text}>{description}</Text>
            </View>
            <View style={styles.innerInputContainer}>
                <Pressable
                    accessibilityRole="button"
                    style={styles.grayButton}
                    onPress={() => {
                        softPromptDecision(false);
                    }}
                >
                    <Text style={styles.grayButtonText}>Not now</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    style={styles.greenButton}
                    onPress={() => {
                        softPromptDecision(true);
                    }}
                >
                    <Text style={styles.greenButtonText}>Continue</Text>
                </Pressable>
            </View>
        </View>
    );
}

SoftPromptPage.displayName = 'MagicCodePage';

export default SoftPromptPage;
