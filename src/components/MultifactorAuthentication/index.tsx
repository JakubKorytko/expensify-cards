import React, { useState } from "react";
import type { MultifactorAuthorizationFallbackScenario } from "@libs/MultifactorAuthentication/types";
import useMultifactorAuthorizationFallback from "@hooks/useMultifactorAuthentication/useMultifactorAuthorizationFallback";
import CONST from "@src/CONST";
import InputModal from "@src/components/Modals/InputModal";
import useLocalize from "@hooks/useLocalize";
import { areMultifactorAuthorizationFallbackParamsValid } from "@hooks/useMultifactorAuthentication/helpers";
import InfoModal from "@src/components/Modals/InfoModal";
import type {
  MultifactorAuthorizationFallbackProps,
  ExtendedMultifactorAuthenticationStatus,
} from "./types";

function MultifactorAuthentication<
  T extends MultifactorAuthorizationFallbackScenario,
>({ children, scenario, params }: MultifactorAuthorizationFallbackProps<T>) {
  const MultifactorAuthorizationFallback =
    useMultifactorAuthorizationFallback(scenario);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { translate } = useLocalize();

  // Authorization handler
  const handleAuthorize = async (props: Record<string, unknown> = {}) => {
    setShowModal(false);

    if (!areMultifactorAuthorizationFallbackParamsValid(scenario, props)) {
      return;
    }

    await MultifactorAuthorizationFallback.authorize({
      ...props,
      ...params,
    });

    setShowModal(true);
  };

  // Handle successful authentication
  const hasAccess =
    !!MultifactorAuthorizationFallback.wasRecentStepSuccessful &&
    MultifactorAuthorizationFallback.isRequestFulfilled;
  const shouldShowSecret = hasAccess && !showModal;

  const status: ExtendedMultifactorAuthenticationStatus<T> = {
    ...MultifactorAuthorizationFallback,
    isModalShown: showModal,
  };

  const renderMultifactorAuthenticationInput = (
    factor: string,
    paramName: string,
  ) => (
    <InputModal
      onSubmit={(value) => {handleAuthorize({ [paramName]: value })}}
      title={translate(`multifactorAuthentication.provide${factor}`)}
    />
  );

  return (
    <>
      {children(shouldShowSecret, handleAuthorize, status)}

      {showModal && MultifactorAuthorizationFallback.isRequestFulfilled && (
        <InfoModal
          message={MultifactorAuthorizationFallback.message}
          title={MultifactorAuthorizationFallback.title}
          success={MultifactorAuthorizationFallback.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {MultifactorAuthorizationFallback.requiredFactorForNextStep ===
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE &&
        renderMultifactorAuthenticationInput(
          "ValidateCode",
          CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS.VALIDATE_CODE
            .parameter,
        )}
      {MultifactorAuthorizationFallback.requiredFactorForNextStep ===
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP &&
        renderMultifactorAuthenticationInput(
          "OTPCode",
          CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS.OTP.parameter,
        )}
    </>
  );
}

export default MultifactorAuthentication;
