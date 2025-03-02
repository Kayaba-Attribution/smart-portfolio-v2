/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { KernelAccountClient, KernelSmartAccountImplementation } from "@zerodev/sdk";
import { handleRegister, loginWithPasskey } from "@/lib/passkey";
import { encodeFunctionData } from "viem";

interface AccountContextType {
  account: KernelSmartAccountImplementation | null;
  client: KernelAccountClient | null;
  isLoading: boolean;
  error: Error | null;
  registerPasskey: () => Promise<void>;
  loginWithPasskey: (username: string) => Promise<void>;
  sendUserOp: (params: {
    contractAddress: string;
    contractABI: any;
    functionName: string;
    args: any[];
  }) => Promise<string>;
  isSendingUserOp: boolean;
  userOpStatus: string;
  userOpHash: string | null;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<KernelSmartAccountImplementation | null>(null);
  const [client, setClient] = useState<KernelAccountClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSendingUserOp, setIsSendingUserOp] = useState(false);
  const [userOpStatus, setUserOpStatus] = useState('');
  const [userOpHash, setUserOpHash] = useState<string | null>(null);

  const handlePasskeyRegistration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Now properly use the returned account and client
      const { account: newAccount, client: newClient } = await handleRegister();
      localStorage.setItem("accountAddress", newAccount.address);
      setAccount(newAccount);
      setClient(newClient);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to register passkey")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async (username: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { account: newAccount, client: newClient } = await loginWithPasskey(
        username
      );
      localStorage.setItem("accountAddress", newAccount.address);
      setAccount(newAccount);
      setClient(newClient);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to login"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendUserOp = async ({
    contractAddress,
    contractABI,
    functionName,
    args,
  }: {
    contractAddress: string;
    contractABI: any[];
    functionName: string;
    args: any[];
  }) => {
    if (!client || !account || !account.encodeCalls) {
      throw new Error("Account or client not initialized");
    }

    try {
      setIsSendingUserOp(true);
      setUserOpStatus('Sending UserOp...');
      
      const userOpHash = await client.sendUserOperation({
        callData: await account.encodeCalls([{
          to: contractAddress as `0x${string}`,
          value: BigInt(0),
          data: encodeFunctionData({
            abi: contractABI,
            functionName,
            args,
          }),
        }]),
      });
      
      setUserOpHash(userOpHash);
      
      await client.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      
      // Update the message based on the count of UserOps
      const userOpMessage = `UserOp completed. <a href="https://jiffyscan.xyz/userOpHash/${userOpHash}?network=sepolia" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700">Click here to view.</a>`;
      
      setUserOpStatus(userOpMessage);
      return userOpHash;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send UserOp";
      setUserOpStatus(`Error: ${errorMessage}`);
      throw err;
    } finally {
      setIsSendingUserOp(false);
    }
  };

  // Auto-connect logic will go here
  useEffect(() => {
    // TODO: Implement auto-connect from stored account
  }, []);

  return (
    <AccountContext.Provider
      value={{
        account,
        client,
        isLoading,
        error,
        registerPasskey: handlePasskeyRegistration,
        loginWithPasskey: handlePasskeyLogin,
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
