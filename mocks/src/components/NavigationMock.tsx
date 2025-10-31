import type {ReactNode} from 'react';
import React, {createContext, useContext, useMemo, useState} from 'react';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type NavigationMockProps = {
    navigate: (newRoute: Route['route']) => void;
    route: Route;
    isActiveRoute: (route: Route) => boolean;
};

const NavigationMockContext = createContext<NavigationMockProps>({
    navigate: () => {},
    route: ROUTES.AUTHORIZE_TRANSACTION,
    isActiveRoute: () => false,
});

function NavigationMockContextProvider({children, initialRoute}: {children: ReactNode; initialRoute: Route}) {
    const [route, setRoute] = useState<Route>(initialRoute);

    const contextValue = useMemo(
        () => ({
            navigate: (newRoute: Route['route']) => {
                const newRouteObject = Object.values(ROUTES).find((value) => value.route === newRoute) as Route | undefined;
                setRoute(newRouteObject ?? ROUTES.NOT_FOUND);
            },
            isActiveRoute: (routeToCheck: Route) => {
                return routeToCheck.route === route.route;
            },
            route,
            homeScreen: initialRoute,
        }),
        [initialRoute, route],
    );

    return <NavigationMockContext.Provider value={contextValue}>{children}</NavigationMockContext.Provider>;
}

function Navigator() {
    const Navigation = useNavigation();

    const Component = SCREENS[Navigation.route.screen];

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
