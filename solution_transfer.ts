import {
  Connection,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";

const suppliedToPubkey = process.argv[2] || null;

if (!suppliedToPubkey) {
  console.log(`Please provide a public key to send sol to`);
  process.exit(1);
}

const fromKeypair = getKeypairFromEnvironment("SECRET_KEY");

const toAccountPubKey = new PublicKey(suppliedToPubkey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const transaction = new Transaction();

const transferInstruction = SystemProgram.transfer({
  fromPubkey: fromKeypair.publicKey,
  toPubkey: toAccountPubKey,
  lamports: 5000,
});

transaction.add(transferInstruction);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  fromKeypair,
]);

console.log(`Transaction signature is ${signature}`);
