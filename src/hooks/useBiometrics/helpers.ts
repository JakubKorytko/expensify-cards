import { CreateBiometricsRecentStatus } from "./types";

/**
 * Creates a BiometricsRecentStatus object that contains both the status and fulfill method.
 * The status includes whether the most recent biometric step was successful.
 * The fulfill method is used to complete/acknowledge the biometric operation.
 */
const createRecentStatus: CreateBiometricsRecentStatus = (result, fulfillMethod) => ({
    status: { ...result, value: !!result.status.wasRecentStepSuccessful },
    fulfillMethod
});

export { createRecentStatus }