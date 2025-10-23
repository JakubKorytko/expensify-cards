import React, {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import useMultifactorAuthentication from '@hooks/useMultifactorAuthentication';
import {EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS} from '@hooks/useMultifactorAuthentication/helpers';
import type {UseMultifactorAuthentication} from '@hooks/useMultifactorAuthentication/types';

const MultifactorAuthenticationContext = createContext<UseMultifactorAuthentication>({
    isBiometryConfigured: false,
    deviceSupportBiometrics: false,
    ...EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.step,
    message: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.message,
    title: EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS.title,
    process: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    provideFactor: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    revoke: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    cancel: () => EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    done: () => EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS,
    softPromptDecision: () => Promise.resolve(EMPTY_MULTIFACTOR_AUTHENTICATION_STATUS),
    success: undefined,
});

type MultifactorAuthenticationContextProviderProps = {
    /**
     * The children of the full screen loader context provider.
     */
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const MultifactorAuthenticationData = useMultifactorAuthentication();

    return <MultifactorAuthenticationContext.Provider value={MultifactorAuthenticationData}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthenticationContext(): UseMultifactorAuthentication {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationContext must be used within a MultifactorAuthenticationContextProvider');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export default MultifactorAuthenticationContextProvider;
export {MultifactorAuthenticationContext, useMultifactorAuthenticationContext};
