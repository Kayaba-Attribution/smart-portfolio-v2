"use client";

export function DebugInfo() {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs">
            <div>PASSKEY_URL: {process.env.NEXT_PUBLIC_ZERODEV_PASSKEY_SERVER_URL}</div>
            <div>BUNDLER_URL: {process.env.NEXT_PUBLIC_ZERODEV_BUNDLER_URL}</div>
            <div>PROJECT_ID: {process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID}</div>
        </div>
    );
} 