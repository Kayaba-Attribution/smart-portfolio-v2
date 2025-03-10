/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type {
  KernelAccountClient,
  KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import { handleRegister, loginWithPasskey } from "@/lib/passkey";
import { encodeFunctionData } from "viem";

interface AccountContextType {
  account: KernelSmartAccountImplementation | null;
  client: KernelAccountClient | null;
  isLoading: boolean;
  error: Error | null;
  registerPasskey: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isSendingUserOp, setIsSendingUserOp] = useState(false);
  const [userOpStatus, setUserOpStatus] = useState("");
  const [userOpHash, setUserOpHash] = useState<string | null>(null);

  const handlePasskeyRegistration = async () => {
    setIsLoading(true);
    try {
      const { account: newAccount, client: newClient } = await handleRegister();
      setAccount(newAccount);
      setClient(newClient);
      const address = await newAccount.getAddress();
      localStorage.setItem("accountAddress", address);
    } catch (err) {
      console.error("Error creating account:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to create account")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async (username: string) => {
    setIsLoading(true);
    try {
      const { account: newAccount, client: newClient } = await loginWithPasskey(
        username
      );
      setAccount(newAccount);
      setClient(newClient);
      setUsername(username);
    } catch (err) {
      console.error("Error logging in:", err);
      setError(err instanceof Error ? err : new Error("Failed to login"));
      // Clear stored data on login failure
      localStorage.removeItem("username");
      localStorage.removeItem("accountAddress");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setAccount(null);
    setClient(null);
    setUsername(null);
    localStorage.removeItem("username");
    localStorage.removeItem("accountAddress");
  };

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

      // Update with a clear "completed" phrase for the notification system to detect
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
