import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  getUserOperationGasPrice,
} from "@zerodev/sdk";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import {
  WebAuthnMode,
  toPasskeyValidator,
  toWebAuthnKey,
  PasskeyValidatorContractVersion,
} from "@zerodev/passkey-validator";
import { createPublicClient, http } from "viem";
import { ZERODEV_CONFIG } from "@/config/zerodev";
import type { KernelValidator } from "@zerodev/sdk/types";
// Validate config on initialization
ZERODEV_CONFIG.validate();

export const publicClient = createPublicClient({
  chain: ZERODEV_CONFIG.chain,
  transport: http(),
});

// Use a fixed passkey name for all users - the wallet address will be used as the unique identifier
// across the application, not the passkey name
const APP_PASSKEY_NAME = "SmartPortfolio";

/**
 * Check if a passkey exists for this device
 * @returns A boolean indicating whether a passkey exists
 */
export async function checkPasskeyExists(): Promise<boolean> {
    try {
        // Attempt to use the passkey in login mode
        // This will throw an error if the passkey doesn't exist
        await toWebAuthnKey({
            passkeyName: APP_PASSKEY_NAME,
            passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
            mode: WebAuthnMode.Login,
        });

        // If we made it here, the passkey exists
        return true;
    } catch (error) {
        console.log("Passkey check failed:", error);
        // If we got an error, the passkey doesn't exist or something went wrong
        return false;
    }
}

// Function to be called when "Register" is clicked
export async function handleRegister(tempId?: string, displayUsername?: string) {
    console.log("Registering passkey...", { tempId, displayUsername });

    try {
        // Combine username with APP_PASSKEY_NAME for the passkey name
        const passkeyName = displayUsername ? `${displayUsername} - ${APP_PASSKEY_NAME}` : APP_PASSKEY_NAME;
        console.log("Using passkey name:", passkeyName);
        console.log("Using passkey server URL:", ZERODEV_CONFIG.passkeyServerUrl);

        console.log("Creating WebAuthn key...");
        const webAuthnKey = await toWebAuthnKey({
            passkeyName,
            passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
            mode: WebAuthnMode.Register,
            passkeyServerHeaders: {},
        });
        console.log("WebAuthn key created successfully");

        console.log("Creating passkey validator...");
        const passkeyValidator = await toPasskeyValidator(publicClient, {
            webAuthnKey,
            entryPoint: ZERODEV_CONFIG.entryPoint,
            kernelVersion: ZERODEV_CONFIG.kernelVersion,
            validatorContractVersion: ZERODEV_CONFIG.validatorVersion,
        });
        console.log("Passkey validator created successfully");

        console.log("Creating account and client...");
        const { kernelAccount, kernelClient } = await createAccountAndClient(passkeyValidator);
        console.log("Account and client created successfully");

        // Return the account and client
        return { account: kernelAccount, client: kernelClient };
    } catch (error) {
        console.error("Error in handleRegister:", error);
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw error; // Rethrow to allow proper error handling upstream
    }
}

export async function createAccountAndClient(passkeyValidator: KernelValidator) {
  const kernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: passkeyValidator,
    },
    entryPoint: ZERODEV_CONFIG.entryPoint,
    kernelVersion: KERNEL_V3_1,
  });

  const kernelClient = createKernelAccountClient({
    account: kernelAccount,
    chain: ZERODEV_CONFIG.chain,
    bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl),
    client: publicClient,
    paymaster: {
      getPaymasterData: (userOperation) => {
        const zerodevPaymaster = createZeroDevPaymasterClient({
          chain: ZERODEV_CONFIG.chain,
          transport: http(ZERODEV_CONFIG.paymasterUrl),
        });
        return zerodevPaymaster.sponsorUserOperation({
          userOperation,
        });
      },
    },
    userOperation: {
      estimateFeesPerGas: async ({ bundlerClient }) => {
        return getUserOperationGasPrice(bundlerClient);
      },
    },
  });

  return { kernelAccount, kernelClient };
}

export async function loginWithPasskey(tempId?: string) {
  try {
      console.log("Starting passkey login process...", tempId);

      const entryPoint = getEntryPoint("0.7");
      console.log("Using passkey server URL:", ZERODEV_CONFIG.passkeyServerUrl);

      console.log("Creating WebAuthn key for login...");
    const webAuthnKey = await toWebAuthnKey({
        passkeyName: APP_PASSKEY_NAME,
      passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
      mode: WebAuthnMode.Login,
    });
      console.log("WebAuthn key created successfully for login");

      console.log("Creating passkey validator...");
    const validator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint,
      kernelVersion: KERNEL_V3_1,
      validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2,
    });
      console.log("Passkey validator created successfully");

      console.log("Creating kernel account...");
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: validator,
      },
      entryPoint,
      kernelVersion: KERNEL_V3_1,
    });
      console.log("Kernel account created successfully");
      console.log("Account address:", await account.getAddress());

    // Create paymaster client
      console.log("Creating paymaster client...");
    const paymasterClient = createZeroDevPaymasterClient({
      chain: ZERODEV_CONFIG.chain,
      transport: http(ZERODEV_CONFIG.paymasterUrl),
    });
      console.log("Paymaster client created successfully");

    // Create client with proper paymaster configuration
      console.log("Creating kernel client...");
    const client = await createKernelAccountClient({
      account,
      chain: ZERODEV_CONFIG.chain,
      bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl),
      paymaster: {
        getPaymasterData: (userOperation) => {
          return paymasterClient.sponsorUserOperation({
            userOperation,
          });
        },
      },
    });
      console.log("Kernel client created successfully");
      console.log("Login process completed successfully");

    return { account, client };
  } catch (error) {
    console.error("Error logging in with passkey:", error);
      if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
      } else {
          console.error("Non-Error object thrown:", typeof error, JSON.stringify(error));
      }
    throw error;
  }
}
