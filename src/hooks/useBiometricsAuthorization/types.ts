import { BiometricsStatus } from "../useBiometricsStatus/types";

/**
 * Function that handles biometric authorization of transactions.
 * Takes a transaction ID, optional validate code, and optional chained private key status.
 * Returns a promise resolving to the authorization status.
 */
type BiometricsAuthorization = (params: {
    transactionID: string;
    validateCode?: number;
    chainedPrivateKeyStatus?: BiometricsStatus<string | null>;
}) => Promise<BiometricsStatus<boolean>>;

/**
 * Hook return type for biometric transaction authorization.
 * Provides current authorization status, authorize function to initiate authorization,
 * and fulfill function to complete/cancel the current authorization flow.
 */
type UseBiometricsAuthorization = {
    status: BiometricsStatus<boolean>;
    authorize: BiometricsAuthorization;
    fulfill: () => void;
};

export type {
    BiometricsAuthorization,
    UseBiometricsAuthorization,
};