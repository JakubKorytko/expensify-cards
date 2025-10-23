import {useCallback, useState} from 'react';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@libs/MultifactorAuthentication/types';
import localStorage from '@src/localStorage';

type SoftPromptData<T extends MultifactorAuthenticationScenario> = {
    scenario: T;
    params?: MultifactorAuthenticationScenarioParams<T>;
};

function useMultifactorAuthenticationSoftPrompt() {
    const [scenarioData, setScenarioData] = useState<SoftPromptData<MultifactorAuthenticationScenario> | undefined>(undefined);
    const [accepted, setAccepted] = useState<boolean | undefined>(undefined);

    const decision = useCallback((hasBeenAccepted: boolean) => {
        localStorage.set('softPromptAccepted', hasBeenAccepted);
        setAccepted(hasBeenAccepted);
    }, []);

    const storeScenarioData = <T extends MultifactorAuthenticationScenario>(scenario: SoftPromptData<T>['scenario'], params?: SoftPromptData<T>['params']) =>
        setScenarioData({
            scenario,
            params,
        });

    const retrieveScenarioData = useCallback(() => {
        const data = scenarioData;
        setScenarioData(undefined);
        return data;
    }, [scenarioData]);

    return {
        accepted,
        retrieveScenarioData,
        storeScenarioData,
        process,
        decision,
    };
}

export default useMultifactorAuthenticationSoftPrompt;
