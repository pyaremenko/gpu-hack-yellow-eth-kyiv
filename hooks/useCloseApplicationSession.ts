import { CloseAppSessionRequest, createCloseAppSessionMessage, MessageSigner } from '@erc7824/nitrolite';
import { useCallback } from 'react';
import { Address, Hex } from 'viem';

export const useCloseApplicationSession = (ws: WebSocket | null, signer: MessageSigner) => {
    const closeApplicationSession = useCallback(
        async (myAccount: Address, pointsEarned: number) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                throw new Error('WebSocket is not connected');
            }

            try {
                const appId = window.localStorage.getItem('app_session_id');
                const depositAmount = window.localStorage.getItem('session_deposit_amount');

                if (!appId) {
                    throw new Error('Application ID is required to close the session.');
                }
                if (!depositAmount) {
                    throw new Error('Deposit amount not found in local storage.');
                }

                // Validate deposit amount
                const amount = parseFloat(depositAmount);
                if (isNaN(amount) || amount <= 0) {
                    throw new Error('Invalid deposit amount: must be a positive number');
                }

                // Store points with app_session_id
                window.localStorage.setItem('app_session_id', JSON.stringify({
                    appId: appId as Hex,
                    pointsEarned,
                }));

                // Create allocations with asset type
                const allocations = [
                    {
                        participant: myAccount,
                        asset: 'usdc',
                        amount: JSON.stringify(amount),
                    }
                ];

                // Create the close request
                const closeRequest: CloseAppSessionRequest = {
                    app_session_id: appId as Hex,
                    allocations: allocations,
                };

                // Create the signed message
                const signedMessage = await createCloseAppSessionMessage(signer, [closeRequest]);

                ws.send(signedMessage);
            } catch (error) {
                console.error('Error closing application session:', error);
                throw new Error('Failed to close application session');
            }
        },
        [signer, ws]
    );

    return { closeApplicationSession };
};