import React, { useEffect, useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { Button } from "../ui/button";
import { useAuthStore, type AccountData } from "@/lib/auth-store";
import { usePixelRemover } from "@/hooks/use-pixel-remover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  useAccounts,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientContext,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import { SuiClient, type SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { EnokiClient } from '@mysten/enoki';
import { getAllowlistedKeyServers, SealClient, SessionKey, type SessionKeyType } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';
import axios from "axios";




export function mintNFT() { }

function toUint8array(val: string) {
  const encoder = new TextEncoder();
  const encodedbytes = encoder.encode(val);
  return encodedbytes;
}

const MintNFTForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [allowlistaddress, setAllowlistAddress] = useState("");
  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const suiClient = new SuiClient({
    url: "https://fullnode.testnet.sui.io:443",
  });
  const tx = new Transaction();
  const packagid = '0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25';
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'
  const allowlist_id = '0x6712d543fb6687a1779168a191c6afaa45eab974c853b5e9ed36d12088723c19';
  const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
  const allowlistobject = '0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9' // actually the term allowlist_id 
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  // @ts-ignore
  const { client, network } = useSuiClientContext();
  const sealnewclient = new SealClient({
    //@ts-ignore
    suiClient: client,
    serverObjectIds: getAllowlistedKeyServers('testnet').map(id => [id, 1] as [string, number]),
    verifyKeyServers: false,
  });
  async function encryption(data: string): Promise<any> {
    const allowbytes = fromHex(allowlistobject);
    const nonce = Uint8Array.from([1, 2, 3, 4, 5]);
    // can select a random nonce
    const encryptionid = toHex(new Uint8Array([...allowbytes, ...nonce]))
    const fileData = toUint8array(data)
    const { encryptedObject: encryptedBytes } = await sealnewclient.encrypt({
      threshold: 2,
      packageId: packagid,
      id: encryptionid,
      data: fileData,
    });

    console.log("Encrypted Bytes:", encryptedBytes);
    return encryptedBytes;
  }

  async function uploadtoblob(): Promise<any> {
    // Add name, description, and merkle root to the DecodedPayload
    // Encrypt the coordinates
    const coordsString = JSON.stringify(DecodedPayload.coords);
    const encryptedCoords = await encryption(coordsString);

    const payloadWithMetadata = {
      blocks: DecodedPayload.blocks,
      obfuscatedImage: obfuscatedImage,
      name: name,
      description: description,
      merkleRoot: merkleRoot,
      enccoords: encryptedCoords,
      url: uploadedImageUrl,
      addres: currentAccount?.address ?? "",
    };
    console.log("Payload with Metadata:", payloadWithMetadata.enccoords);
    console.log("Payload with Metadata:", payloadWithMetadata.obfuscatedImage);

    const url = `${PUBLISHER}/v1/blobs`;
    const fileBuffer = new Blob([JSON.stringify(payloadWithMetadata)], { type: "application/json" });
    const response = await axios({
      method: 'put',
      url: url,
      data: fileBuffer,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    });
    // this should be our blob id 
    const blobId = response.data.newlyCreated.blobObject.blobId;
    console.log("blobId", response.data.newlyCreated.blobObject.blobId);
    return blobId.toString();
  }

  // THis uploads the obfuscated image to the marketplace::store contract
  async function uploadtomarketplace(blob: string) {

    tx.moveCall({
      arguments: [tx.pure.vector('u8', toUint8array(`${name}`)), tx.pure.vector('u8', toUint8array(`${description}`)), tx.pure.vector('u8', toUint8array(`${uploadedImageUrl}`)), tx.pure.vector('u8', toUint8array(`${merkleRoot}`))],
      target: `${packagid}::nft::mint_to_sender`,
    })
    tx.moveCall({
      target: `${packagid}::store::add_blob`,
      arguments: [tx.object(id), tx.pure.vector('u8', toUint8array(blob))],
    })
    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
    });
    console.log("Transaction executed with digest:", result.digest);

  }
  // can set the return type here to make it easier
  async function fetchBlobs() {
    const blobs = await client.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      }
    })
    //@ts-ignore
    console.log('hello', blobs.data?.content?.fields.blobs);


  }

  async function addtoAllowlist(address: string) {

    // tx.moveCall({
    //   target: `${packagid}::allowlist::create_allowlist_entry`,
    //   arguments: [tx.pure.string("nft access")],
    // });
    // const blobs = await client.getObject({
    //   id: '0x3e6403d05347b21d05f984bbe2e731b6ac3f7b3581f5d489ebb5cf3af59445b4',
    //   options: {
    //     showContent: true,
    //     showType: true,
    //   }
    // })

    // 0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9 allowlist id from this account 
    //@ts-ignore
    // console.log('hello', blobs);

    tx.moveCall({
      target: `${packagid}::allowlist::add`,
      arguments: [tx.object('0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9'), tx.object('0x3e6403d05347b21d05f984bbe2e731b6ac3f7b3581f5d489ebb5cf3af59445b4'), tx.pure.address(address)],
    });
    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet'
    });
    console.log("Transaction executed with digest:", result);


  }

  // account pe send transaction
  // async function fetchBalances(accounts: AccountData[]) {
  //   if (accounts.length === 0) return;
  //   const newBalances = new Map<string, number>();
  //   for (const account of accounts) {
  //     const suiBalance = await suiClient.getBalance({
  //       owner: account.userAddr,
  //       coinType: "0x2::sui::SUI",
  //     });
  //     newBalances.set(
  //       account.userAddr,
  //       +suiBalance.totalBalance / 1_000_000_000
  //     );
  //   }
  //   setBalances(newBalances);
  // }
  // async function sendTransaction(account: AccountData) {
  // const tx = new Transaction();
  // tx.setSender(account.userAddr);
  // const packageid = "0x0b941411e0b96deca6c88f25bff1148759b7deff09666391c33b7d2479b42b00";
  // const module = "nft";
  // const functionName = "mint_to_sender";
  // const args = []
  // tx.moveCall({
  //   target: `${packageid}::${module}::${functionName}`,
  //   arguments: [tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },), tx.makeMoveVec({ "elements": [], "type": "u8" },)],
  // });
  // const ephemeralKeyPair = keypairFromSecretKey(account.ephemeralPrivateKey);
  // const { bytes, signature: userSignature } = await tx.sign({
  //   client: suiClient,
  //   signer: ephemeralKeyPair,
  // });
  // const addressSeed = genAddressSeed(
  //   BigInt(account.userSalt),
  //   "sub",
  //   account.sub,
  //   account.aud
  // ).toString();
  // const { epoch } = await suiClient.getLatestSuiSystemState();
  // const zkLoginSignature = getZkLoginSignature({
  //   // @ts-ignore
  //   inputs: {
  //     ...(typeof account.zkProofs === "object" && account.zkProofs !== null
  //       ? account.zkProofs
  //       : {}),
  //     addressSeed,
  //   },
  //   maxEpoch: account.maxEpoch,
  //   userSignature,
  // });
  // console.log("ZkLogin Signature", zkLoginSignature);
  // const resp = await suiClient
  //   .executeTransactionBlock({
  //     transactionBlock: bytes,
  //     signature: zkLoginSignature,
  //     options: { showEffects: true },
  //   })
  // }
  async function finalpublish() {
    const bob = await uploadtoblob();
    // await encryption(bob ?? "");
    await uploadtomarketplace(bob ?? "");


  }
  const walletAddress = currentAccount?.address;

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    canvasRef,
    outputSrc,
    handleImageUpload,
    merkleRoot,
    DecodedPayload,
    obfuscatedImage,
    uploadedImageUrl

    // slicedBlocks,
  } = usePixelRemover();

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  useEffect(() => {
    setImagePreview(outputSrc);
  }, [outputSrc]);

  const handleObfuscate = async () => {
    // Simulate obfuscation and merkleroot generation
    if (image) {
      handleImageUpload(image);

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
      <Input
        type="text"
        className="w-full border rounded px-3 py-2 bg-muted border-primary"
        placeholder="Enter the address you want to add to the allowlist"
        value={allowlistaddress}
        onChange={(e) => setAllowlistAddress(e.target.value)}
      />
      <Button onClick={async () => await addtoAllowlist(allowlistaddress)}>Add to Allowlist</Button>
      <Button
        type="submit"
        className="w-full mt-4"
        disabled={!merkleRoot || !image}
        onClick={finalpublish}
      >
        Final Publish
      </Button>
      <div className="grid grid-cols-2 gap-4">
        {DecodedPayload &&
          DecodedPayload.blocks.map((base64Img: string, index: number) => (
            <img
              key={index}
              src={base64Img}
              alt={`Block ${index}`}
              style={{ width: 100, height: 100 }}
            />
          ))}
      </div>
      {obfuscatedImage && (
        <div>
          <h3>Obfuscated Image</h3>
          <img src={obfuscatedImage} alt="Obfuscated" />
        </div>
      )}
    </form>
  );
};

export { MintNFTForm };
