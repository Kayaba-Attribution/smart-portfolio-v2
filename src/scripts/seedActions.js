// This script will seed the database with initial action data for the points system
// Run with: node src/scripts/seedActions.js

import { init, tx, id } from "@instantdb/core";
import dotenv from "dotenv";

// Import environment variables
dotenv.config();

// Initialize InstantDB
const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
  console.error(
    "NEXT_PUBLIC_INSTANT_APP_ID is not defined in environment variables"
  );
  process.exit(1);
}

// Define the actions to seed
const actionsToSeed = [
  {
    name: "EMAIL_VERIFIED",
    description: "User verified their email address",
    points: 50,
    cooldown: null, // One-time action
  },
  {
    name: "SUCCESSFUL_REFERRAL",
    description: "User successfully referred a new user",
    points: 100,
    cooldown: 86400000, // 24 hours (in milliseconds)
  },
  {
    name: "PORTFOLIO_TEMPLATE_CREATED",
    description: "User created a portfolio from a template",
    points: 25,
    cooldown: 86400000, // 24 hours
  },
  {
    name: "PORTFOLIO_CUSTOM_CREATED",
    description: "User created a custom portfolio",
    points: 50,
    cooldown: 86400000, // 24 hours
  },
  {
    name: "DAILY_LOGIN",
    description: "User logged in for the day",
    points: 10,
    cooldown: 86400000, // 24 hours
  },
  {
    name: "SOCIAL_SHARE",
    description: "User shared portfolio on social media",
    points: 15,
    cooldown: 86400000, // 24 hours
  },
];

// Initialize InstantDB with the schema
const db = init({
  appId,
});

async function seedActions() {
  console.log("🌱 Seeding actions...");

  try {
    // First, check if actions already exist to avoid duplicates
    const result = await db.query({
      actions: {},
    });

    const existingActions = result.actions || [];
    console.log(`Found ${existingActions.length} existing actions`);

    // Create a map of existing action names
    const existingActionNames = new Map(
      existingActions.map((action) => [action.name, action.id])
    );

    // Prepare transactions for new or updated actions
    const transactions = [];

    for (const action of actionsToSeed) {
      // Check if action already exists
      if (existingActionNames.has(action.name)) {
        const actionId = existingActionNames.get(action.name);
        console.log(`Updating existing action: ${action.name}`);

        // Update the existing action
        transactions.push(
          tx.actions[actionId].update({
            description: action.description,
            points: action.points,
            cooldown: action.cooldown,
          })
        );
      } else {
        // Create a new action
        const actionId = id();
        console.log(`Creating new action: ${action.name}`);

        transactions.push(
          tx.actions[actionId].update({
            name: action.name,
            description: action.description,
            points: action.points,
            cooldown: action.cooldown,
          })
        );
      }
    }

    // Execute all transactions
    if (transactions.length > 0) {
      await db.transact(transactions);
      console.log(`✅ Successfully seeded ${transactions.length} actions`);
    } else {
      console.log("No new actions to seed");
    }
  } catch (error) {
    console.error("❌ Error seeding actions:", error);
  }

  process.exit(0);
}

// Run the seed function
seedActions();
