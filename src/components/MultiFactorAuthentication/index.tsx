import React, { useState } from "react";
import { MultiFactorAuthorizationFallbackScenario } from "@libs/MultiFactorAuthentication/scenarios/types";
import useMultiFactorAuthorizationFallback from "@hooks/useMultiAuthentication/useMultiFactorAuthorizationFallback";
import CONST from "@src/CONST";
import InputModal from "@src/components/Modals/InputModal";
import useLocalize from "@hooks/useLocalize";
import { areMultiFactorAuthorizationFallbackParamsValid } from "@hooks/useMultiAuthentication/helpers";
import InfoModal from "@src/components/Modals/InfoModal";
import {
  MultiFactorAuthorizationFallbackProps,
  ExtendedMultiFactorAuthenticationStatus,
} from "@src/components/MultiFactorAuthentication/types";

function MultiFactorAuthentication<
  T extends MultiFactorAuthorizationFallbackScenario,
>({ children, scenario, params }: MultiFactorAuthorizationFallbackProps<T>) {
  const MultiFactorAuthorizationFallback =
    useMultiFactorAuthorizationFallback(scenario);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { translate } = useLocalize();

  // Authorization handler
  const handleAuthorize = async (props: Record<string, unknown> = {}) => {
    setShowModal(false);

    if (!areMultiFactorAuthorizationFallbackParamsValid(scenario, props)) {
      return;
    }

    await MultiFactorAuthorizationFallback.authorize({
      ...props,
      ...params,
    });

    setShowModal(true);
  };

  // Handle successful authentication
  const hasAccess =
    !!MultiFactorAuthorizationFallback.wasRecentStepSuccessful &&
    MultiFactorAuthorizationFallback.isRequestFulfilled;
  const shouldShowSecret = hasAccess && !showModal;

  const status: ExtendedMultiFactorAuthenticationStatus<T> = {
    ...MultiFactorAuthorizationFallback,
    isModalShown: showModal,
  };

  const renderMultiFactorAuthenticationInput = (
    factor: string,
    paramName: string,
  ) => (
    <InputModal
      onSubmit={(value) => handleAuthorize({ [paramName]: value })}
      title={translate(`multiFactorAuthentication.provide${factor}`)}
    />
  );

  return (
    <>
      {children(shouldShowSecret, handleAuthorize, status)}

      {showModal && MultiFactorAuthorizationFallback.isRequestFulfilled && (
        <InfoModal
          message={MultiFactorAuthorizationFallback.message}
          title={MultiFactorAuthorizationFallback.title}
          success={MultiFactorAuthorizationFallback.wasRecentStepSuccessful}
          onClose={() => setShowModal(false)}
        />
      )}
      {MultiFactorAuthorizationFallback.requiredFactorForNextStep ===
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE &&
        renderMultiFactorAuthenticationInput(
          "ValidateCode",
          CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS.VALIDATE_CODE
            .parameter,
        )}
      {MultiFactorAuthorizationFallback.requiredFactorForNextStep ===
        CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS.OTP &&
        renderMultiFactorAuthenticationInput(
          "OTPCode",
          CONST.MULTI_FACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS.OTP.parameter,
        )}
    </>
  );
}

export default MultiFactorAuthentication;
