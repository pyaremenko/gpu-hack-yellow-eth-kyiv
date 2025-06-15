import { Hex } from "viem";
import { ethers } from "ethers";

export interface CryptoKeypair {
    /** Private key in hexadecimal format */
    privateKey: Hex;
    /** Ethereum address derived from the public key */
    address: Hex;
}

export const generateKeyPair = async (): Promise<CryptoKeypair> => {
    try {
        // Generate random bytes for private key
        const randomBytes = ethers.utils.randomBytes(32);

        // Hash the random bytes with Keccak256 for additional security
        const privateKeyHash = ethers.utils.keccak256(randomBytes);

        // Create a wallet from the hashed private key
        const wallet = new ethers.Wallet(privateKeyHash);

        return {
            privateKey: privateKeyHash as Hex,
            address: ethers.utils.getAddress(wallet.address) as Hex,
        };
    } catch (error) {
        console.error("Error generating keypair, using fallback:", error);
        // Fallback: Use alternative random bytes generation
        const fallbackRandom = ethers.utils.randomBytes(32);
        const privateKey = ethers.utils.keccak256(fallbackRandom);
        const wallet = new ethers.Wallet(privateKey);

        return {
            privateKey: privateKey as Hex,
            address: ethers.utils.getAddress(wallet.address) as Hex,
        };
    }
};