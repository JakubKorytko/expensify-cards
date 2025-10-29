import CONFIG from '../../config';

export default function useCurrentUserPersonalDetails() {
    return {
        accountID: CONFIG.accountID,
    };
}
