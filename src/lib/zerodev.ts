import {
    createKernelAccount,
    createKernelAccountClient,
    createZeroDevPaymasterClient
} from "@zerodev/sdk";
import { http, createPublicClient } from "viem";
import { ZERODEV_CONFIG } from "@/config/zerodev";

export const publicClient = createPublicClient({
    chain: ZERODEV_CONFIG.chain,
    transport: http(ZERODEV_CONFIG.bundlerUrl),
});

export const paymasterClient = createZeroDevPaymasterClient({
    chain: ZERODEV_CONFIG.chain,
    transport: http(ZERODEV_CONFIG.paymasterUrl),
}); 