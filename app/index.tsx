import MultifactorAuthenticationContextProvider from '@src/components/MultifactorAuthenticationContext';
import NavigationMockContextProvider, {Navigator} from '@src/components/NavigationMock';

export default function Index() {
    return (
        <NavigationMockContextProvider initialRoute="authorizeTransaction">
            <MultifactorAuthenticationContextProvider>
                <Navigator />
            </MultifactorAuthenticationContextProvider>
        </NavigationMockContextProvider>
    );
}
