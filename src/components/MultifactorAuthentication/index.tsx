import React, { useState } from "react";
import { BiometricsFallbackScenario } from "@libs/Biometrics/scenarios/types";
import useBiometricsAuthorizationFallback from "@hooks/useMultiAuthentication/useBiometricsAuthorizationFallback";
import CONST from "@src/CONST";
import BiometricsInputModal from "@src/components/Modals/BiometricsInputModal";
import useLocalize from "@hooks/useLocalize";
import { areBiometricsFallbackParamsValid } from "@hooks/useMultiAuthentication/helpers";
import BiometricsInfoModal from "@src/components/Modals/BiometricsInfoModal";
import {
  BiometricsFallbackProps,
  ExtendedBiometricsStatus,
} from "@src/components/MultifactorAuthentication/types";

type MultifactorConfig = {
  allowBiometrics?: boolean;
  allowTwoFactor?: boolean;
  allowSetup?: boolean;
};

function MultifactorAuthentication<T extends BiometricsFallbackScenario>({
  children,
  scenario,
  params,
}: BiometricsFallbackProps<T>) {
  const BiometricsFallback = useBiometricsAuthorizationFallback(scenario);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { translate } = useLocalize();

  // Authorization handler
  const handleAuthorize = async (props: Record<string, unknown> = {}) => {
    setShowModal(false);

    if (!areBiometricsFallbackParamsValid(scenario, props)) {
      return;
    }

    await BiometricsFallback.authorize({
      ...props,
      ...params,
    });

    setShowModal(true);
  };

  // Handle successful authentication
  const hasAccess =
    !!BiometricsFallback.wasRecentStepSuccessful &&
    BiometricsFallback.isRequestFulfilled;
  const shouldShowSecret = hasAccess && !showModal;

  const status: ExtendedBiometricsStatus<T> = {
    ...BiometricsFallback,
    isModalShown: showModal,
  };

  const renderBiometricsInput = (factor: string, paramName: string) => (
    <BiometricsInputModal
      onSubmit={(value) => handleAuthorize({ [paramName]: value })}
      title={translate(`biometrics.provide${factor}`)}
    />
  );

  return (
    <>
      {children(shouldShowSecret, handleAuthorize, status)}

      {showModal && BiometricsFallback.isRequestFulfilled && (
        <BiometricsInfoModal
          message={BiometricsFallback.message}
          title={BiometricsFallback.title}
          success={BiometricsFallback.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {BiometricsFallback.requiredFactorForNextStep ===
        CONST.BIOMETRICS.FACTORS.VALIDATE_CODE &&
        renderBiometricsInput(
          "ValidateCode",
          CONST.BIOMETRICS.FACTORS_REQUIREMENTS.VALIDATE_CODE.parameter,
        )}
      {BiometricsFallback.requiredFactorForNextStep ===
        CONST.BIOMETRICS.FACTORS.OTP &&
        renderBiometricsInput(
          "OTPCode",
          CONST.BIOMETRICS.FACTORS_REQUIREMENTS.OTP.parameter,
        )}
    </>
  );
}

export default MultifactorAuthentication;
