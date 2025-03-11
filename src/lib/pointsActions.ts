import { tx } from '@instantdb/react';
import { db } from './db';

// Define action names and IDs as constants
export const POINTS_ACTIONS = {
    FAUCET: {
        id: 'faucet_use',
        name: 'Use Faucet',
        description: 'Claimed tokens from the faucet',
        points: 10
    },
    CREATE_PORTFOLIO: {
        id: 'create_portfolio',
        name: 'Create Portfolio',
        description: 'Created a new portfolio',
        points: 25
    },
    DAILY_LOGIN: {
        id: 'daily_login',
        name: 'Daily Login',
        description: 'Logged in for the day',
        points: 5
    },
    // Add more actions as needed
};

/**
 * Ensure the actions exist in the database
 * Call this function during app initialization
 */
export async function ensureActionsExist() {
    try {
        const actions = Object.values(POINTS_ACTIONS);

        // Simple approach: just create all actions with their predefined IDs
        // If they already exist, the transaction will succeed but not change anything
        const actionTransactions = actions.map(action =>
            tx.actions[action.id].update({
                name: action.name,
                description: action.description,
                points: action.points
            })
        );

        if (actionTransactions.length > 0) {
            await db.transact(actionTransactions);
            console.log('Actions initialized successfully');
        }
    } catch (error) {
        console.error('Error ensuring actions exist:', error);
        // Log more detailed error information to help debug
        if (error instanceof Error) {
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
        }
    }
} 