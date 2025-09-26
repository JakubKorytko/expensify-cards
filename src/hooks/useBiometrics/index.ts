import { useCallback, useEffect, useRef, useState } from "react";
import { generateKeyPair } from "@libs/ED25519";
import {
  BiometricsPrivateKeyStore,
  BiometricsPublicKeyStore,
} from "@libs/Biometrics/BiometricsKeyStore";
import CONST from "@src/CONST";
import BiometricsChallenge from "@libs/Biometrics/BiometricsChallenge";
import useBiometricsFeedback from "./useBiometricsFeedback";
import { registerBiometrics } from "@libs/actions/Biometrics";
import type { Biometrics, BiometricsStatus } from "./types";
import authorizeBiometricsAction, {
  getBiometricsAuthorizationFactors,
  verifyRequiredFactors,
} from "@libs/Biometrics/authorizeBiometricsAction";
import { BiometricsAuthFactor } from "@libs/Biometrics/types";

/**
 * Hook used to run the biometrics process and receive feedback.
 * For detailed documentation on the methods and properties see types file.
 */
function useBiometrics(): Biometrics {
  const [status, setStatus] = useState<boolean>(false);
  const [feedback, setFeedback] = useBiometricsFeedback();
  const [requiredFactors, setRequiredFactors] = useState<
    BiometricsAuthFactor[]
  >([]);
  const isMagicCodeVerified = useRef(false);

  /**
   * We check whether the biometrics are configured by checking whether the public key is in the store.
   * This way user do not need to go through the authentication to check that as the public key does not require it.
   * We also get the required authorization factors.
   */
  const refreshStatus = useCallback(() => {
    BiometricsPublicKeyStore.get()
      .then((key) => {
        setStatus(!!key.value);
        return getBiometricsAuthorizationFactors();
      })
      .then(setRequiredFactors);
  }, []);

  useEffect(refreshStatus, [refreshStatus]);

  const register = useCallback(
    (validateCode?: number, chainedWithAuthorization: boolean = false) => {
      const { privateKey, publicKey } = generateKeyPair();

      /** Save generated key to the store */
      return BiometricsPrivateKeyStore.set(privateKey)
        .then((privateKeyResult) => {
          const privateKeyExists =
            privateKeyResult.reason ===
            "biometrics.reason.expoErrors.keyExists";

          if (!privateKeyResult.value) {
            if (privateKeyExists && !status) {
              /**
               * If the private key exists, but the public one does not, we end up having the interaction blocked.
               * We remove the private key and stop the execution to unblock the auth process.
               *
               * This may be handled by getting the public key from BE,
               * but it is not worth doing as this should never actually happen in the real app.
               */
              BiometricsPrivateKeyStore.delete().then(() => {
                throw privateKeyResult;
              });
            }
            throw privateKeyResult;
          }
          /** If it was saved successfully, save public one as well */
          return Promise.all([
            privateKeyResult,
            BiometricsPublicKeyStore.set(publicKey),
          ]);
        })
        .then(([privateKeyResult, publicKeyResult]) => {
          if (!publicKeyResult.value) throw publicKeyResult;
          /** If both keys were saved call the API to register biometrics */
          return Promise.all([
            privateKeyResult,
            registerBiometrics(publicKey, validateCode),
          ]);
        })
        .then(([privateKeyResult, { httpCode, reason }]) => {
          const successMessage = "biometrics.reason.success.keyPairGenerated";

          const isCallSuccessful = httpCode === 200;

          const authReason: BiometricsStatus<boolean> = {
            value: isCallSuccessful,
            reason: isCallSuccessful ? successMessage : reason,
            type: privateKeyResult.type,
          };

          refreshStatus();

          /** Everything cool, let's save and return the feedback */
          const feedback = setFeedback(
            authReason,
            CONST.BIOMETRICS.FEEDBACK_TYPE.KEY,
          );

          /**
           * If the registration is chained with the authorization process,
           * return the private key instead of the registration status
           */
          if (chainedWithAuthorization && isCallSuccessful) {
            return {
              ...privateKeyResult,
              value: privateKey,
            } as BiometricsStatus<string>;
          }

          return feedback;
        })
        .catch((status) => {
          /** Oops, there was a problem, let the user know why */
          return setFeedback(status, CONST.BIOMETRICS.FEEDBACK_TYPE.KEY);
        });
    },
    [refreshStatus, setFeedback, status],
  );

  /**
   * Internal method to request, sign and verify biometrics challenge.
   * Validate code is only needed if the device is not configured for biometrics, or it is re-registering.
   * The chainedPrivateKeyStatus parameter can be used to provide the private key if it was already obtained,
   * to avoid displaying the authentication prompt twice.
   *
   * IMPORTANT: Using this method will display authentication prompt if the chainedPrivateKeyStatus is not provided
   */
  const challenge = useCallback(
    (
      transactionID: string,
      validateCode?: number,
      chainedPrivateKeyStatus?: BiometricsStatus<string | null>,
    ) => {
      const challenge = new BiometricsChallenge(transactionID);

      return (
        challenge
          /** Ask for the challenge */
          .request()
          .then((status) => {
            if (!status.value) throw status;
            /** If it is ok, sign it */
            return challenge.sign(chainedPrivateKeyStatus);
          })
          .then((signature) => {
            if (!signature.value) throw signature;
            /** Signed correctly? Send it to verify */
            return challenge.send(validateCode);
          })
          .then((result) => {
            refreshStatus();
            /** Everything ok, let's return the feedback */
            return setFeedback(
              result,
              CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE,
            );
          })
          .catch((status) => {
            refreshStatus();
            /** Oops, something went wrong, let's return the feedback */
            return setFeedback(
              status,
              CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE,
            );
          })
      );
    },
    [refreshStatus, setFeedback],
  );

  /**
   * Internal method to authorize transaction using otp and magic code.
   * This is used when biometrics is not available on the device.
   */
  const authorizeUsingOTPAndMagicCode = useCallback(
    ({
      otp,
      validateCode,
      transactionID,
    }: {
      otp?: number;
      validateCode: number;
      transactionID: string;
    }) => {
      return authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_SUPPORTED,
        transactionID,
        {
          validateCode,
          otp,
        },
      ).then((result) => {
        if (result.value) {
          isMagicCodeVerified.current = !isMagicCodeVerified.current;
        }
        return setFeedback(result, CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE);
      });
    },
    [setFeedback],
  );

  const authorize = useCallback(
    ({
      transactionID,
      validateCode,
      otp,
    }: {
      transactionID: string;
      validateCode?: number;
      otp?: number;
    }) => {
      const check = verifyRequiredFactors({
        otp,
        validateCode,
        requiredFactors,
        isMagicCodeVerified: isMagicCodeVerified.current,
      });

      if (!check.value) {
        return Promise.resolve(
          setFeedback(check, CONST.BIOMETRICS.FEEDBACK_TYPE.CHALLENGE),
        );
      }

      const { biometrics, credentials } =
        BiometricsPublicKeyStore.supportedAuthentication;

      if (!biometrics && !credentials) {
        return authorizeUsingOTPAndMagicCode({
          otp,
          validateCode: validateCode!,
          transactionID,
        });
      }

      if (!status) {
        /** Biometrics is not configured, let's do that first */
        /** Run the setup method */
        return register(validateCode, true).then((requestStatus) => {
          if (!requestStatus.value)
            return {
              ...requestStatus,
              value: false,
            };
          /** Setup was successful and auto run was not disabled, let's run the challenge right away */
          const privateKeyIncluded = typeof requestStatus.value === "string";

          return challenge(
            transactionID,
            validateCode,
            privateKeyIncluded ? requestStatus : undefined,
          );
        });
      }

      /** Biometrics is configured already, let's do the challenge logic */
      return challenge(transactionID, validateCode);
    },
    [
      authorizeUsingOTPAndMagicCode,
      challenge,
      register,
      requiredFactors,
      setFeedback,
      status,
    ],
  );

  return {
    feedback,
    status,
    register,
    requiredFactors,
    authorize,
  };
}

export default useBiometrics;
