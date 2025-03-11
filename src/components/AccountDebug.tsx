"use client";

import { useAccount } from "@/contexts/AccountContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useState } from "react";

export function AccountDebug() {
  const { account, client, accountAddress, username, isLoading, error } =
    useAccount();
  const [showDetails, setShowDetails] = useState(false);

  const accountExists = !!account;
  const clientExists = !!client;

  // Format data for display
  const accountData = {
    username,
    accountAddress,
    accountExists,
    clientExists,
    isLoading,
    errorMessage: error?.message || null,
    localStorage: {
      username:
        typeof window !== "undefined" ? localStorage.getItem("username") : null,
      accountAddress:
        typeof window !== "undefined"
          ? localStorage.getItem("accountAddress")
          : null,
    },
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Account Debug</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Account Status:</span>
            <span className={accountExists ? "text-green-500" : "text-red-500"}>
              {accountExists ? "Connected" : "Not Connected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Client Status:</span>
            <span className={clientExists ? "text-green-500" : "text-red-500"}>
              {clientExists ? "Initialized" : "Not Initialized"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Loading:</span>
            <span>{isLoading ? "Yes" : "No"}</span>
          </div>

          {error && (
            <div className="p-2 bg-red-100 text-red-800 rounded">
              Error: {error.message}
            </div>
          )}

          {showDetails && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre overflow-auto max-h-60">
              {JSON.stringify(accountData, null, 2)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
