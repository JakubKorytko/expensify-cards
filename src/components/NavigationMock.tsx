import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo, useState} from 'react';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type NavigationMockProps = {
    navigate: (newRoute: keyof typeof ROUTES | 'homeScreen') => void;
    route: keyof typeof ROUTES;
};

const NavigationMockContext = createContext<NavigationMockProps>({
    navigate: () => {},
    route: 'authorizeTransaction',
});

function NavigationMockContextProvider({children, initialRoute}: {children: ReactNode; initialRoute: keyof typeof ROUTES}) {
    const [route, setRoute] = useState<keyof typeof ROUTES>(initialRoute);

    const contextValue = useMemo(
        () => ({
            navigate: (newRoute: keyof typeof ROUTES | 'homeScreen') => {
                setRoute(newRoute === 'homeScreen' ? initialRoute : newRoute);
            },
            route,
        }),
        [initialRoute, route],
    );

    return <NavigationMockContext.Provider value={contextValue}>{children}</NavigationMockContext.Provider>;
}

function Navigator() {
    const {route} = useNavigation();

    const Component = SCREENS[ROUTES[route]];

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
