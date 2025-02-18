"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { KernelAccountClient } from "@zerodev/sdk";
import { createAccountWithPasskey } from "@/lib/passkey";

interface AccountContextType {
  account: any; // We'll type this properly once we understand the correct type
  client: KernelAccountClient | null;
  isLoading: boolean;
  error: Error | null;
  createPasskeyAccount: (username: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<any>(null);
  const [client, setClient] = useState<KernelAccountClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handlePasskeyAccount = async (username: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { account: newAccount, client: newClient } =
        await createAccountWithPasskey(username);

      localStorage.setItem("accountAddress", newAccount.address);

      setAccount(newAccount);
      setClient(newClient);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to create account")
      );
    } finally {
      setIsLoading(false);
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
        createPasskeyAccount: handlePasskeyAccount,
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
