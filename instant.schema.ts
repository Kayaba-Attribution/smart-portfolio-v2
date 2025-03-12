import { i } from '@instantdb/react';

const _schema = i.schema({
    entities: {
        userProfiles: i.entity({
            walletAddress: i.string().unique().indexed(),
            username: i.string().optional().indexed(),
            totalPoints: i.number().indexed(),
            createdAt: i.number().indexed(),
            referrerId: i.string().optional().indexed(),
        }),

        referrals: i.entity({
            referrerId: i.string().indexed(),
            referredUserId: i.string().indexed(),
            pointsAwarded: i.number(),
            createdAt: i.number().indexed(),
            valid: i.boolean(),
        }),

        actions: i.entity({
            name: i.string(),
            description: i.string(),
            points: i.number(),
            cooldown: i.number().optional(),
        }),

        pointsTransactions: i.entity({
            userId: i.string().indexed(),
            actionId: i.string().indexed(),
            points: i.number(),
            timestamp: i.number().indexed(),
            txHash: i.string().indexed(),
            chainId: i.number().indexed(),
        }),

        portfolios: i.entity({
            userId: i.string().indexed(),
            type: i.string(),
            createdAt: i.number().indexed(),
        }),
    },

    links: {
        userProfile: {
            forward: { on: 'userProfiles', has: 'one', label: 'profile' },
            reverse: { on: 'userProfiles', has: 'one', label: 'user' },
        },

        userReferrer: {
            forward: { on: 'userProfiles', has: 'one', label: 'referrer' },
            reverse: { on: 'userProfiles', has: 'many', label: 'referredUsers' },
        },

        userReferrals: {
            forward: { on: 'referrals', has: 'one', label: 'referrer' },
            reverse: { on: 'userProfiles', has: 'many', label: 'referrals' },
        },

        userPointsTransactions: {
            forward: { on: 'pointsTransactions', has: 'one', label: 'user' },
            reverse: { on: 'userProfiles', has: 'many', label: 'pointsTransactions' },
        },

        actionPointsTransactions: {
            forward: { on: 'pointsTransactions', has: 'one', label: 'action' },
            reverse: { on: 'actions', has: 'many', label: 'transactions' },
        },

        userPortfolios: {
            forward: { on: 'portfolios', has: 'one', label: 'user' },
            reverse: { on: 'userProfiles', has: 'many', label: 'portfolios' },
        },
    },
});

type AppSchema = typeof _schema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
