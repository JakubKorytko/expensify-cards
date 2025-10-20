import {useState} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useMultifactorAuthentication from '@hooks/useMultifactorAuthentication';
import CONST from '@src/CONST';
import styles from '@src/styles';
import InfoModal from './Modals/InfoModal';
import InputModal from './Modals/InputModal';
import {Pressable, PressableWithoutFeedback} from './Pressable';
import Text from './Text';

function BiometricsSetupScreen() {
    const {translate} = useLocalize();
    const BiometricsSetup = useMultifactorAuthentication(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS);
    const [showModal, setShowModal] = useState<boolean>(false);

    const authorizeWithModal = async (validateCode?: number) => {
        setShowModal(false);

        await BiometricsSetup.register({
            validateCode,
        });

        setShowModal(true);
    };

    return (
        <>
            <PressableWithoutFeedback
                accessibilityRole="button"
                onPress={BiometricsSetup.cancel}
            >
                <View style={[styles.layoutContainer, showModal && (BiometricsSetup.isRequestFulfilled || BiometricsSetup.requiredFactorForNextStep) && styles.layoutContainerWithModal]}>
                    <View style={styles.container}>
                        <View style={styles.content}>
                            <Text style={styles.title}>{translate('multifactorAuthentication.title', {registered: BiometricsSetup.isBiometryConfigured})}</Text>
                            <View style={styles.buttonContainer}>
                                <Pressable
                                    accessibilityRole="button"
                                    style={styles.button}
                                    onPress={() => {
                                        authorizeWithModal();
                                    }}
                                >
                                    <Text style={styles.buttonText}>Test</Text>
                                </Pressable>

                                {BiometricsSetup.isBiometryConfigured && (
                                    <Pressable
                                        accessibilityRole="button"
                                        style={styles.buttonNegativeSmall}
                                        onPress={() => {
                                            BiometricsSetup.revoke();
                                        }}
                                    >
                                        <Text style={styles.buttonTextNegative}>Remove</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </PressableWithoutFeedback>
            {showModal && BiometricsSetup.isRequestFulfilled && (
                <InfoModal
                    message={BiometricsSetup.message}
                    title={BiometricsSetup.title}
                    success={BiometricsSetup.wasRecentStepSuccessful}
                    onClose={() => setShowModal(false)}
                />
            )}
            {BiometricsSetup.requiredFactorForNextStep === CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE && (
                <InputModal
                    onSubmit={(validateCode) => {
                        authorizeWithModal(validateCode);
                    }}
                    title={translate('multifactorAuthentication.provideValidateCode')}
                />
            )}
        </>
    );
}

BiometricsSetupScreen.displayName = 'BiometricsSetupScreen';

export default BiometricsSetupScreen;
