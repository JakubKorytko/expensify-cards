// eslint-disable-next-line import/extensions
import {WRITE_COMMANDS} from '@/mocks/api';
// eslint-disable-next-line import/extensions
import {USER_EMAIL} from '@/mocks/api/utils';
// eslint-disable-next-line import/order
import * as API from '@libs/API';

/**
 * Resend a validation link to a given login
 */
function requestValidateCodeAction() {
    API.write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, {
        email: USER_EMAIL,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {requestValidateCodeAction};
