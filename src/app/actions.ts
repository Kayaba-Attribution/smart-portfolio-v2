'use server'

import webpush from 'web-push'

// Add type for web-push subscription
type WebPushSubscription = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

webpush.setVapidDetails(
    'mailto:jdavidgomezca@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(subscription: PushSubscription) {
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

export async function sendNotification(subscription: PushSubscription, message: string) {
    try {
        // Convert browser PushSubscription to web-push format
        const webPushSubscription: WebPushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.toJSON().keys!.p256dh,
                auth: subscription.toJSON().keys!.auth
            }
        }

        await webpush.sendNotification(
            webPushSubscription,
            JSON.stringify({
                title: 'Test Notification',
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