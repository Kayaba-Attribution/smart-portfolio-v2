/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type {
  KernelAccountClient,
  KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import {
  handleRegister,
  loginWithPasskey as passkeyLogin,
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isSendingUserOp, setIsSendingUserOp] = useState(false);
  const [userOpStatus, setUserOpStatus] = useState("");
  const [userOpHash, setUserOpHash] = useState<string | null>(null);

  // Define login handler - simplified
  const handlePasskeyLogin = async (tempUsername: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting login with passkey");

      // Get account and client
      const { account: newAccount, client: newClient } = await passkeyLogin(
        tempUsername
      );

      if (!newAccount || !newClient) {
        throw new Error("Failed to get account or client during login");
      }

      // Get address - this is our real identifier
      const address = await newAccount.getAddress();
      console.log("Login successful! Account address:", address);

      // Update state
      setAccount(newAccount);
      setClient(newClient);
      setAccountAddress(address);

      // Use address as username for now - we could load a friendly name from DB later
      const displayName = `user_${address.slice(0, 6)}`;
      setUsername(displayName);

      // Store in localStorage for UI state persistence
      localStorage.setItem("accountAddress", address);

      // We don't store displayName/username in localStorage since it's just UI sugar
    } catch (err) {
      console.error("Login failed:", err);
      setError(err instanceof Error ? err : new Error("Login failed"));

      // Clear state on failure
      setAccount(null);
      setClient(null);
      setAccountAddress(null);
      setUsername(null);
      localStorage.removeItem("accountAddress");

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Registration handler - simplified
  const handlePasskeyRegistration = async (tempUsername: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting registration with passkey");

      // Create account and client
      const { account: newAccount, client: newClient } = await handleRegister(
        tempUsername
      );

      if (!newAccount || !newClient) {
        throw new Error("Failed to get account or client during registration");
      }

      // Get address - this is our real identifier
      const address = await newAccount.getAddress();
      console.log("Registration successful! Account address:", address);

      // Update state
      setAccount(newAccount);
      setClient(newClient);
      setAccountAddress(address);

      // Use address as username for now - we could load a friendly name from DB later
      const displayName = `user_${address.slice(0, 6)}`;
      setUsername(displayName);

      // Store in localStorage for UI state persistence
      localStorage.setItem("accountAddress", address);

      // Create user record in InstantDB - use address as primary key
      try {
        await createUser(address, displayName);
      } catch (dbError) {
        console.error("DB error during registration (non-fatal):", dbError);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err : new Error("Registration failed"));

      // Clear state on failure
      setAccount(null);
      setClient(null);
      setAccountAddress(null);
      setUsername(null);
      localStorage.removeItem("accountAddress");

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple logout function
  const handleLogout = () => {
    setAccount(null);
    setClient(null);
    setAccountAddress(null);
    setUsername(null);
    localStorage.removeItem("accountAddress");
    setError(null);
    console.log("Logged out successfully");
  };

  // Transaction handling function
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
    if (!account || !client) {
      const msg = "Cannot send transaction: No account or client";
      console.error(msg);
      throw new Error(msg);
    }

    setIsSendingUserOp(true);
    setUserOpStatus("Preparing transaction...");

    try {
      console.log("Sending transaction:", {
        contract: contractAddress,
        function: functionName,
        args,
      });

      const callData = encodeFunctionData({
        abi: contractABI,
        functionName,
        args,
      });

      // Use the correct method from the account instance
      const userOpHash = await client.sendUserOperation({
        callData: await account.encodeCalls([
          {
            to: contractAddress as `0x${string}`,
            value: BigInt(0),
            data: callData,
          },
        ]),
      });

      setUserOpHash(userOpHash);
      setUserOpStatus(`Transaction sent! Hash: ${userOpHash}`);

      if (onSuccess) {
        onSuccess();
      }

      return userOpHash;
    } catch (err) {
      console.error("Error sending transaction:", err);
      setUserOpStatus(
        `Transaction failed: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
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
