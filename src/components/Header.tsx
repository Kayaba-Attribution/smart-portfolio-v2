"use client";

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownBasename,
  WalletDropdownFundLink,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import Image from "next/image";

export function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center h-full py-2">
            <div className="relative h-full aspect-square">
              <Image
                src="/SP_LOGO.png"
                alt="App Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="ml-2 font-semibold text-lg sm:block">
              Smart Portfolio
            </span>
          </div>
          <Wallet>
            <ConnectWallet>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6" />
                <Name className="sm:block" />
              </div>
            </ConnectWallet>
            <WalletDropdown className="z-[100]">
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownBasename />
              <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">
                Wallet
              </WalletDropdownLink>
              <WalletDropdownFundLink />
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>
    </div>
  );
} 