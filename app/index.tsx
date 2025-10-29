import MultifactorAuthenticationContextProvider from '@components/MultifactorAuthenticationContext';
import NavigationMockContextProvider, {Navigator} from '@src/components/NavigationMock';
import CONFIG from '../mocks/config';

export default function Index() {
    return (
        <NavigationMockContextProvider initialRoute={CONFIG.initialRoute}>
            <MultifactorAuthenticationContextProvider>
                <Navigator />
            </MultifactorAuthenticationContextProvider>
        </NavigationMockContextProvider>
    );
}
