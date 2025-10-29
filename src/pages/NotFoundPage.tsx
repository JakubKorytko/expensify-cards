import {View} from 'react-native';
import {useNavigation} from '@components/NavigationMock';
import HeaderWithBackButton from '@src/components/HeaderWithBackButton';
import {Pressable} from '@src/components/Pressable';
import Text from '@src/components/Text';
import ROUTES from '@src/ROUTES';
import styles from '@src/styles';

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage() {
    const {navigate} = useNavigation();

    return (
        <View style={styles.callbackContainer}>
            <View>
                <HeaderWithBackButton />
                <View style={styles.gap15}>
                    <Text style={styles.hugeText}>You should not be here!</Text>
                    <Text>Please go back</Text>
                </View>
            </View>
            <Pressable
                accessibilityRole="button"
                style={styles.greenButton}
                onPress={() => navigate(ROUTES.HOME_SCREEN)}
            >
                <Text style={styles.greenButtonText}>Got it</Text>
            </Pressable>
        </View>
    );
}

NotFoundPage.displayName = 'NotFoundPage';

export default NotFoundPage;
