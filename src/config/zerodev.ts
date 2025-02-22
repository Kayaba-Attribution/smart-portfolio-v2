import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { baseSepolia } from "viem/chains";
import { PasskeyValidatorContractVersion } from "@zerodev/passkey-validator";

// Consolidate all ZeroDev related configuration
export const ZERODEV_CONFIG = {
    // Environment variables
    projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID!,
    bundlerUrl: process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL!,
    paymasterUrl: process.env.NEXT_PUBLIC_ZERODEV_PAYMASTER_URL!,
    passkeyServerUrl: process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL!,

    // Chain configuration
    chain: baseSepolia,

    // Kernel configuration
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,

    // Validator configuration
    validatorVersion: PasskeyValidatorContractVersion.V0_0_2,

    // Environment validation
    validate() {
        const required = [
            'projectId',
            'bundlerUrl',
            'paymasterUrl',
            'passkeyServerUrl'
        ];

        const missing = required.filter(key => !this[key as keyof typeof this]);

        if (missing.length > 0) {
            throw new Error(
                `Missing required ZeroDev configuration: ${missing.join(', ')}`
            );
        }
    }
}; 