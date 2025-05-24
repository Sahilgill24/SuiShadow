import React, { useEffect, useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { Button } from "../ui/button";
import { useAuthStore, type AccountData } from "@/lib/auth-store";
import { usePixelRemover } from "@/hooks/use-pixel-remover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { SuiClient, type SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { genAddressSeed, getZkLoginSignature } from "@mysten/zklogin";




export function mintNFT() {

}
function keypairFromSecretKey(privateKeyBase64: string): Ed25519Keypair {
  const keyPair = decodeSuiPrivateKey(privateKeyBase64);
  return Ed25519Keypair.fromSecretKey(keyPair.secretKey);
}



const MintNFTForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const { accounts, setBalances } = useAuthStore();
  const suiClient = new SuiClient({ url: "https://fullnode.testnet.sui.io:443" });
  (accounts.map((account) => console.log(account.userAddr)));
  // account pe send transaction 
  async function fetchBalances(accounts: AccountData[]) {
    if (accounts.length === 0) return;
    const newBalances = new Map<string, number>();
    for (const account of accounts) {
      const suiBalance = await suiClient.getBalance({
        owner: account.userAddr,
        coinType: "0x2::sui::SUI",
      });
      newBalances.set(
        account.userAddr,
        +suiBalance.totalBalance / 1_000_000_000
      );
    }
    setBalances(newBalances);
  }
  async function sendTransaction(account: AccountData) {
    const tx = new Transaction();
    tx.setSender(account.userAddr);
    const packageid = "0x0b941411e0b96deca6c88f25bff1148759b7deff09666391c33b7d2479b42b00";
    const module = "nft";
    const functionName = "mint_to_sender";
    const args = []
    tx.moveCall({
      target: `${packageid}::${module}::${functionName}`,
      arguments: [tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },)],
    });

    const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
    const { bytes, signature: userSignature } = await tx.sign({
      client: suiClient,
      signer: ephemeralKeyPair,
    });
    const addressSeed = genAddressSeed(
      BigInt(account.userSalt),
      "sub",
      account.sub,
      account.aud
    ).toString();
    const { epoch } = await suiClient.getLatestSuiSystemState();
    const zkLoginSignature = getZkLoginSignature({
      // @ts-ignore
      inputs: {
        ...(typeof account.zkProofs === "object" && account.zkProofs !== null
          ? account.zkProofs
          : {}),
        addressSeed,
      },
      maxEpoch: account.maxEpoch,
      userSignature,
    });
    console.log("ZkLogin Signature", zkLoginSignature);
    const resp = await suiClient
      .executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
        options: { showEffects: true },
      })



  }



  const walletAddress = accounts[0].userAddr;


  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);



  const {
    canvasRef,
    outputSrc,
    handleImageUpload,
    merkleRoot
    // slicedBlocks,
  } = usePixelRemover();

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  useEffect(() => {
    setImagePreview(outputSrc)
  }, [outputSrc])



  const handleObfuscate = async () => {
    (accounts.map((account) => (account.userAddr)));
    const resp = await sendTransaction(accounts[0]);
    console.log(resp);

    // Simulate obfuscation and merkleroot generation
    if (image) {
      handleImageUpload(image);

      console.log(outputSrc);
    } else {

    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle publish logic here
    alert("NFT Minted!");
  };

  return (
    <form
      className="max-w-3xl mx-auto space-y-6 p-6 bg-muted/50 mb-10 border rounded-xl"
      onSubmit={handlePublish}
    >
      <div>
        <Label className="block font-medium mb-1">Name</Label>
        <Input
          type="text"
          className="w-full border rounded px-3 py-2 bg-muted"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="block font-medium mb-1">Description</Label>
        <Textarea
          className="w-full border rounded px-3 py-2 bg-muted"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="block font-medium mb-1">Price (SUI)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded px-3 py-2 bg-muted"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <Label className="block font-medium mb-1">Wallet Address</Label>
          <Input
            type="text"
            className="w-full border rounded px-3 py-2 bg-muted border-primary"
            value={walletAddress}
            readOnly
          />
        </div>
      </div>
      <div>
        <Label className="block font-medium mb-1">Upload Image</Label>
        <FileUpload accept="image/*" onChange={handleFileChange} />
      </div>
      <div className="flex items-end gap-4">
        <Button
          type="button"
          onClick={handleObfuscate}
          size={"lg"}
          disabled={!image}
        >
          Obfuscate
        </Button>
        <div className="flex-1">
          <Label className="block font-medium mb-1">Merkleroot</Label>
          <Input
            type="text"
            className="w-full border rounded px-3 py-2 bg-muted border-primary"
            placeholder="Merkleroot (will be generated automatically)"
            value={merkleRoot ?? ""}
            disabled={!merkleRoot}
            readOnly
          />
        </div>
      </div>
      <div>
        <Label className="block font-medium mb-1">Image Preview</Label>
        <div className="w-full h-48 border rounded flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-muted-foreground">No image selected</span>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full mt-4"
        disabled={!merkleRoot || !image}
      >
        Final Publish
      </Button>
    </form>
  );
};

export { MintNFTForm };
