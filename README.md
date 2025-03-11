# Smart Portfolio PWA App

A Progressive Web App for managing crypto portfolios with user rewards through a points system.

## Features

- Connect with passkey authentication and custom usernames
- Create and manage crypto portfolios
- Track token balances and portfolio performance
- Earn points for various actions
- Leaderboard and rewards system

## InstantDB Integration

This project uses InstantDB for data storage and user management. The database schema includes:

- **Users**: Store user data and points
- **Referrals**: Track user referrals
- **Actions**: Define point-earning actions
- **Points Transactions**: Record point history
- **Portfolios**: Store portfolio data

### Setting Up InstantDB

1. Create an account at [InstantDB](https://instantdb.com/)
2. Create a new app in the InstantDB dashboard
3. Copy your App ID to the `.env.local` file:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID=your-instant-app-id
   ```
4. Install dependencies:
   ```bash
   npm install @instantdb/react @tanstack/react-query
   ```

### Seeding Initial Data

To seed the database with initial actions for the points system:

```bash
npm run seed
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in the required environment variables
4. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication Flow

1. New users can create an account by choosing a username and registering with a passkey
2. The passkey is created with a friendly name that combines the username and app name (e.g., "username - SmartPortfolio")
3. Returning users sign in with their username and previously registered passkey
4. The wallet address serves as the unique identifier in the database, while the username is used for display purposes
5. No automatic login - users must explicitly sign in each time they visit the app
6. The app validates the existence of passkeys during initialization to properly display login/register screens
7. If passkeys are deleted from the device, the app will automatically detect this and show the registration screen

## Passkey Validation

The app uses a robust passkey validation system:

1. When the app loads, it checks if stored usernames have valid passkeys on the device
2. If passkeys are missing, it automatically cleans up localStorage to prevent authentication issues
3. The login screen allows switching between registration and login modes
4. The username is displayed in the header, fetched from the database using the wallet address
5. The app properly handles cases where passkeys might be deleted from the device

## Points System

Users earn points through various actions:

- Email verification: 50 points
- Successful referral: 100 points
- Creating a portfolio from a template: 25 points
- Creating a custom portfolio: 50 points
- Daily login: 10 points
- Sharing on social media: 15 points

Points are non-spendable and represent user reputation and engagement.

## Architecture

### Account Management

The application uses a context-based approach for managing user accounts:

- **AccountContext**: Handles wallet connections and user authentication
  - Stores the wallet address directly as `accountAddress` for easy access
  - Creates InstantDB user records when new wallets are registered
  - Provides authentication state throughout the application
  - Allows users to choose custom usernames during registration
  - Passkeys are created with a combined name format: "username - SmartPortfolio"
  - The Header component queries the database to display the username using the wallet address

### Database Structure

The InstantDB schema is defined in `instant.schema.ts` and includes:

- Users entity with wallet address, username, and points tracking
- Referrals for tracking user referrals
- Actions for defining point-earning activities
- Points transactions for recording point history
- Portfolios for storing portfolio data

## Building for Production

```bash
npm run build
```

## Running in PWA Mode

For the best experience, install the app as a PWA on your device. Instructions for installation appear on the landing page.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

vercel

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.