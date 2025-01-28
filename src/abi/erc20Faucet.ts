export const ERC20_FAUCET_ABI = [
    {
        inputs: [],
        name: "claimFaucet",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    // We can also add balanceOf for displaying current balance
    {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const;
