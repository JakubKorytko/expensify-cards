/* eslint-disable */
import type {OnyxKeys} from '@src/ONYXKEYS';
import CONFIG from '../../config';

export default function useOnyx(
    key: OnyxKeys,
    options: {
        canBeMissing: boolean;
    },
) {
    return [
        {
            requiresTwoFactorAuth: CONFIG.is2FAEnabled,
        },
    ] as [
        {
            requiresTwoFactorAuth?: boolean;
        },
    ];
}
