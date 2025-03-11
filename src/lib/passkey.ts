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
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ZERODEV_CONFIG } from "@/config/zerodev";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toPermissionValidator } from "@zerodev/permissions";
import type { KernelValidator } from "@zerodev/sdk/types";
// Validate config on initialization
ZERODEV_CONFIG.validate();

export const publicClient = createPublicClient({
  chain: ZERODEV_CONFIG.chain,
  transport: http(),
});

// Generate session key once
const sessionPrivateKey = generatePrivateKey();
const sessionKeySigner = privateKeyToAccount(sessionPrivateKey);

function formatUsername(username: string): string {
  const formatted = username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  console.log("Formatted username:", { original: username, formatted });
  return formatted;
}

/**
 * Check if a passkey exists for a given username
 * @param username The username to check
 * @returns A boolean indicating whether a passkey exists
 */
export async function checkPasskeyExists(username: string): Promise<boolean> {
    try {
        const formattedUsername = formatUsername(username);

        // Attempt to use the passkey in login mode
        // This will throw an error if the passkey doesn't exist
        await toWebAuthnKey({
            passkeyName: formattedUsername,
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
export async function handleRegister(username?: string) {
    console.log("Registering with username:", username);

    try {
        const formattedUsername = username ? formatUsername(username) : ZERODEV_CONFIG.passkeyName;
        console.log("Formatted username:", formattedUsername);
        console.log("Using passkey server URL:", ZERODEV_CONFIG.passkeyServerUrl);

        console.log("Creating WebAuthn key...");
        const webAuthnKey = await toWebAuthnKey({
            passkeyName: formattedUsername,
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

// handleLogin
export async function handleLogin() {
  const webAuthnKey = await toWebAuthnKey({
    passkeyName: ZERODEV_CONFIG.passkeyName,
    passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
    mode: WebAuthnMode.Register,
    passkeyServerHeaders: {},
  });

  const passkeyValidator = await toPasskeyValidator(publicClient, {
    webAuthnKey,
    entryPoint: ZERODEV_CONFIG.entryPoint,
    kernelVersion: ZERODEV_CONFIG.kernelVersion,
    validatorContractVersion: ZERODEV_CONFIG.validatorVersion,
  });

  await createAccountAndClient(passkeyValidator);

  window.alert("Login done.  Try sending UserOps.");
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

export async function createAccountWithPasskey(username: string) {
  try {
    console.log("Starting passkey creation...", {
      username,
      passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
    });

    // Create WebAuthn key
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: "SmartPortfolio",
      passkeyServerUrl: ZERODEV_CONFIG.passkeyServerUrl,
      mode: WebAuthnMode.Register,
      passkeyServerHeaders: {},
    });

    // Create passkey validator
    const passkeyValidator = await toPasskeyValidator(publicClient, {
      webAuthnKey,
      entryPoint: ZERODEV_CONFIG.entryPoint,
      kernelVersion: ZERODEV_CONFIG.kernelVersion,
      validatorContractVersion: ZERODEV_CONFIG.validatorVersion,
    });

    // Create session key validator
    const ecdsaSigner = await toECDSASigner({
      signer: sessionKeySigner,
    });

    const sudoPolicy = await toSudoPolicy({});

    const permissionValidator = await toPermissionValidator(publicClient, {
      signer: ecdsaSigner,
      policies: [sudoPolicy],
      entryPoint: ZERODEV_CONFIG.entryPoint,
      kernelVersion: ZERODEV_CONFIG.kernelVersion,
    });

    // Create account with both validators
    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: passkeyValidator,
        regular: permissionValidator,
      },
      entryPoint: ZERODEV_CONFIG.entryPoint,
      kernelVersion: ZERODEV_CONFIG.kernelVersion,
    });

    // Create paymaster client
    const paymaster = createZeroDevPaymasterClient({
      chain: ZERODEV_CONFIG.chain,
      transport: http(ZERODEV_CONFIG.paymasterUrl),
    });

    // Create client with proper paymaster configuration
    const client = await createKernelAccountClient({
      account,
      chain: ZERODEV_CONFIG.chain,
      bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl),
      paymaster: {
        getPaymasterData: (userOperation) => {
          return paymaster.sponsorUserOperation({
            userOperation,
          });
        },
      },
    });

    return { account, client };
  } catch (error) {
    console.error("Error creating passkey account:", error);
    throw error;
  }
}

export async function loginWithPasskey(username: string) {
  try {
      console.log("Starting passkey login process...");
      console.log("Username before formatting:", username);

    const entryPoint = getEntryPoint("0.7");
    const formattedUsername = formatUsername(username);
      console.log("Formatted username for login:", formattedUsername);
      console.log("Using passkey server URL:", ZERODEV_CONFIG.passkeyServerUrl);

      console.log("Creating WebAuthn key for login...");
    const webAuthnKey = await toWebAuthnKey({
      passkeyName: formattedUsername,
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
