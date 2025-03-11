'use server'

import webpush from 'web-push'

// Add types for subscriptions
type PushSubscriptionKeys = {
    p256dh: string;
    auth: string;
}

type SerializedPushSubscription = {
    endpoint: string;
    keys: PushSubscriptionKeys;
}

webpush.setVapidDetails(
    'mailto:jdavidgomezca@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(subscription: SerializedPushSubscription) {
    try {
        // Store subscription in your database
        return { success: true, subscription }
    } catch (error) {
        console.error('Error saving subscription:', error)
        return { success: false, error: 'Failed to save subscription' }
    }
}

export async function unsubscribeUser(endpoint: string) {
    try {
        // Remove subscription from your database
        return { success: true, endpoint }
    } catch (error) {
        console.error('Error removing subscription:', error)
        return { success: false, error: 'Failed to remove subscription' }
    }
}

export async function sendNotification(
    subscription: SerializedPushSubscription,
    message: string
) {
    try {
        // The subscription is already in the correct format
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'UserOp Notification',
                body: message,
                icon: '/icon.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Error sending push notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}