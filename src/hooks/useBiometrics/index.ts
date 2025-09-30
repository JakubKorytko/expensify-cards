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
import type {
  Biometrics,
  BiometricsAuthenticationParams,
  BiometricsAuthorizationParams,
  BiometricsStatus,
  BiometricsStep,
  BiometricsStepWithStatus,
} from "./types";
import authorizeBiometricsAction, {
  getBiometricsAuthorizationFactors,
  verifyRequiredFactors,
} from "@libs/Biometrics/authorizeBiometricsAction";
import { requestValidateCodeAction } from "@libs/actions/User";
import { BiometricsStatusWithOTP } from "@libs/Biometrics/types";

/**
 * Hook used to run the biometrics process and receive feedback.
 */
function useBiometrics(): Biometrics {
  const [feedback, setFeedback] = useBiometricsFeedback();
  const storedValidateCode = useRef<number>(undefined);
  const [authStep, setAuthStep] = useState<BiometricsStepWithStatus>({
    /** What should be passed to the auth method parameters in the next call */
    requiredFactor: undefined,

    /** Whether the current auth process ended */
    done: true,

    /** Whether the biometrics was set up correctly and the device is able to authenticate using it. */
    configured: false,
  });

  /**
   * Main method to authorize a transaction using biometrics if available and configured,
   * or falling back to otp and validate code if not.
   * If biometrics is not configured, it will attempt to register it first.
   * If the registration is successful, it will attempt to authorize the transaction using biometrics right away.
   * You can check which factors are required by checking the requiredFactors property before calling this method.
   *
   * Note: If the device does not support biometrics, both validateCode and otp must be provided.
   * If the device supports biometrics, but it is not configured, validateCode must be provided.
   * If the device supports and is configured for biometrics, neither validateCode nor otp are needed.
   *
   * IMPORTANT: Using this method will display authentication prompt.
   */
  const runBiometrics = ({
    type,
    validateCode,
    transactionID,
    otp,
  }: BiometricsAuthenticationParams = {}): Promise<BiometricsStep> => {
    console.log(
      "runBiometrics",
      type,
      validateCode,
      transactionID,
      otp,
      storedValidateCode.current,
    );
    return getBiometricsAuthorizationFactors()
      .then<BiometricsStep>((requiredFactors) => {
        const isValidateCodeRequired = requiredFactors.includes(
          CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
        );
        const isOTPRequired = requiredFactors.includes(
          CONST.BIOMETRICS.AUTH_FACTORS.OTP,
        );

        // TODO: This logic is probably duplicated
        if (
          isOTPRequired &&
          isValidateCodeRequired &&
          type === CONST.BIOMETRICS.ACTION_TYPE.KEY
        ) {
          return {
            requiredFactor: undefined,
            done: true,
          };
        }

        const isValidateCodeVerified = !!storedValidateCode.current;

        if (
          isValidateCodeRequired &&
          !storedValidateCode.current &&
          !validateCode
        ) {
          return register().then(() => ({
            requiredFactor: CONST.BIOMETRICS.AUTH_FACTORS.VALIDATE_CODE,
            done: false,
          }));
        }

        if (type === CONST.BIOMETRICS.ACTION_TYPE.KEY) {
          return register(validateCode).then(() => ({
            requiredFactor: undefined,
            done: true,
          }));
        }

        if (!transactionID) {
          return Promise.resolve({
            requiredFactor: "TRANSACTION_ID",
            done: false,
          });
        }

        if ((isOTPRequired && !otp) || (!authStep.configured && !otp)) {
          return authorize({
            transactionID,
            validateCode,
            isValidateCodeVerified,
          }).then(({ value }) => {
            const isOTPRequired =
              typeof value === "boolean" ? false : value.isOTPRequired;
            const success =
              typeof value === "boolean" ? value : value.successful;

            if (validateCode && isOTPRequired && success) {
              storedValidateCode.current = validateCode;
            } else {
              storedValidateCode.current = undefined;
            }

            return {
              requiredFactor: isOTPRequired
                ? CONST.BIOMETRICS.AUTH_FACTORS.OTP
                : undefined,
              done: !isOTPRequired,
            };
          });
        }

        return authorize({
          validateCode: storedValidateCode.current,
          transactionID,
          otp,
          isValidateCodeVerified,
        }).then(() => {
          storedValidateCode.current = undefined;
          return {
            requiredFactor: undefined,
            done: true,
          };
        });
      })
      .then((result) => {
        setAuthStep((prevState) => ({
          ...prevState,
          ...result,
        }));
        return result;
      });
  };

  /**
   * We check whether the biometrics are configured by checking whether the public key is in the store.
   * This way user do not need to go through the authentication to check that as the public key does not require it.
   */
  const refreshStatus = useCallback(() => {
    BiometricsPublicKeyStore.get().then((key) => {
      setAuthStep((prevStep) => ({ ...prevStep, configured: !!key.value }));
    });
  }, []);

  useEffect(refreshStatus, [refreshStatus]);

  /**
   * Runs the biometrics process setup.
   *
   * If the biometrics are configured for the first time or get re-configured, a validateCode should be provided.
   *
   * The second parameter indicates whether the registration is chained with the authorization process.
   * Setting it to true will return private key saving status with the key value instead of the registration status.
   *
   * IMPORTANT: Using this method will display authentication prompt
   */
  const register = useCallback(
    (validateCode?: number, chainedWithAuthorization: boolean = false) => {
      const { privateKey, publicKey } = generateKeyPair();

      if (!validateCode) {
        requestValidateCodeAction();

        return Promise.resolve(
          setFeedback(
            {
              value: false,
              reason: "biometrics.reason.error.validateCodeMissing",
            },
            CONST.BIOMETRICS.ACTION_TYPE.KEY,
          ),
        );
      }

      /** Save generated key to the store */
      return BiometricsPrivateKeyStore.set(privateKey)
        .then((privateKeyResult) => {
          const privateKeyExists =
            privateKeyResult.reason ===
            "biometrics.reason.expoErrors.keyExists";

          if (!privateKeyResult.value) {
            if (privateKeyExists && !authStep.configured) {
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

          if (!isCallSuccessful) {
            BiometricsPrivateKeyStore.delete();
            BiometricsPublicKeyStore.delete();
          }

          const authReason: BiometricsStatus<boolean> = {
            value: isCallSuccessful,
            reason: isCallSuccessful ? successMessage : reason,
            type: privateKeyResult.type,
          };

          refreshStatus();

          /** Everything cool, let's save and return the feedback */
          const feedback = setFeedback(
            authReason,
            CONST.BIOMETRICS.ACTION_TYPE.KEY,
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
          return setFeedback(status, CONST.BIOMETRICS.ACTION_TYPE.KEY);
        });
    },
    [authStep.configured, refreshStatus, setFeedback],
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
            return setFeedback(result, CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE);
          })
          .catch((status) => {
            refreshStatus();
            /** Oops, something went wrong, let's return the feedback */
            return setFeedback(status, CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE);
          })
      );
    },
    [refreshStatus, setFeedback],
  );

  /**
   * Internal method to authorize transaction using otp and validate code.
   * This is used when biometrics is not available on the device.
   */
  const authorizeUsingOTPAndValidateCode = useCallback(
    ({
      otp,
      validateCode,
      transactionID,
      isValidateCodeVerified,
    }: BiometricsAuthorizationParams): Promise<BiometricsStatusWithOTP> => {
      return authorizeBiometricsAction(
        CONST.BIOMETRICS.DEVICE_BIOMETRICS_STATUS.NOT_SUPPORTED,
        transactionID,
        {
          validateCode,
          otp,
        },
        isValidateCodeVerified,
      ).then((result) => {
        setFeedback(
          {
            ...result,
            value: result.value.successful,
          },
          CONST.BIOMETRICS.ACTION_TYPE.CHALLENGE,
        );
        return result;
      });
    },
    [setFeedback],
  );

  const authorize = useCallback(
    ({
      transactionID,
      validateCode,
      otp,
      isValidateCodeVerified = true,
    }: Partial<BiometricsAuthorizationParams> & {
      transactionID: string;
    }): Promise<BiometricsStatus<boolean> | BiometricsStatusWithOTP> => {
      return getBiometricsAuthorizationFactors().then((requiredFactors) => {
        const check = verifyRequiredFactors({
          otp,
          validateCode,
          requiredFactors,
          isValidateCodeVerified,
        });

        if (!check.value) {
          return Promise.resolve(
            setFeedback(
              check,
              CONST.BIOMETRICS.ACTION_TYPE[
                authStep.configured ? "CHALLENGE" : "KEY"
              ],
            ),
          );
        }

        const { biometrics, credentials } =
          BiometricsPublicKeyStore.supportedAuthentication;

        // TODO: This probably shouldn't be here at it is related to challenge, not register process
        if (!biometrics && !credentials) {
          return authorizeUsingOTPAndValidateCode({
            otp,
            validateCode: validateCode!,
            transactionID,
            isValidateCodeVerified,
          });
        }

        if (!authStep.configured) {
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
      });
    },
    [
      authStep.configured,
      authorizeUsingOTPAndValidateCode,
      challenge,
      register,
      setFeedback,
    ],
  );

  return [{ ...authStep, feedback }, runBiometrics];
}

export default useBiometrics;
