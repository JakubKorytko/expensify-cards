import { BiometricsStatus, BiometricsStepWithStatus } from "../useBiometrics/types";

/**
 * It returns different types of status based on whether the authorization is chained or not.
 * If the authorization is chained, it returns a string, otherwise it returns a BiometricsStepWithStatus.
 */
type Register = {
    (params: { validateCode?: number; chainedWithAuthorization: true }): Promise<BiometricsStatus<string>>;
    (params: { validateCode?: number; chainedWithAuthorization?: false }): Promise<BiometricsStatus<BiometricsStepWithStatus>>;
    (params: { validateCode?: number; chainedWithAuthorization?: boolean }): Promise<BiometricsStatus<BiometricsStepWithStatus>> | Promise<BiometricsStatus<string>>;
}

type UseBiometricsStatus = [
    {
        /** Whether the device can use biometrics or a fallback credential */
        deviceSupportBiometrics: boolean;

        /** Whether the device already has a stored public key (i.e., setup done) */
        isBiometryConfigured: boolean;

        /** Whether the last step has finished or still needs user action */
        isRequestFulfilled: boolean;

        /** Whether the last step worked */
        wasRecentStepSuccessful: boolean | undefined;

        /** What the user must provide next (for example, a validation code) */
        requiredFactorForNextStep: string | undefined;

        /** Human‑readable strings describing the current state */
        message: string;

        /** Simple title i.e. Authorization/authentication successful/failed */
        title: string;
    },
    {
        /** Runs the setup; generates keys, saves them, and registers with the backend. */
        register: Register

        /** Removes any saved keys and refreshes the status. */
        resetSetup: () => Promise<BiometricsStatus<BiometricsStepWithStatus>>;

        /** Marks the current request as finished to unblock the UI. */
        fulfill: () => BiometricsStatus<BiometricsStepWithStatus>;
    },
]

export type { UseBiometricsStatus, Register };