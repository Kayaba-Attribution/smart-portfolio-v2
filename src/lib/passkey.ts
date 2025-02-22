import {
    createKernelAccount,
    createKernelAccountClient,
} from "@zerodev/sdk";
import { 
    KERNEL_V3_1,
    getEntryPoint,
} from "@zerodev/sdk/constants";
import {
    WebAuthnMode,
    toPasskeyValidator,
    toWebAuthnKey,
    PasskeyValidatorContractVersion
} from "@zerodev/passkey-validator";
import { createPublicClient, http } from "viem";
import { ZERODEV_CONFIG } from "@/config/zerodev";

// Validate config on initialization
ZERODEV_CONFIG.validate();

export const publicClient = createPublicClient({
    chain: ZERODEV_CONFIG.chain,
    transport: http()
});

function formatUsername(username: string): string {
    const formatted = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    console.log('Formatted username:', { original: username, formatted });
    return formatted;
}

export async function createAccountWithPasskey(username: string) {
    try {
        console.log('Starting passkey creation...', {
            username,
            passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl
        });

        // Create WebAuthn key
        const webAuthnKey = await toWebAuthnKey({
            passkeyName: formatUsername(username),
            passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
            mode: WebAuthnMode.Register
        });

        // Create validator
        const validator = await toPasskeyValidator(publicClient, {
            webAuthnKey,
            entryPoint: ZERODEV_CONFIG.entryPoint,
            kernelVersion: ZERODEV_CONFIG.kernelVersion,
            validatorContractVersion: ZERODEV_CONFIG.validatorVersion
        });

        // Create account
        const account = await createKernelAccount(publicClient, {
            plugins: { sudo: validator },
            entryPoint: ZERODEV_CONFIG.entryPoint,
            kernelVersion: ZERODEV_CONFIG.kernelVersion
        });

        // Create client
        const client = await createKernelAccountClient({
            account,
            chain: ZERODEV_CONFIG.chain,
            bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl)
        });

        return { account, client };
    } catch (error) {
        console.error('Error creating passkey account:', error);
        throw error;
    }
}

export async function loginWithPasskey(username: string) {
    try {
        console.log('Starting passkey login...');

        const entryPoint = getEntryPoint("0.7");
        const formattedUsername = formatUsername(username);

        const webAuthnKey = await toWebAuthnKey({
            passkeyName: formattedUsername,
            passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
            mode: WebAuthnMode.Login
        });

        const validator = await toPasskeyValidator(publicClient, {
            webAuthnKey,
            entryPoint,
            kernelVersion: KERNEL_V3_1,
            validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
        });

        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: validator
            },
            entryPoint,
            kernelVersion: KERNEL_V3_1
        });

        const client = await createKernelAccountClient({
            account,
            chain: ZERODEV_CONFIG.chain,
            bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl)
        });

        return { account, client };
    } catch (error) {
        console.error('Error logging in with passkey:', error);
        throw error;
    }
} 