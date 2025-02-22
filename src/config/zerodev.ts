import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { baseSepolia } from "viem/chains";

export const ZERODEV_CONFIG = {
    projectId: process.env.ZERODEV_PROJECT_ID!,
    bundlerUrl: process.env.ZERODEV_BUNDLER_URL!,
    paymasterUrl: process.env.ZERODEV_PAYMASTER_URL!,
    passkeyServerUrl: process.env.ZERODEV_PASSKEY_SERVER_URL!,
    chain: baseSepolia,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
}; 