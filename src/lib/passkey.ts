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

const BUNDLER_URL = process.env.ZERODEV_BUNDLER_URL!;
const PASSKEY_SERVER_URL = process.env.ZERODEV_PASSKEY_SERVER_URL!;

export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
});

export async function createAccountWithPasskey(username: string) {
    try {
        console.log('Starting passkey creation...');

        const entryPoint = getEntryPoint("0.7");

        // Create WebAuthn key
        const webAuthnKey = await toWebAuthnKey({
            passkeyName: username,
            passkeyServerUrl: PASSKEY_SERVER_URL,
            mode: WebAuthnMode.Register
        });
        console.log('WebAuthn key created:', webAuthnKey);

        // Create passkey validator
        const validator = await toPasskeyValidator(publicClient, {
            webAuthnKey,
            entryPoint,
            kernelVersion: KERNEL_V3_1,
            validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
        });

        // Create account
        const account = await createKernelAccount(publicClient, {
            plugins: {
                sudo: validator
            },
            entryPoint,
            kernelVersion: KERNEL_V3_1
        });
        console.log('Account created:', account);

        // Create client
        const client = await createKernelAccountClient({
            account,
            chain: baseSepolia,
            bundlerTransport: http(BUNDLER_URL)
        });
        console.log('Client created:', client);

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

        const webAuthnKey = await toWebAuthnKey({
            passkeyName: username,
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