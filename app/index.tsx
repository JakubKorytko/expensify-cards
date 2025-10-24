import MultifactorAuthenticationContextProvider from '@components/MultifactorAuthenticationContext';
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
