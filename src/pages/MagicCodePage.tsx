import {useState} from 'react';
import {TextInput, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import HeaderWithBackButton from '@src/components/HeaderWithBackButton';
import {useMultifactorAuthenticationContext} from '@src/components/MultifactorAuthenticationContext';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import styles from '@src/styles';

function MagicCodePage() {
    const [inputValue, setInputValue] = useState('');
    const {translate} = useLocalize();
    const {provideFactor} = useMultifactorAuthenticationContext();
    const title = translate(`multifactorAuthentication.provideValidateCode`);

    return (
        <View style={styles.inputContainer}>
            <View>
                <HeaderWithBackButton />
                <Text style={styles.hugeText}>{title}</Text>
            </View>
            <View style={styles.innerInputContainer}>
                <TextInput
                    accessibilityLabel="Text input field"
                    onChangeText={(text) => setInputValue(text)}
                    value={inputValue}
                    keyboardType="numeric"
                    inputMode="numeric"
                    maxLength={6}
                    style={styles.textInput}
                />
                <Pressable
                    accessibilityRole="button"
                    style={styles.greenButton}
                    onPress={() => {
                        provideFactor({
                            validateCode: Number(inputValue),
                        });
                    }}
                >
                    <Text style={styles.greenButtonText}>Authorize</Text>
                </Pressable>
            </View>
        </View>
    );
}

MagicCodePage.displayName = 'MagicCodePage';

export default MagicCodePage;
