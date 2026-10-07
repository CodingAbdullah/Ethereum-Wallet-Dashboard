'use client';

import { useSyncExternalStore } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import ConnectWalletButton from './ConnectWalletButton';
import { useSession } from '../hooks/useSession';

export const buttonClass = "bg-gradient-to-r from-gray-600 to-gray-400 text-white py-2 px-6 rounded-md hover:from-gray-500 hover:to-gray-300 transition-all duration-300 font-medium";
const noopSubscribe = () => () => {};

export function Panel({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
    return (
        <Card className="bg-gray-900 border-gray-800 shadow-xl w-full min-w-0">
            <CardHeader className="border-b border-gray-800 pb-6">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-100">{title}</CardTitle>
                <CardDescription className="text-gray-400 text-lg font-light">{description}</CardDescription>
            </CardHeader>
            {children && <CardContent className="space-y-6 pt-6">{children}</CardContent>}
        </Card>
    );
}

// Shows the connect / sign-in steps until the user is signed in, then the children
export default function SignInGate({ notConfigured, children }: { notConfigured: string; children: React.ReactNode }) {
    const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
    const { isConnected } = useAccount();
    const { session, isSignedIn, isLoading, signingIn, error: signInError, signIn } = useSession();

    if (!mounted || isLoading) return <Panel title="Loading…" description="Checking your session" />;
    if (session && !session.accountsEnabled) return <Panel title="Accounts are not set up" description={notConfigured} />;
    if (!isConnected && !isSignedIn) {
        return (
            <Panel title="Connect your wallet" description="Connect a wallet, then sign a message to prove it's yours. Signing is free and sends no transaction.">
                <div className="flex justify-center"><ConnectWalletButton /></div>
            </Panel>
        );
    }
    if (!isSignedIn) {
        return (
            <Panel title="Sign in" description="Sign a one-time message with your wallet. It's free and sends no transaction.">
                {signInError && <Alert variant="destructive"><AlertDescription>{signInError}</AlertDescription></Alert>}
                <div className="flex justify-center">
                    <Button className={buttonClass} disabled={signingIn} onClick={signIn}>
                        {signingIn ? 'Check your wallet…' : 'Sign in with Ethereum'}
                    </Button>
                </div>
            </Panel>
        );
    }
    return <>{children}</>;
}
