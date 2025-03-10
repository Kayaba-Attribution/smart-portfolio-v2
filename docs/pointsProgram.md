Schema for a Non-Spendable Points System
The key change is that points are purely for reputation, access, or ranking, not a currency.

1️⃣ Users Table (users)
Stores user data and accumulated points.

Column	Type	Description
id	UUID / String	Unique user ID
wallet_address	String (unique)	User's wallet address
email	String (unique, nullable)	Email (optional, rewarded if added)
email_verified	Boolean	Ensures email is real before granting points
created_at	Timestamp	Signup date
total_points	Integer	Total accumulated points (never spent)
referrer_id	UUID (nullable)	Who referred them (for tracking referral chains)
👉 Rules for Earning Points:

Users gain points from actions (e.g., referring users, adding email, creating portfolios).
Users do NOT spend points—points only accumulate and can be used for status, access, or airdrop eligibility.
2️⃣ Referrals Table (referrals)
Tracks user referrals and ensures legitimacy.

Column	Type	Description
id	UUID	Unique referral ID
referrer_id	UUID	The user who referred someone
referred_user_id	UUID	The new user who signed up
points_awarded	Integer	Referral bonus points (if valid)
created_at	Timestamp	When the referral happened
valid	Boolean	Whether the referral counted (based on engagement criteria)
👉 Referral Rules to Prevent Abuse:
✅ Max 5 referrals per week per user (prevents mass farming).
✅ Referred user must verify email & create a portfolio before points are awarded.
✅ Cooldown per referral (e.g., 24h delay before receiving points).
✅ Duplicate wallet and IP detection to prevent self-referrals.

3️⃣ Actions Table (actions)
Defines how users accumulate points.

Column	Type	Description
id	UUID	Unique action ID
name	String	Action name (e.g., "Referral", "Portfolio Created", "Email Added")
description	Text	What the action does
points	Integer	Points awarded
cooldown	Integer (optional)	How often it can be done (e.g., "1 per day")
👉 Initial Actions & Points Allocations:
✅ Referral Success → +X Points
✅ Email Added & Verified → +Y Points
✅ Portfolio Created (Template) → +A Points
✅ Portfolio Created (Custom) → +B Points
✅ Social Actions (Twitter Follow, Telegram Join) → +C Points (Future Feature)

4️⃣ Points Transactions Table (points_transactions)
Tracks every point-earning event.

Column	Type	Description
id	UUID	Unique transaction ID
user_id	UUID	Who earned the points
action_id	UUID	The action that triggered the transaction
points	Integer	How many points were earned
timestamp	Timestamp	When the action happened
👉 Why this is important:

Maintains a history of points earned.
Prevents abuse by tracking referral-based point farming.
5️⃣ Portfolios Table (portfolios)
Tracks created portfolios but doesn’t spend points.

Column	Type	Description
id	UUID	Unique portfolio ID
user_id	UUID	Who created it
type	ENUM ("template", "custom")	Type of portfolio
created_at	Timestamp	When it was created
👉 Portfolio Creation Rules:
✅ Template Portfolio → Awards X Points
✅ Custom Portfolio → Awards Y Points
⏳ Cooldown (1-2 per day) → Prevents spamming portfolios

🔹 How This Works in Practice
Users earn points but never spend them.
Points are used for status, eligibility, or airdrops—not transactions.
Prevents abuse with referral cooldowns and validation rules.
Can expand later to include social engagement (Twitter, Telegram).
🔹 Next Steps
1️⃣ Implement this schema in your database.
2️⃣ Set up referral & action tracking (e.g., only valid if email verified, portfolio created).
3️⃣ Create leaderboards, airdrop eligibility, or exclusive perks based on point ranking.
4️⃣ Future expansion: Integrate Twitter/Telegram verification for bonus points.

