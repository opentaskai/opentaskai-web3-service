import fs from 'fs';
import {
  Keypair,
  Ed25519Program
} from "@solana/web3.js";
import { createHash } from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58'; 

export function getEd25519Instruction(message: any, signerKeypair: Keypair) {
  const signature = signMessageForEd25519(message, signerKeypair);
  const ed25519Instruction = Ed25519Program.createInstructionWithPublicKey({
    publicKey: signerKeypair.publicKey.toBytes(),
    message: message,
    signature: signature,
  });
  return {ed25519Instruction, signature};
}

export function signMessageForEd25519(message: any, signerKeypair: Keypair) {
  const messageHash = Uint8Array.from(createHash('sha256').update(message).digest());
  // console.log("Message hash:", messageHash.toString('hex'));
  const signature = nacl.sign.detached(messageHash, signerKeypair.secretKey);
  console.log("Signature:", signature);
  return signature;
}

export function bytes32Buffer(snHex: string|number) {
  snHex = String(snHex);
  const snBytes = Buffer.from(snHex, 'hex');
  const len = 32 - snBytes.length;
  let res = snBytes;
  if(len > 0) {
    res = Buffer.concat([Buffer.alloc(len), snBytes]); // Pad with 16 zeros at the beginning
  }
  // console.log('snHex, snBytes, bytes32Buffer:', snHex, snBytes, res);
  return res;
}

export function bufferToBytes32(buffer: Buffer): string {
  // Get the last 32 bytes and convert to hex string
  const bytes = buffer.toString('hex');
  if(bytes.substring(0, 32) === '00000000000000000000000000000000') {
    return bytes.substring(32);
  }
  return bytes;
}

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
        .map(byte => ('0' + byte.toString(16)).slice(-2)) // Convert each byte to hex
        .join(''); // Join all hex values into a single string
}

export function hexStringToUint8Array(hexString: string): Uint8Array {
    const byteCount = hexString.length / 2; // Each byte is represented by 2 hex characters
    const uint8Array = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
        uint8Array[i] = parseInt(hexString.substr(i * 2, 2), 16); // Convert hex to byte
    }
    return uint8Array;
}

export function loadKeypair(keypairPath:string) {
  const keypairJson = fs.readFileSync(keypairPath, 'utf-8');
  const keypairData = JSON.parse(keypairJson);
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  return keypair;
}

export function loadBase58Key(keypairPath:string) {
  const keypair = loadKeypair(keypairPath);
  // To save the keypair as a Base58 string
  return bs58.encode(keypair.secretKey);
}

export function getBase58Key(keypair:Keypair) {
  // To save the keypair as a Base58 string
  return bs58.encode(keypair.secretKey);
}

export function getKeypairFromBase58Key(bs58Key:string) {
  return Keypair.fromSecretKey(bs58.decode(bs58Key));
}