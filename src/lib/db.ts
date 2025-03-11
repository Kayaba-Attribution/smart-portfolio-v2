import { init, tx, id } from '@instantdb/react';
import schema, { AppSchema } from '../../instant.schema';

// Export the schema type for TypeScript
export type { AppSchema };

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
    throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not defined in environment variables");
}
// Initialize InstantDB with the schema
export const db = init<AppSchema>({
    appId: appId,
    schema,
});

// Re-export tx and id for convenience
export { tx, id };

/**
 * Creates a new user in the database when a wallet is connected
 * Uses the wallet address as the primary identifier
 * @param walletAddress The user's wallet address
 * @param displayName A display name for the user (optional)
 * @returns The ID of the user (wallet address)
 */
export async function createUser(walletAddress: string, displayName?: string) {
    try {
        console.log("Creating or finding user in InstantDB", { walletAddress, displayName });

        // Generate ID for profile - use wallet address directly as the ID
        const profileId = walletAddress;
        console.log("Using wallet address as profile ID:", profileId);

        // Create the user profile
        await db.transact([
            // Create the user profile
            tx.userProfiles[profileId].update({
                walletAddress,
                username: displayName || `user_${walletAddress.slice(0, 6)}`,
                totalPoints: 0,
                createdAt: Date.now(),
            }),
        ]);

        console.log("User profile created/updated successfully");
        return profileId;
    } catch (error) {
        console.error("Error in createUser:", error);
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        } else {
            console.error("Non-Error object thrown:", typeof error, JSON.stringify(error));
        }

        // For this function, we'll swallow the error as it's likely just
        // a conflict trying to create a user that already exists
        console.log("Continuing despite error - user may already exist");
        return walletAddress;
    }
}

/**
 * Fetches a user by their wallet address
 * Note: This function must be used within a React component using the useQuery hook
 * @param walletAddress The user's wallet address
 */
export function getUserQuery(walletAddress: string) {
    return {
        userProfiles: {
            $: { where: { walletAddress } },
            user: {}, // Include the linked user
        },
    };
}

/**
 * Adds points to a user for a specific action
 * @param userId The user's ID
 * @param actionId The action ID
 * @param points The number of points to award
 */
export async function addPoints(userId: string, actionId: string, points: number) {
    // Generate a unique ID for the transaction
    const transactionId = id();

    // Create a points transaction and update the user's total points
    await db.transact([
        // Create the points transaction
        tx.pointsTransactions[transactionId].update({
            userId,
            actionId,
            points,
            timestamp: Date.now(),
        }),

        // Update the user's total points
        tx.$users[userId].update({
            // Use a lambda to increment the current value
            totalPoints: (current: number | undefined) => (current || 0) + points,
        }),

        // Link the transaction to the user and action
        tx.pointsTransactions[transactionId].link({ user: userId }),
        tx.pointsTransactions[transactionId].link({ action: actionId }),
    ]);
}

/**
 * Returns a query to get an action by ID
 * Note: This function must be used within a React component using the useQuery hook
 * @param actionId The action ID
 */
export function getActionQuery(actionId: string) {
    return {
        actions: {
            $: { where: { id: actionId } },
        },
    };
}

/**
 * Records a new portfolio creation
 * @param userId The user's ID
 * @param type The type of portfolio ("template" or "custom")
 */
export async function createPortfolio(userId: string, type: string) {
    // Generate a unique ID for the portfolio
    const portfolioId = id();

    // Create the portfolio
    await db.transact([
        // Create the portfolio
        tx.portfolios[portfolioId].update({
            userId,
            type,
            createdAt: Date.now(),
        }),

        // Link the portfolio to the user
        tx.portfolios[portfolioId].link({ user: userId }),
    ]);

    return portfolioId;
}

/**
 * Awards points for an action
 * This function should be called after checking if the action is valid
 * @param userId The user's ID
 * @param actionName The name of the action
 * @param actionId The ID of the action
 * @param points The number of points to award
 */
export async function awardPointsForAction(userId: string, actionName: string, actionId: string, points: number) {
    await addPoints(userId, actionId, points);
}

/**
 * Returns a query to get a user by their wallet address
 * Note: This function must be used within a React component using the useQuery hook
 * @param address The wallet address
 */
export function getUserByAddressQuery(address: string) {
    return {
        userProfiles: {
            $: { where: { walletAddress: address } },
        },
    };
} 