import {View} from 'react-native';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import RevokeButton from '@src/components/RevokeButton';
import CONST from '@src/CONST';
import styles from '@src/styles';

function SetupBiometricsPage() {
    const {process, isRequestFulfilled, wasRecentStepSuccessful, isBiometryConfigured, revoke} = useMultifactorAuthenticationContext();
    const {translate} = useLocalize();

    return (
        <View style={[styles.layoutContainer]}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>{translate('multifactorAuthentication.title', {registered: isBiometryConfigured})}</Text>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.button}
                            onPress={() => {
                                process(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS);
                            }}
                        >
                            <Text style={styles.buttonText}>Test</Text>
                        </Pressable>
                        <RevokeButton
                            revoke={revoke}
                            show={isBiometryConfigured}
                        />
                    </View>
                </View>
            </View>
            {isRequestFulfilled && wasRecentStepSuccessful ? <Text style={styles.hugeText}>I am the secret!</Text> : <Text style={styles.hugeText}>Secret is hidden!</Text>}
        </View>
    );
}

SetupBiometricsPage.displayName = 'SetupBiometricsPage';

export default SetupBiometricsPage;
