import {View} from 'react-native';
import RevokeButton from '@components/MultifactorAuthentication/RevokeButton';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import {Pressable} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import styles from '@src/styles';

function AuthorizeTransactionPage() {
    const transactionID = '123456789';
    const {process, trigger, info} = useMultifactorAuthenticationContext();
    const {translate} = useLocalize();

    return (
        <View style={[styles.layoutContainer]}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>{translate('multifactorAuthentication.title', {registered: info.isBiometryConfigured})}</Text>
                    <View style={styles.buttonContainer}>
                        <Pressable
                            accessibilityRole="button"
                            style={styles.button}
                            onPress={() => {
                                process(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID});
                            }}
                        >
                            <Text style={styles.buttonText}>Test</Text>
                        </Pressable>
                        <RevokeButton
                            revoke={() => {
                                trigger(CONST.MULTI_FACTOR_AUTHENTICATION.TRIGGER.REVOKE);
                            }}
                            show={info.isBiometryConfigured}
                        />
                    </View>
                </View>
            </View>
            {info.success ? <Text style={styles.hugeText}>I am the secret!</Text> : <Text style={styles.hugeText}>Secret is hidden!</Text>}
        </View>
    );
}

AuthorizeTransactionPage.displayName = 'AuthorizeTransactionPage';

export default AuthorizeTransactionPage;
