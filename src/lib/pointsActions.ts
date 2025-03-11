// Define action names and IDs as constants that match the ones in seedActions.js
export const POINTS_ACTIONS = {
    FAUCET: {
        id: '33f1576a-456f-4f81-939a-f972aca8ba0e',
        name: 'FAUCET_USE',
        description: 'Claimed tokens from the faucet',
        points: 10,
        cooldown: 86400000 // 24 hours
    },
    CREATE_PORTFOLIO: {
        id: 'create_portfolio',
        name: 'PORTFOLIO_CUSTOM_CREATED',
        description: 'Created a new portfolio',
        points: 25,
        cooldown: 86400000 // 24 hours
    },
    DAILY_LOGIN: {
        id: 'daily_login',
        name: 'DAILY_LOGIN',
        description: 'Logged in for the day',
        points: 5,
        cooldown: 86400000 // 24 hours
    },
    // Add more actions as needed
};
