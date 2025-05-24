import React, { useEffect, useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { Button } from "../ui/button";
import { useAuthStore, type AccountData } from "@/lib/auth-store";
import { usePixelRemover } from "@/hooks/use-pixel-remover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";

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
import axios, { all } from "axios";




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
  const [newallowlistid, setNewAllowlistid] = useState("");
  const [newallowlistobject, setNewAllowlistObject] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStep, setMintingStep] = useState("");
  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const suiClient = new SuiClient({
    url: "https://fullnode.testnet.sui.io:443",
  });
  const packagid = '0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25';
  const allowlist_pckg_id = '0x87e99606517763f4ba82d618e89de5bd88063e49d0c75358bf2af392782f99fd';
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'
  const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
  const allowlistobject = '0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9' // actually the term allowlist_id 
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  // @ts-ignore
  const { client, network } = useSuiClientContext();
  const sealnewclient = new SealClient({
    //@ts-ignore
    suiClient: client,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({ objectId: id, weight: 1 })),
    verifyKeyServers: false,
  });

  const tx = new Transaction();
  const tx2 = new Transaction();
  async function encryption(data: string, allowlistid: string): Promise<any> {
    const nonce = Uint8Array.from([1, 2, 3, 4, 5]);
    // can select a random nonce
    const allowlistidbytes = fromHex(allowlistid);
    const encryptionid = toHex(new Uint8Array([...allowlistidbytes, ...nonce]))
    const fileData = toUint8array(data)
    const { encryptedObject: encryptedBytes } = await sealnewclient.encrypt({
      threshold: 2,
      packageId: packagid,
      id: encryptionid,
      data: fileData,
    });
    console.log("Encryption ID:", encryptionid);
    console.log("Encrypted Bytes:", encryptedBytes);
    return encryptedBytes;
  }

  async function uploadtoblob(allowlistObjectId?: string, allowlistid?: string): Promise<any> {
    setMintingStep("Preparing metadata and encrypting data...");

    // Add name, description, and merkle root to the DecodedPayload
    // Encrypt the coordinates
    const coordsString = JSON.stringify(DecodedPayload.coords);
    const encryptedCoords = await encryption(coordsString, allowlistObjectId ?? "");  // Use allowlist object ID, not cap ID

    const payloadWithMetadata = {
      blocks: DecodedPayload.blocks,
      obfuscatedImage: obfuscatedImage,
      name: name,
      description: description,
      merkleRoot: merkleRoot,
      enccoords: encryptedCoords,
      url: uploadedImageUrl,
      addres: currentAccount?.address ?? "",
      price: price,
      allowlistObjectId: allowlistObjectId || null,
      allowlistid: allowlistid // Include the allowlist object ID
    };
    console.log("Payload with Metadata:", payloadWithMetadata.enccoords);
    console.log("Payload with Metadata:", payloadWithMetadata.obfuscatedImage);
    console.log("Allowlist Object ID:", allowlistObjectId);
    console.log("Allowlist ID:", allowlistid);

    setMintingStep("Uploading to Walrus storage...");

    const url = `${PUBLISHER}/v1/blobs?epochs=5`;
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
    setMintingStep("Creating NFT on blockchain...");

    // Create a fresh transaction for NFT minting


    // const address = currentAccount?.address ?? "";
    tx.moveCall({
      arguments: [tx.pure.vector('u8', toUint8array(`${name}`)), tx.pure.vector('u8', toUint8array(`${description}`)), tx.pure.vector('u8', toUint8array(`${uploadedImageUrl}`)), tx.pure.vector('u8', toUint8array(`${merkleRoot}`))],
      target: `${packagid}::nft::mint_to_sender`,
    })
    tx.moveCall({
      target: `${packagid}::store::add_blob`,
      arguments: [tx.object(id), tx.pure.vector('u8', toUint8array(blob))],
    })

    setMintingStep("Executing transaction...");

    const result = await signAndExecuteTransaction({
      transaction: tx,
      chain: 'sui:testnet',
    });
    console.log("Transaction executed with digest:", result.digest);

    setMintingStep("NFT minted successfully!");

    toast.success("NFT Minted!", {
      description: `Transaction Completed Successfully`,
      action: {
        label: "SuiScan",
        onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${result.digest}`, '_blank')
      },
      duration: 4000,
      position: "top-right",
    });
  }
  async function trialfetch() {

    // tx.moveCall({
    //   target: `${allowlist_pckg_id}::allowlist::create_allowlist_entry`,
    //   arguments: [tx.pure.string("trial_name")],
    // })
    // tx.setGasBudget(1000000000);
    // const result = await signAndExecuteTransaction({
    //   transaction: tx,
    //   chain: 'sui:testnet'
    // });

    //console.log("Create allowlist transaction executed with digest:", result.digest);
    const ownedobjects = await client.getOwnedObjects({
      owner: currentAccount?.address ?? "",
      options: {
        showContent: true,
        showType: true,
      },
    });

    const filteredOwnedObjects = ownedobjects.data.filter((obj) => {
      // Check if the object is an NFT
      // @ts-ignore
      // These are the Allowlists of the user
      if (obj.data?.type == "0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25::allowlist::Cap") {
        return true;
      }
      return false;
    });



    return filteredOwnedObjects;


  }
  // Function to create an allowlist for the NFT
  async function createAllowlist(nftName: string) {
    if (!nftName.trim()) {
      throw new Error("NFT name is required for allowlist creation");
    }

    try {

      tx2.moveCall({
        target: `${packagid}::allowlist::create_allowlist_entry`,
        arguments: [tx2.pure.string(nftName)],
      });
      tx2.setGasBudget(1000000000);

      const result = await signAndExecuteTransaction({
        transaction: tx2,
        chain: 'sui:testnet'
      });

      console.log("Allowlist created with digest:", result.digest);

      // Wait for blockchain indexing
      setMintingStep("Waiting for blockchain confirmation...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch the newly created allowlist
      const objects = await trialfetch();
      const objects2 = objects
      // @ts-ignore
      const objects_allowlist_ids = objects.map(obj => obj.data?.content?.fields?.allowlist_id);
      console.log("Objects Allowlist IDs:", objects);
      const final_allowlist_ids = await Promise.all(objects_allowlist_ids.map(async (id) => {
        // Fetch the full object details for each allowlist ID
        const allowlistObject = await client.getObject({
          id: id,
          options: {
            showContent: true,
            showType: true,
          }
        });
        return allowlistObject;
      }));
      // Filter objects to find the one with matching name
      console.log("Allowlist IDs:", final_allowlist_ids);
      const filteredObjects = final_allowlist_ids.filter((obj) => {
        // @ts-ignore
        return obj.data?.content?.fields?.name == nftName;
      });

      if (filteredObjects.length === 0) {
        throw new Error("Failed to find created allowlist. Please try again.");
      }

      // @ts-ignore
      const allowlistObjectId = filteredObjects[0].data?.objectId;
      // @ts-ignore
      const allowlistid = objects2.filter((obj) => obj.data?.content?.fields?.allowlist_id === allowlistObjectId)[0]?.data?.objectId || "";
      console.log("Allowlist Object ID:", allowlistObjectId);
      console.log("Allowlist cap:", allowlistid);
      if (!allowlistObjectId) {
        throw new Error("Failed to get allowlist object ID");
      }

      setNewAllowlistid(allowlistObjectId);

      toast.success("Allowlist Created!", {
        description: `Allowlist for "${nftName}" has been created automatically`,
        duration: 3000,
        position: "top-right",
      });

      return { allowlistObjectId, allowlistid };
    } catch (error) {
      console.error("Error creating allowlist:", error);
      throw new Error("Failed to create allowlist");
    }
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
    console.log('fetching blobs', blobs.data?.content?.fields.blobs);


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
    if (isMinting) return; // Prevent multiple simultaneous minting attempts

    setIsMinting(true);
    setMintingStep("Starting minting process...");

    try {
      // Create allowlist first and get its object ID
      setMintingStep("Creating allowlist for your NFT...");
      const { allowlistObjectId, allowlistid } = await createAllowlist(name);

      // Upload to blob with allowlist object ID
      const bob = await uploadtoblob(allowlistObjectId, allowlistid);

      // Mint NFT and upload to marketplace
      await uploadtomarketplace(bob ?? "");

      // Reset form after successful mint
      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Failed to mint NFT", {
        description: "Please try again",
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsMinting(false);
      setMintingStep("");
    }
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
    uploadedImageUrl,



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
    finalpublish();
  };

  return (
    <div className="relative">
      {/* Overlay during minting */}
      {isMinting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg text-center max-w-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Minting Your NFT</h3>
            <p className="text-sm text-muted-foreground">{mintingStep}</p>
          </div>
        </div>
      )}

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
            disabled={isMinting}
            required
          />
        </div>
        <div>
          <Label className="block font-medium mb-1">Description</Label>
          <Textarea
            className="w-full border rounded px-3 py-2 bg-muted"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isMinting}
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
              disabled={isMinting}
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
        <div className="flex items-end gap-4">      <Button
          type="button"
          onClick={handleObfuscate}
          size={"lg"}
          disabled={!image || isMinting}
        >
          {isMinting ? "Processing..." : "Obfuscate"}
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
        {/* <Input
        type="text"
        className="w-full border rounded px-3 py-2 bg-muted border-primary"
        placeholder="Enter the address you want to add to the allowlist"
        value={allowlistaddress}
        onChange={(e) => setAllowlistAddress(e.target.value)}
      />
      <Button onClick={async () => await addtoAllowlist(allowlistaddress)}>Add to Allowlist</Button> */}
        {/* Loading State Display */}
        {isMinting && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium text-foreground">Minting NFT...</p>
                <p className="text-sm text-muted-foreground">{mintingStep}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={!merkleRoot || !image || isMinting}
        >
          {isMinting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Minting...</span>
            </div>
          ) : (
            "Final Publish"
          )}
        </Button>
        {/* <Button onClick={trialfetch}>Trial fetch</Button>
        <Button onClick={async () => await createAllowlist('11')}>Trial create </Button> */}
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
    </div>
  );
};

export { MintNFTForm };
