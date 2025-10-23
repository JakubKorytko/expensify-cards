// eslint-disable-next-line import/extensions
import {WRITE_COMMANDS} from '@/mocks/api';
// eslint-disable-next-line import/extensions
import {USER_EMAIL} from '@/mocks/api/utils';
// eslint-disable-next-line import/order
import {write} from '@libs/API';

/**
 * Resend a validation link to a given login
 */
function requestValidateCodeAction() {
    write(WRITE_COMMANDS.RESEND_VALIDATE_CODE, {
        email: USER_EMAIL,
    });
}

// eslint-disable-next-line import/prefer-default-export
export {requestValidateCodeAction};
