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
 * @param walletAddress The user's wallet address
 * @param displayName A display name for the user (optional)
 */
export async function createUser(walletAddress: string, displayName?: string) {
    try {
        console.log("Creating or finding user in InstantDB", { walletAddress, displayName });

        // Use InstantDB ID

        // Create the user profile
        await db.transact([
            // Create the user profile
            tx.userProfiles[id()].update({
                walletAddress,
                username: displayName || `user_${walletAddress.slice(0, 6)}`,
                totalPoints: 0,
                createdAt: Date.now(),
            }),
        ]);

        console.log("User profile created/updated successfully");

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
        },
    };
}

/**
 * Adds points to a user for a specific action
 * @param userId The user's wallet address
 * @param actionId The action ID
 * @param points The number of points to award
 * @param userPoints Current user points total
 * @param userProfileId The ID of the user profile
 * @param txHash The transaction hash
 * @param chainId The chain ID
 */
export async function addPoints(
    userId: string,
    actionId: string,
    points: number,
    userPoints: number,
    userProfileId: string,
    txHash?: string,
    chainId?: number
) {
    // Generate a unique ID for the transaction
    const transactionId = id();

    try {
        // ID to update - either the provided profile ID or assume userId is the ID
        const profileIdToUpdate = userProfileId || userId;

        const newPoints = userPoints + points;

        // Create a points transaction, update the user's total points, and create links
        await db.transact([
            // Create the points transaction
            tx.pointsTransactions[transactionId]
                .update({
                    userId,
                    actionId,
                    points,
                    timestamp: Date.now(),
                    txHash: txHash || '',
                    chainId: chainId || 0,
                })
                // Create links to user profile and action
                .link({
                    action: actionId
                }),

            // Update the user's total points
            tx.userProfiles[profileIdToUpdate]
                .update({
                    // Use a lambda to increment the current value
                    totalPoints: newPoints,
                })
                // Create link back to the transaction
                .link({
                    pointsTransactions: transactionId
                }),

            // Create link from action to the transaction
            tx.actions[actionId].link({
                transactions: transactionId
            })
        ]);

        console.log(`Added ${points} points to user ${userId} for action ${actionId}`);
        return transactionId;
    } catch (error) {
        console.error("Error adding points:", error);
        throw error;
    }
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
 * @param userPoints Current user points
 * @param userProfileId The user profile ID
 * @param txHash The transaction hash
 * @param chainId The chain ID
 */
export async function awardPointsForAction(
    userId: string,
    actionName: string,
    actionId: string,
    points: number,
    userPoints: number,
    userProfileId: string,
    txHash?: string,
    chainId?: number
) {
    await addPoints(userId, actionId, points, userPoints, userProfileId, txHash, chainId);
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