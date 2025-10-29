import MultifactorAuthenticationContextProvider from '@components/MultifactorAuthenticationContext';
import NavigationMockContextProvider, {Navigator} from '@src/components/NavigationMock';
import ROUTES from '@src/ROUTES';

export default function Index() {
    return (
        <NavigationMockContextProvider initialRoute={ROUTES.AUTHORIZE_TRANSACTION}>
            <MultifactorAuthenticationContextProvider>
                <Navigator />
            </MultifactorAuthenticationContextProvider>
        </NavigationMockContextProvider>
    );
}
