import { BiometricsStatus } from "../useBiometricsStatus/types";

/**
 * Function type for authorizing transactions when biometrics is not available.
 * Uses OTP and validate code as alternative authentication factors.
 * Returns a status containing the validate code if successful.
 */
type AutorizeUsingFallback = (params: {
    otp?: number;
    validateCode?: number;
    transactionID: string;
}) => Promise<BiometricsStatus<number | undefined>>;

/**
 * Hook return type for biometrics fallback authorization.
 * Provides status tracking, authorization function, and request fulfillment.
 * Status tracks the current validate code and authorization state.
 */
type UseBiometricsAuthorizationFallback = {
    status: BiometricsStatus<number | undefined>;
    authorize: AutorizeUsingFallback;
    fulfill: () => BiometricsStatus<number | undefined>;
};

export type {
    AutorizeUsingFallback,
    UseBiometricsAuthorizationFallback,
};