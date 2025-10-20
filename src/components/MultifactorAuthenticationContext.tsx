// import React, {createContext, useContext, useMemo, useState} from 'react';
// import type {ReactNode} from 'react';
// import useMergedHooks from '@hooks/useMergedHooks';
// import {EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS} from '@hooks/useMultifactorAuthentication/helpers';
// import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/types';
// import CONST from '@src/CONST';
//
// type MultifactorAuthenticationContextType<T extends MultifactorAuthenticationScenario> = {
//     isBiometryConfigured: boolean;
//     deviceSupportBiometrics: boolean;
//     status: MultifactorAuthenticationStatus<boolean>;
//     process: (params: MultifactorAuthenticationScenarioParams<T>) => Promise<MultifactorAuthenticationStatus<boolean | undefined>>;
//     revoke: () => Promise<MultifactorAuthenticationStatus<boolean>>;
//     cancel: () => MultifactorAuthenticationStatus<boolean>;
// };
//
// const MultifactorAuthenticationContext = createContext<MultifactorAuthenticationContextType<typeof CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.SETUP_BIOMETRICS>>({
//     isBiometryConfigured: false,
//     deviceSupportBiometrics: false,
//     status: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
//     process: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
//     revoke: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
//     cancel: () => EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
// });
//
// type MultifactorAuthenticationContextProviderProps<T extends MultifactorAuthenticationScenario> = {
//     /**
//      * The children of the full screen loader context provider.
//      */
//     children: ReactNode;
//
//     scenario: T;
// };
//
// function MultifactorAuthenticationContextProvider<T extends MultifactorAuthenticationScenario>({children, scenario}: MultifactorAuthenticationContextProviderProps<T>) {
//     const MultifactorAuthenticationData = useMergedHooks(scenario);
//
//     return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationData}>{children}</MultifactorAuthenticationContext.Provider>;
// }
//
// function useFullScreenLoader() {
//     const context = useContext(MultifactorAuthenticationContext);
//
//     if (!context) {
//         throw new Error('useFullScreenLoader must be used within a MultifactorAuthenticationContextProvider');
//     }
//
//     return context;
// }
//
// MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';
//
// export default MultifactorAuthenticationContextProvider;
// export {MultifactorAuthenticationContext, useFullScreenLoader};
