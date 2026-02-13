import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import { Buffer } from 'buffer';

// Dogecoin Network Parameters
const dogeNetwork = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dc',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398
  },
  pubKeyHash: 0x1e, // Starts with D
  scriptHash: 0x16, // Starts with 9 or A
  wif: 0x9e         // Starts with Q or 6
};

const SOCHAIN_API = 'https://sochain.com/api/v2';

export const createWallet = () => {
    const keyPair = bitcoin.ECPair.makeRandom({ network: dogeNetwork });
    const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: dogeNetwork });
    return {
        address,
        privateKey: keyPair.toWIF()
    };
};

export const importWallet = (wif) => {
    try {
        const keyPair = bitcoin.ECPair.fromWIF(wif, dogeNetwork);
        const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: dogeNetwork });
        return {
            address,
            privateKey: wif
        };
    } catch (e) {
        throw new Error("Invalid Private Key");
    }
};

export const getBalance = async (address) => {
    try {
        const { data } = await axios.get(`${SOCHAIN_API}/get_address_balance/DOGE/${address}`);
        return parseFloat(data.data.confirmed_balance) + parseFloat(data.data.unconfirmed_balance);
    } catch (err) {
        console.error("Failed to fetch balance", err);
        return 0;
    }
};

export const sendTransaction = async (wif, toAddress, amountSatoshis) => {
    try {
      const keyPair = bitcoin.ECPair.fromWIF(wif, dogeNetwork);
      const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: dogeNetwork });

      // 1. Fetch UTXOs
      const { data: utxoData } = await axios.get(`${SOCHAIN_API}/get_tx_unspent/DOGE/${address}`);
      if (utxoData.status !== 'success') throw new Error('Failed to fetch UTXOs');

      const utxos = utxoData.data.txs;
      // Sort descending to use largest inputs first
      utxos.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

      if (utxos.length === 0) throw new Error('No funds available');

      const psbt = new bitcoin.Psbt({ network: dogeNetwork });
      let totalInput = 0;
      const fee = 10000000; // 0.1 DOGE fixed fee
      const targetAmount = amountSatoshis + fee;
      
      // 2. Add Inputs
      for (const utxo of utxos) {
        const val = Math.round(parseFloat(utxo.value) * 100000000);
        
        // Fetch Hex for nonWitnessUtxo (Required for Legacy/P2PKH)
        const { data: txData } = await axios.get(`${SOCHAIN_API}/get_tx_hex/DOGE/${utxo.txid}`);
        if (txData.status !== 'success') throw new Error(`Failed to fetch tx hex for ${utxo.txid}`);
        
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.output_no,
          nonWitnessUtxo: Buffer.from(txData.data.tx_hex, 'hex')
        });
        
        totalInput += val;
        if (totalInput >= targetAmount) break;
      }

      if (totalInput < targetAmount) throw new Error(`Insufficient funds: Have ${totalInput/1e8}, Need ${targetAmount/1e8}`);

      // 3. Add Outputs
      const change = totalInput - amountSatoshis - fee;

      psbt.addOutput({
        address: toAddress,
        value: amountSatoshis
      });

      if (change > 5460) { // Dust limit safety
        psbt.addOutput({
          address: address, // Change back to self
          value: change
        });
      }

      // 4. Sign
      psbt.signAllInputs(keyPair);
      psbt.validateSignaturesOfInput(0);
      psbt.finalizeAllInputs();

      const txHex = psbt.extractTransaction().toHex();

      // 5. Broadcast
      const { data: broadcastData } = await axios.post(`${SOCHAIN_API}/send_tx/DOGE`, { tx_hex: txHex });
      
      if (broadcastData.status === 'success') {
        return broadcastData.data.txid;
      } else {
        throw new Error('Broadcast failed: ' + JSON.stringify(broadcastData.data));
      }

    } catch (err) {
      console.error('Transaction failed', err);
      throw err;
    }
};
