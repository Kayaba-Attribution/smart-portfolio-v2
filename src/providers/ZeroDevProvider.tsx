import { createConfig, WagmiConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  ZeroDevProvider as ZeroDevWeb3Provider,
  ZeroDevProviderConfig,
} from "@zerodev/web3modal";
import { ZERODEV_CONFIG } from "@/config/zerodev";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const wagmiConfig = createConfig({
  publicClient,
});

const zeroDevConfig: ZeroDevProviderConfig = {
  projectId: ZERODEV_CONFIG.projectId,
  bundlerUrl: ZERODEV_CONFIG.bundlerUrl,
  paymasterUrl: ZERODEV_CONFIG.paymasterUrl,
};

export function ZeroDevProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ZeroDevWeb3Provider config={zeroDevConfig}>
        {children}
      </ZeroDevWeb3Provider>
    </WagmiConfig>
  );
}
