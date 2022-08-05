import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SolTransfer } from "../target/types/sol_transfer";
const { SystemProgram, LAMPORTS_PER_SOL } = anchor.web3;

import { PublicKey } from "@solana/web3.js";

describe("sol-transfer", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolTransfer as Program<SolTransfer>;

  async function addFunds(pubKey: PublicKey, amount: number) {
    /**
     * Adds funds to the given user's account.
     * */
    const airdrop_tx = await provider.connection.requestAirdrop(pubKey, amount);
    console.log("airdrop_tx: ", airdrop_tx);
    return await provider.connection.confirmTransaction(airdrop_tx);
  }

  async function checkSolBalance(pubKey: PublicKey) {
    let bal = await provider.connection.getBalance(pubKey);
    console.log(`balance:  ${bal / LAMPORTS_PER_SOL} SOL`);
  }

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Initialize transaction signature", tx);
  });

  it("Checking Lamport Transfer ... ", async () => {
    const recevierPubKey = new PublicKey(
      "A7CdcQ9BaehNeZuTTgHe66LhjW2f8BW5fa2Jf3R6oDqm"
    );

    let amount = 10 * LAMPORTS_PER_SOL;
    console.log("Will transfer : ", amount);
    const res = await addFunds(
      provider.wallet.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    console.log("airdrop_tx res:", res);

    console.log('>>>>> Before transfer >>>>>>>')
    console.log('Sender :')
    await checkSolBalance(provider.wallet.publicKey)

    console.log('Receiver: ')
    await checkSolBalance(recevierPubKey)

    const tx = await program.methods
      .lampTransfer(new anchor.BN(amount))
      .accounts({
        user: provider.wallet.publicKey,
        receiver: recevierPubKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Transfer transaction signature", tx);


    console.log('>>>>> After transfer >>>>>>>')
    console.log('Sender :')
    await checkSolBalance(provider.wallet.publicKey)

    console.log('Receiver: ')
    await checkSolBalance(recevierPubKey)

  });
});
