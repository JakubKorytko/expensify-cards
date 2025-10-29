import {write} from '@libs/API';
import {WRITE_COMMANDS} from '../../../api';
import {USER_EMAIL} from '../../../api/utils';

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
