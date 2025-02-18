import {
    createKernelAccount,
    createKernelAccountClient
} from "@zerodev/sdk";
import {
    toPasskeyValidator,
    toWebAuthnKey,
    WebAuthnMode,
    PasskeyValidatorContractVersion
} from "@zerodev/passkey-validator";
import { http } from "viem";
import { ZERODEV_CONFIG } from "@/config/zerodev";
import { publicClient, paymasterClient } from "./zerodev";

export async function createAccountWithPasskey(username: string) {
    // First create the WebAuthn key
    const webAuthnKey = await toWebAuthnKey({
        passkeyName: username,
        passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
        mode: WebAuthnMode.Register,
        passkeyServerHeaders: {}
    });

    // Create validator
    const validator = await toPasskeyValidator(publicClient, {
        webAuthnKey,
        entryPoint: ZERODEV_CONFIG.entryPoint,
        kernelVersion: ZERODEV_CONFIG.kernelVersion,
        validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
    });

    // Create account
    const account = await createKernelAccount(publicClient, {
        plugins: {
            sudo: validator,
        },
        entryPoint: ZERODEV_CONFIG.entryPoint,
        kernelVersion: ZERODEV_CONFIG.kernelVersion,
    });

    // Create client
    const client = await createKernelAccountClient({
        account,
        chain: ZERODEV_CONFIG.chain,
        bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl),
        paymaster: paymasterClient,
    });

    return { account, client };
} 