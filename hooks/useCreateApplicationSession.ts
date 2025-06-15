import {
  generateRequestId,
  getCurrentTimestamp,
  MessageSigner,
  NitroliteRPC,
  RPCMethod,
} from "@erc7824/nitrolite";
import { useCallback } from "react";
import { Address, Hex } from "viem";
import { useSessionKey } from "./useSessionKey";
// NEXT_PUBLIC_SESSION_KEY_PUBLIC_KEY
export const useCreateApplicationSession = (
  ws: WebSocket | null,
  signer: MessageSigner
) => {
  const { signer: counterpartySigner } = useSessionKey(
    process.env.NEXT_PUBLIC_SESSION_KEY_PRIVATE_KEY as Hex
  );
  const createApplicationSession = useCallback(
    async (myAccount: Address, depositAmount: string) => {
      console.log("my account, ", myAccount);
      console.log("ws = ", ws);
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not connected");
      }

      const counterpartyAccount = process.env
        .NEXT_PUBLIC_SESSION_KEY_PUBLIC_KEY as Address;

      // Validate deposit amount
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Invalid deposit amount: must be a positive number");
      }

      // Format amount to string with 6 decimal places (for USDC precision)
      const formattedAmount = amount.toFixed(6).replace(/\.?0+$/, "");

      console.log("formattedAmount = ", formattedAmount);
      try {
        // Define the application parameters
        const appDefinition = {
          protocol: "nitroliterpc",
          participants: [myAccount, counterpartyAccount],
          weights: [100, 0], // Weight distribution for consensus
          quorum: 100, // Required consensus percentage
          challenge: 0, // Challenge period
          nonce: Date.now(), // Unique identifier
        };

        // Define allocations with asset type instead of token address
        const allocations = [
          {
            participant: myAccount,
            asset: "usdc",
            amount: formattedAmount,
          },
          {
            participant: counterpartyAccount,
            asset: "usdc",
            amount: 0,
          },
        ];

        const params = [
          {
            definition: appDefinition,
            allocations: allocations,
          },
        ];

        const requestId = generateRequestId();
        const timestamp = getCurrentTimestamp();

        const request = NitroliteRPC.createRequest(
          requestId,
          RPCMethod.CreateAppSession,
          params,
          timestamp
        );
        const signedRequest = await NitroliteRPC.signRequestMessage(
          request,
          signer
        );

        const counterpartyRequest = NitroliteRPC.createRequest(
          requestId,
          RPCMethod.CreateAppSession,
          params,
          timestamp
        );
        const counterpartySignedRequest = await NitroliteRPC.signRequestMessage(
          counterpartyRequest,
          counterpartySigner
        );

        if (!signedRequest?.sig?.[0] || !counterpartySignedRequest?.sig?.[0]) {
          throw new Error("Failed to sign the application session request");
        }

        signedRequest.sig = [
          signedRequest.sig[0],
          counterpartySignedRequest.sig[0],
        ];

        const signedMessage = JSON.stringify(signedRequest);

        // Send the signed message to the ClearNode
        ws.send(signedMessage);
      } catch (error) {
        console.error("Error creating application session:", error);
        throw new Error("Failed to create application session");
      }
    },
    [signer, ws]
  );

  return { createApplicationSession };
};
