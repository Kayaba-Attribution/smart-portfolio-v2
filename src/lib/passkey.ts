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
import { baseSepolia } from "viem/chains";

const BUNDLER_URL = process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL!;
const PASSKEY_SERVER_URL = process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL!;

console.log('Environment Variables:', {
    BUNDLER_URL,
    PASSKEY_SERVER_URL
});

if (!BUNDLER_URL || !PASSKEY_SERVER_URL) {
    throw new Error('Missing required environment variables. Make sure NEXT_PUBLIC_ZERODEV_BUNDLER_URL and NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL are set.');
}

export const publicClient = createPublicClient({
    chain: baseSepolia,
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
            passkeyServerUrl: PASSKEY_SERVER_URL
        });

        const entryPoint = getEntryPoint("0.7");
        const formattedUsername = formatUsername(username);

        console.log('Creating WebAuthn key with params:', {
            passkeyName: formattedUsername,
            passkeyServerUrl: PASSKEY_SERVER_URL,
            mode: WebAuthnMode.Register
        });

        // Create WebAuthn key
        const webAuthnKey = await toWebAuthnKey({
            passkeyName: formattedUsername,
            passkeyServerUrl: PASSKEY_SERVER_URL.replace(/\/$/, ''), // Remove trailing slash if present
            mode: WebAuthnMode.Register
        });
        console.log('WebAuthn key created:', webAuthnKey);

        // Create passkey validator
        console.log('Creating validator with params:', {
            entryPoint,
            kernelVersion: KERNEL_V3_1,
            validatorVersion: PasskeyValidatorContractVersion.V0_0_2
        });

        const validator = await toPasskeyValidator(publicClient, {
            webAuthnKey,
            entryPoint,
            kernelVersion: KERNEL_V3_1,
            validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
        });
        console.log('Validator created:', validator);

        // Create account
        console.log('Creating kernel account...');
        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: validator
            },
            entryPoint,
            kernelVersion: KERNEL_V3_1
        });
        console.log('Account created:', {
            address: account.address,
            entryPoint,
            kernelVersion: KERNEL_V3_1
        });

        // Create client
        console.log('Creating kernel client...');
        const client = await createKernelAccountClient({
            account,
            chain: baseSepolia,
            bundlerTransport: http(BUNDLER_URL)
        });
        console.log('Client created');

        return { account, client };
    } catch (error) {
        console.error('Error creating passkey account:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
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
            passkeyServerUrl: PASSKEY_SERVER_URL,
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
            chain: baseSepolia,
            bundlerTransport: http(BUNDLER_URL)
        });

        return { account, client };
    } catch (error) {
        console.error('Error logging in with passkey:', error);
        throw error;
    }
} 