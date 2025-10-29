import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo, useState} from 'react';
import type {HomeScreen, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type NavigationMockProps = {
    navigate: (newRoute: Route | HomeScreen) => void;
    route: Route;
};

const NavigationMockContext = createContext<NavigationMockProps>({
    navigate: () => {},
    route: ROUTES.AUTHORIZE_TRANSACTION,
});

function NavigationMockContextProvider({children, initialRoute}: {children: ReactNode; initialRoute: Route}) {
    const [route, setRoute] = useState<Route>(initialRoute);

    const contextValue = useMemo(
        () => ({
            navigate: (newRoute: Route | HomeScreen) => {
                setRoute(newRoute === ROUTES.HOME_SCREEN ? initialRoute : newRoute);
            },
            route,
            homeScreen: initialRoute,
        }),
        [initialRoute, route],
    );

    return <NavigationMockContext.Provider value={contextValue}>{children}</NavigationMockContext.Provider>;
}

function Navigator() {
    const {route} = useNavigation();

    const Component = SCREENS[route];

    return <Component />;
}

function useNavigation(): NavigationMockProps {
    const context = useContext(NavigationMockContext);

    if (!context) {
        throw new Error('useNavigation must be used within a NavigationMockContextProvider');
    }

    return context;
}

NavigationMockContextProvider.displayName = 'NavigationMockContextProvider';

export default NavigationMockContextProvider;
export {NavigationMockContext, useNavigation, Navigator};
