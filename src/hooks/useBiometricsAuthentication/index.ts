import { useCallback, useEffect, useMemo } from "react";
import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/Biometrics/BiometricsKeyStore";
import { generateKeyPair } from "@libs/ED25519";
import { requestValidateCodeAction } from "@libs/actions/User";
import CONST from "@src/CONST";
import { registerBiometrics } from "@libs/actions/Biometrics";
import {
  BiometricsStatus,
  BiometricsStepWithStatus,
} from "@hooks/useBiometrics/types";
import useBiometricsStatus from "../useBiometricsStatus";
import {
  Status,
  resetKeys,
  isBiometryConfigured,
  INITIAL_BIOMETRICS_STATUS,
  doesDeviceSupportBiometrics,
} from "./helpers";
import { Register, UseBiometricsStatus } from "./types";

/**
 * Manages biometrics setup; exposes current state (values) and actions (steps).
 *
 * High‑level hook that drives the biometrics setup flow. It tells the UI what state it's in (values)
 * and offers actions (steps) to move forward.
 *
 * For detailed documentation on the return value, see types file.
 */
function useBiometricsAuthentication(): UseBiometricsStatus {
  /** Whether the biometrics was set up correctly and the device is able to authenticate using it. */
  const [status, setStatus] = useBiometricsStatus<BiometricsStepWithStatus>(
    INITIAL_BIOMETRICS_STATUS,
    CONST.BIOMETRICS.ACTION_TYPE.KEY,
    (state) => !!state.value.wasRecentStepSuccessful,
  );

  /**
   * Marks the current status as fulfilled. This clears any pending
   * required factor if present, and retains the last success flag.
   */
  const fulfill = useCallback(
    () => setStatus(Status.createFulfillStatus),
    [setStatus],
  );

  const deviceSupportBiometrics = useMemo(doesDeviceSupportBiometrics, []);

  /**
   * Refreshes configuration status by probing if a public key exists in secure storage.
   * Avoids prompting authentication since a public key read does not require it.
   */
  const refreshStatus = useCallback(async () => {
    const isConfigured = await isBiometryConfigured();
    return setStatus(Status.createRefreshStatusStatus(isConfigured));
  }, [setStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /**
   * Removes both keys from secure storage and then refreshes status.
   * Useful when local keys exist but are not registered on backend.
   */
  const resetSetup = useCallback(async () => {
    await resetKeys();
    return refreshStatus();
  }, [refreshStatus]);

  /**
   * Starts the registration flow.
   * - If the device is unsupported, we set a friendly message and stop.
   * - If a validation code is missing, we trigger requesting it and tell the UI what is needed.
   * - When ready, we generate a keypair, save it, and call the backend to complete registration.
   * - On failure we clean up local keys; on success we update the status.
   * - In a chained auth flow, a successful run returns the private key so the next step can continue.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  const register = useCallback(
    async ({ validateCode, chainedWithAuthorization }) => {
      /** Guard unsupported device */
      if (!doesDeviceSupportBiometrics()) {
        return setStatus(Status.createUnsupportedDeviceStatus);
      }

      /** Guard missing validation code and request it */
      if (!validateCode) {
        requestValidateCodeAction();
        return setStatus(Status.createValidateCodeMissingStatus);
      }

      /** Generate a new ED25519 keypair */
      const { privateKey, publicKey } = generateKeyPair();

      /** Save private key (handles existing/conflict cases) */
      const privateKeyResult = await BiometricsPrivateKeyStore.set(privateKey);
      const privateKeyExists =
        privateKeyResult.reason === "biometrics.reason.expoErrors.keyExists";

      if (!privateKeyResult.value) {
        if (privateKeyExists && !status.value.isBiometryConfigured) {
          /**
           * If the private key exists, but the public one does not, we end up having the interaction blocked.
           * We remove the private key and stop the execution to unblock the auth process.
           *
           * This may be handled by getting the public key from BE,
           * but it is not worth doing as this should never actually happen in the real app.
           */
          await BiometricsPrivateKeyStore.delete();
        }
        return setStatus(Status.createKeyErrorStatus(privateKeyResult));
      }

      /** Save public key */
      const publicKeyResult = await BiometricsPublicKeyStore.set(publicKey);
      if (!publicKeyResult.value) {
        return setStatus(Status.createKeyErrorStatus(publicKeyResult));
      }

      /** Call backend to register the public key */
      const { httpCode, reason } = await registerBiometrics(
        publicKey,
        validateCode,
      );

      const successMessage = "biometrics.reason.success.keyPairGenerated";
      const isCallSuccessful = String(httpCode).startsWith("2");

      /** Cleanup keys on failure to avoid partial state */
      if (!isCallSuccessful) {
        await resetKeys();
      }

      const authReason = {
        value: isCallSuccessful,
        reason: isCallSuccessful ? successMessage : reason,
        type: privateKeyResult.type,
      };

      /** Persist and return the status */
      const statusResult = setStatus(
        Status.createRegistrationResultStatus(authReason),
      );

      await refreshStatus();

      /** In chained flow, return the private key on success */
      if (chainedWithAuthorization && isCallSuccessful) {
        return {
          ...privateKeyResult,
          value: privateKey,
        } as BiometricsStatus<string>;
      }

      return statusResult;
    },
    [setStatus, refreshStatus, status.value.isBiometryConfigured],
  ) as Register;

  const values = useMemo(
    () => ({
      deviceSupportBiometrics,
      ...status.value,
      message: status.message,
      title: status.title,
    }),
    [deviceSupportBiometrics, status],
  );

  const actions = useMemo(
    () => ({
      register,
      resetSetup,
      fulfill,
    }),
    [register, resetSetup, fulfill],
  );

  return [values, actions];
}

export default useBiometricsAuthentication;
