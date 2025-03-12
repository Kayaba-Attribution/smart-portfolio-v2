// Define action names and IDs as constants that match the ones in seedActions.js
export const POINTS_ACTIONS = {
    FAUCET: {
        id: '33f1576a-456f-4f81-939a-f972aca8ba0e',
        name: 'FAUCET_USE',
        description: 'Claimed tokens from the faucet',
        points: 10,
        cooldown: 86400000 // 24 hours
    },
    PORTFOLIO_CUSTOM_CREATED: {
        id: '453926ad-b02b-4e9a-886c-ffefe5de8d42',
        name: 'PORTFOLIO_CUSTOM_CREATED',
        description: 'Created a new custom portfolio',
        points: 25,
        cooldown: 86400000 // 24 hours
    },
    PORTFOLIO_TEMPLATE_CREATED: {
        id: 'e69f1531-0435-4543-8bab-0b47ae664ad8',
        name: 'PORTFOLIO_TEMPLATE_CREATED',
        description: 'Created a new template portfolio',
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
