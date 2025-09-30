import * as API from "@libs/API";
import { WRITE_COMMANDS } from "@/mocks/api";
import { USER_EMAIL } from "@/mocks/api/utils";

/**
 * Resend a validation link to a given login
 */
function requestValidateCodeAction() {
  API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, {
    email: USER_EMAIL,
  });
}

export { requestValidateCodeAction };
