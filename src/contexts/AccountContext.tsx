/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import type {
  KernelAccountClient,
  KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import {
  handleRegister,
  loginWithPasskey as passkeyLogin,
  checkPasskeyExists,
} from "@/lib/passkey";
import { encodeFunctionData } from "viem";
import { createUser } from "@/lib/db";

interface AccountContextType {
  account: KernelSmartAccountImplementation | null;
  client: KernelAccountClient | null;
  accountAddress: string | null;
  isLoading: boolean;
  error: Error | null;
  registerPasskey: (username: string) => Promise<void>;
  loginWithPasskey: (username: string) => Promise<void>;
  logout: () => void;
  username: string | null;
  sendUserOp: (params: {
    contractAddress: string;
    contractABI: any;
    functionName: string;
    args: any[];
    onSuccess?: () => void;
  }) => Promise<string>;
  isSendingUserOp: boolean;
  userOpStatus: string;
  userOpHash: string | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] =
    useState<KernelSmartAccountImplementation | null>(null);
  const [client, setClient] = useState<KernelAccountClient | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isSendingUserOp, setIsSendingUserOp] = useState(false);
  const [userOpStatus, setUserOpStatus] = useState("");
  const [userOpHash, setUserOpHash] = useState<string | null>(null);

  const handlePasskeyLogin = useCallback(async (username: string) => {
    setIsLoading(true);
    console.log("Starting passkey login for username:", username);

    // Track completion steps separately
    let passkeyLoginSuccessful = false;
    let walletAddressObtained = false;

    try {
      console.log("Calling passkeyLogin with username:", username);
      const { account: newAccount, client: newClient } = await passkeyLogin(
        username
      );
      console.log("Successfully authenticated with passkey");
      passkeyLoginSuccessful = true;

      setAccount(newAccount);
      setClient(newClient);

      console.log("Getting wallet address after login");
      const address = await newAccount.getAddress();
      console.log("Got wallet address after login:", address);
      walletAddressObtained = true;

      setAccountAddress(address);
      localStorage.setItem("accountAddress", address);
      setUsername(username);
      localStorage.setItem("username", username);

      // Check if user exists in InstantDB, if not, create the user
      try {
        // Import the createUser function to avoid circular dependencies
        const { createUser } = await import("@/lib/db");
        console.log("Checking/creating user in InstantDB after login");
        await createUser(address, username);
        console.log("User record confirmed in InstantDB");
      } catch (dbError) {
        console.error(
          "Error checking/creating user in InstantDB after login:",
          dbError
        );
        // Non-fatal error - user can still proceed with limited functionality
        console.log("Login will continue despite DB error");
      }

      console.log("Login process completed successfully");
    } catch (err) {
      console.error("Error logging in:", err);

      // Handle empty error object
      if (err && Object.keys(err).length === 0) {
        console.error("Empty error object received during login");
      }

      // Log detailed error information
      if (err instanceof Error) {
        console.error("Login error name:", err.name);
        console.error("Login error message:", err.message);
        console.error("Login error stack:", err.stack);
      } else {
        console.error(
          "Non-Error object thrown during login:",
          typeof err,
          JSON.stringify(err)
        );
      }

      // Set appropriate error message based on which step failed
      if (!passkeyLoginSuccessful) {
        setError(
          new Error("Failed to authenticate with passkey. Please try again.")
        );
      } else if (!walletAddressObtained) {
        setError(
          new Error(
            "Authenticated with passkey, but failed to get wallet address. Please try again."
          )
        );
      } else {
        setError(err instanceof Error ? err : new Error("Failed to login"));
      }

      localStorage.removeItem("username");
      localStorage.removeItem("accountAddress");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePasskeyRegistration = async (username: string) => {
    if (!username || username.trim() === "") {
      setError(new Error("Username is required"));
      return;
    }

    setIsLoading(true);
    console.log("Starting passkey registration for username:", username);

    // Track completion steps separately
    let passkeyCreated = false;
    let walletAddressObtained = false;

    try {
      // Step 1: Create passkey
      console.log("Calling handleRegister with username:", username);
      const { account: newAccount, client: newClient } = await handleRegister(
        username
      );
      console.log("Successfully created passkey and account");
      passkeyCreated = true;

      // Set account state even if later steps fail
      setAccount(newAccount);
      setClient(newClient);

      // Step 2: Get wallet address
      console.log("Getting wallet address");
      const address = await newAccount.getAddress();
      console.log("Got wallet address:", address);
      walletAddressObtained = true;

      // Set address state even if later steps fail
      setAccountAddress(address);
      localStorage.setItem("accountAddress", address);
      setUsername(username);
      localStorage.setItem("username", username);

      // Step 3: Create user in InstantDB (this might be failing)
      try {
        console.log("Creating user in InstantDB");
        await createUser(address, username);
        console.log("Successfully created user in InstantDB");
      } catch (dbError) {
        console.error("Error creating user in InstantDB:", dbError);
        // Log more details about the error
        console.log("DB Error type:", typeof dbError);
        console.log("DB Error serialized:", JSON.stringify(dbError));

        // Don't throw here - we can still proceed with the passkey and wallet
        // but should notify the user
        setError(
          new Error(
            "Your passkey was created, but there was an issue storing your user data. Some features may be limited."
          )
        );
      }
    } catch (err) {
      console.error("Error creating account:", err);
      // Handle empty error object
      if (err && Object.keys(err).length === 0) {
        console.error("Empty error object received");
      }

      // Log detailed error information
      if (err instanceof Error) {
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
      } else {
        console.error(
          "Non-Error object thrown:",
          typeof err,
          JSON.stringify(err)
        );
      }

      // Set appropriate error message based on which step failed
      if (!passkeyCreated) {
        setError(new Error("Failed to create passkey. Please try again."));
      } else if (!walletAddressObtained) {
        setError(
          new Error(
            "Passkey created, but failed to get wallet address. Please try again."
          )
        );
      } else {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed during account creation")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setClient(null);
    setAccountAddress(null);
    setUsername(null);
    localStorage.removeItem("username");
    localStorage.removeItem("accountAddress");
  };

  useEffect(() => {
    const checkAndCleanup = async () => {
      try {
        const storedUsername = localStorage.getItem("username");

        if (storedUsername) {
          const passKeyExists = await checkPasskeyExists(storedUsername);

          if (!passKeyExists) {
            console.log("No valid passkey found, clearing session data");
            localStorage.removeItem("username");
            localStorage.removeItem("accountAddress");
            setAccountAddress(null);
            setUsername(null);
          } else {
            const storedAddress = localStorage.getItem("accountAddress");
            if (storedAddress) {
              setAccountAddress(storedAddress);
              setUsername(storedUsername);
            }
          }
        }
      } catch (error) {
        console.error("Error checking passkeys:", error);
        localStorage.removeItem("username");
        localStorage.removeItem("accountAddress");
        setAccountAddress(null);
        setUsername(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndCleanup();
  }, []);

  const handleSendUserOp = async ({
    contractAddress,
    contractABI,
    functionName,
    args,
    onSuccess,
  }: {
    contractAddress: string;
    contractABI: any;
    functionName: string;
    args: any[];
    onSuccess?: () => void;
  }) => {
    if (!client || !account || !account.encodeCalls) {
      throw new Error("Account or client not initialized");
    }

    try {
      setIsSendingUserOp(true);
      setUserOpStatus("Preparing transaction...");

      const userOpHash = await client.sendUserOperation({
        callData: await account.encodeCalls([
          {
            to: contractAddress as `0x${string}`,
            value: BigInt(0),
            data: encodeFunctionData({
              abi: contractABI,
              functionName,
              args,
            }),
          },
        ]),
      });

      setUserOpHash(userOpHash);
      setUserOpStatus("Transaction sent, waiting for confirmation...");

      await client.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      setUserOpStatus(`Transaction completed. ${userOpHash}`);

      if (onSuccess) {
        onSuccess();
      }

      return userOpHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setUserOpStatus(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsSendingUserOp(false);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        account,
        client,
        accountAddress,
        isLoading,
        error,
        registerPasskey: handlePasskeyRegistration,
        loginWithPasskey: handlePasskeyLogin,
        logout: handleLogout,
        username,
        sendUserOp: handleSendUserOp,
        isSendingUserOp,
        userOpStatus,
        userOpHash,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
