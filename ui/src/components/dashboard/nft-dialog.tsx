"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"
import { CheckCircle, Copy, Download, Eye, Lock, Shield } from "lucide-react"
import type { NFT } from "@/lib/types"
import SHA256 from "crypto-js/sha256";
// here the decryption shall be done 
interface NFTDialogProps {
  nft: NFT | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isMarketplace?: boolean
}
import { fromHex, toHex } from '@mysten/sui/utils';
import { getAllowlistedKeyServers, SealClient, SessionKey, type SessionKeyType } from '@mysten/seal';
import { useCurrentAccount, useSignAndExecuteTransaction, useSignPersonalMessage, useSuiClientContext } from "@mysten/dapp-kit"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import { Transaction } from "@mysten/sui/transactions"
import axios from "axios"
import { toast } from "sonner"

function toUint8array(val: string) {
  const encoder = new TextEncoder();
  const encodedbytes = encoder.encode(val);
  return encodedbytes;
}
// adding the buying address to the allowlist and this person can then decrypt the data and reconstruct the image .
export function NFTDialog({ nft, open, onOpenChange, isMarketplace = true }: NFTDialogProps) {
  const [proof, setProof] = useState<string | null>(null)
  const [showProof, setShowProof] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const tx = new Transaction();
  const tx2 = new Transaction();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { client, network } = useSuiClientContext();
  const [decryptedcoords, setDecryptedCoords] = useState<any>(null);
  const [reconstructedImage, setReconstructedImage] = useState<string | null>(null);
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  const id = '0x97fad43945130f277532b7891d47a81823d7990af6795b0ec4f9364c474eefda'
  const currentaccount = useCurrentAccount();

  const allowlistobject = '0xf1d9d6e67c41ee455155d80f56d94b404395a1aa88a5a77783cfe691e9018ef9'
  const packagid = '0x576ce6f9227b55f93844988881ecb53c74c8ffcbd5e7ecf6be8624d2ebd47f25';
  const escrowpkgid = '0x076f4f1f07cc41180507a25cfaa42d57e01b93930f0c0c349d11758b5f01ff72'
  const escrowonject = '0xa07fe0d5fb6edb5a6712aeac97e587ae728697e44188038fccbba0790d8960a4'

  const sealnewclient = new SealClient({
    //@ts-ignore
    suiClient: suiClient,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({ objectId: id, weight: 1 })),
    verifyKeyServers: false,
  });
  async function fetchBlobs(): Promise<string[]> {
    const blobs = await client.getObject({
      id: id,
      options: {
        showContent: true,
        showType: true,
      }
    })
    //@ts-ignore
    console.log('fetching blobs from marketplace', blobs.data?.content?.fields.blobs);
    //@ts-ignore
    return blobs.data?.content?.fields.blobs || [];
  }
  // this will now 
  async function decoding(blobId: string): Promise<any> {
    const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
    const retrieveurl = `${AGGREGATOR}/v1/blobs/${blobId}`;
    const response2 = await axios({
      method: 'get',
      url: retrieveurl,
      responseType: 'arraybuffer'
    });



    console.log("Retrieved data:", response2.data);
    // Step 1: Convert ArrayBuffer to string
    const decoder = new TextDecoder("utf-8");
    const jsonString = decoder.decode(new Uint8Array(response2.data));

    // Step 2: Parse JSON
    const decodedPayload = JSON.parse(jsonString);
    return decodedPayload;
  }

  async function NFTfinder() {
    console.log("Finding NFT data for:", nft?.name);

    // 1. Fetch and reverse the list of blob IDs
    let blobIds;
    try {
      blobIds = await fetchBlobs();
    } catch (fetchError) {
      console.error("Error fetching blobs:", fetchError);
      return null;
    }
    const blobArray = blobIds.reverse();

    // 2. Iterate over each blob ID
    for (const blobId of blobArray) {
      let decodedData;
      try {
        decodedData = await decoding(blobId);
      } catch (decodeError) {
        // If decoding fails, log and move on to the next blobId
        console.warn(`Error decoding blob ${blobId}:`, decodeError);
        continue;
      }

      // 3. If decoded data matches the NFT name, return it immediately
      if (decodedData && decodedData.name === nft?.name) {
        console.log("Found matching NFT data:", decodedData);
        return decodedData;
      }
    }

    // 4. If no match was found
    return null;
  }


  if (!nft) return null

  // @ts-ignore
  async function reconstructImage(obfuscatedUrl: any, blocks: any, coords: any) {
    if (!Array.isArray(blocks) || !Array.isArray(coords)) {
      throw new Error("Both blocks and coords must be arrays.");
    }
    if (blocks.length !== coords.length) {
      throw new Error("blocks.length must equal coords.length");
    }

    // 1. Load the obfuscated image
    const obfImg = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // in case the URL is cross-origin
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load obfuscated image"));
      img.src = obfuscatedUrl;
    });
    // @ts-ignore
    const width = obfImg.width;
    // @ts-ignore
    const height = obfImg.height;

    // 2. Create an offscreen canvas of the same size
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to get 2D drawing context");
    }

    // 3. Draw the obfuscated image (with transparent holes) onto the canvas
    ctx.clearRect(0, 0, width, height);
    // @ts-ignore
    ctx.drawImage(obfImg, 0, 0, width, height);

    // 4. Loop over each block + coordinate, load the block, and draw it back
    for (let i = 0; i < blocks.length; i++) {
      const blockDataUrl = blocks[i];
      const { x, y } = coords[i];

      // (a) Load the block image
      const blockImg = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load block image at index ${i}`));
        img.src = blockDataUrl;
      });
      // @ts-ignore
      // (b) Assuming the block PNG is square, get its size from width
      const blockSize = blockImg.width;
      // (c) Draw that block back at (x, y)
      // @ts-ignore
      ctx.drawImage(blockImg, x, y, blockSize, blockSize);
    }

    // 5. Export the reconstructed image as a data-URL (PNG)
    return canvas.toDataURL("image/png");
  }

  const payment = async (input: string) => {
    const coin = tx2.splitCoins(tx2.gas, [75000000])
    tx2.transferObjects([coin], tx2.pure.address(input));
    const { digest } = await signAndExecuteTransaction({
      transaction: tx2,
      chain: 'sui:testnet'
    });
    console.log("payment transaction:", digest);
    return digest;
    // #TODO : add this to the escrow list 

  }
  async function fetchescrow(){
    const data = await client.getObject({
      id: escrowonject,
      options: {
        showContent: true,
        showType: true,
      }
    })
    
    //@ts-ignore
    console.log('fetching blobs from marketplace', data.data?.content?.fields?.addr);
    //@ts-ignore
    
  }
  const completepayment = async (input: string, name: string) => {
    // payment being completed 
    // const coin = tx2.splitCoins(tx2.gas, [75000000])
    // tx2.transferObjects([coin], tx2.pure.address(input));
    // const { digest } = await signAndExecuteTransaction({
    //   transaction: tx2,
    //   chain: 'sui:testnet'
    // });
    // console.log("payment transaction:", digest);
    // return digest;

    tx2.moveCall({
      target: `${escrowpkgid}::simple_registry::update_registry`,
      arguments: [
        tx2.object(escrowonject),
        tx2.pure.address(input),
        tx2.pure.string(name),
      ],
    })
    const val = await signAndExecuteTransaction({
      transaction: tx2,
      chain: 'sui:testnet'
    });
    console.log("payment transaction:", val.digest);
    return val.digest;

  }


  const handleBuy = async () => {
    const fetchedData = await NFTfinder();
    console.log("Decoded Data:", fetchedData);

    if (!fetchedData) {
      console.error("Failed to fetch NFT data");
      return;
    }

    // here we are buying
    // Here you would typically handle the actual purchase
    // const tokenid = await client.getCoins({
    //   owner: account?.address || '',
    // })

    // tx.moveCall({
    //   target: '0xe9f2dc97c3afc7ff4c42fb105eba43bebddc36ff88cf337693f00d84fd0d8595::payment::transfer_amount',
    //   arguments: [tx.object(tokenid.data?.[0].coinObjectId), tx.pure.u64(1), tx.pure.address('0x2fe3170d48e0d81e2634ae644e064e261bf36159f5733afc89c2b53f2a3600e3')],
    // })

    const payment2 = await payment(fetchedData.addres)
    toast.success("Payment to escrow successful!", {
      description: `Transaction digest: ${payment2}`,
      duration: 4000,
      position: "top-right",
      action: {
        label: "SuiScan",
        onClick: () => window.open(`https://suiscan.xyz/testnet/tx/${payment2}`, '_blank')
      },
    });




    // console.log("Transaction executed with digest:", digest);
    // now the logic for decryption shall come here . 
    // the user would have to be manually added to the allowlist by the owner of the NFT
    const allowbytes = fromHex(allowlistobject);
    const nonce = Uint8Array.from([1, 2, 3, 4, 5]);
    const encryptionid = toHex(new Uint8Array([...allowbytes, ...nonce]))
    // const string = 'blobidheregn';
    // const fileData = toUint8array(string);
    // const { encryptedObject: encryptedBytes } = await sealnewclient.encrypt({
    //   threshold: 2,
    //   packageId: packagid,
    //   id: encryptionid,
    //   data: fileData,
    // });

    // console.log("Encrypted bytes:", encryptedBytes);
    const SUI_NETWORK = "testnet";
    console.log(currentaccount?.address,);

    const session_key = await SessionKey.create({
      address: currentaccount?.address || '',
      packageId: packagid,
      ttlMin: 20,
      suiClient: new SuiClient({ url: getFullnodeUrl(SUI_NETWORK) }),
    })



    const message = session_key.getPersonalMessage()
    const signResult = await new Promise((resolve, reject) => {
      signPersonalMessage(
        { message: message },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        }
      );
    });


    //@ts-ignore
    console.log("Sign result:", signResult.signature);
    // @ts-ignore
    await session_key.setPersonalMessageSignature(signResult.signature)
    tx.moveCall({
      target: `${packagid}::allowlist::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(encryptionid)),
        tx.object(allowlistobject)
      ],
    });
    console.log(fetchedData.enccoords);

    const len = Object.keys(fetchedData.enccoords).length;
    const uint8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8[i] = fetchedData.enccoords[i];
    }
    const txbytes = await tx.build({ client, onlyTransactionKind: true })

    try {
      const decrypteddata = await sealnewclient.decrypt({
        data: uint8,
        sessionKey: session_key,
        txBytes: txbytes,

      });
      toast.success("Decryption successful!", {
        description: "The image has been successfully decrypted.",
        duration: 4000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Decryption failed!", {
        description: "No Access error,user does not have one or more keys",
        duration: 4000,
        position: "top-right",
      });
    }
    const decrypteddata = await sealnewclient.decrypt({
      data: uint8,
      sessionKey: session_key,
      txBytes: txbytes,

    });

    if (decrypteddata) {
      toast.success("Decryption successful!", {
        description: "The image has been successfully decrypted.",
        duration: 4000,
        position: "top-right",
      });
    }
    else {
      toast.error("Decryption failed!", {
        description: "No Access error,user does not have one or more keys",
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    console.log("Decrypted data:", decrypteddata);
    let string2 = new TextDecoder().decode(decrypteddata);
    console.log("Decrypted string:", string2);
    const parsedCoords = JSON.parse(string2);
    setDecryptedCoords(parsedCoords);

    if (merklerootverification(nft.merkleroot, parsedCoords)) {
      const blocks = fetchedData.blocks;
      const obfuscatedUrl = fetchedData.obfuscatedImage;

      // Verify that blocks and coordinates are valid arrays
      if (Array.isArray(blocks) && Array.isArray(parsedCoords)) {
        console.log("Starting image reconstruction with:", {
          blockCount: blocks.length,
          coordCount: parsedCoords.length
        });

        const imageResult = await reconstructImage(obfuscatedUrl, blocks, parsedCoords);
        setReconstructedImage(imageResult);
        console.log("Image reconstructed successfully!");
        toast.success("Image reconstructed successfully!", {
          description: "The image has been successfully reconstructed.",
          duration: 5000,
          position: "top-left",
        });




      } else {
        console.error("Invalid data for reconstruction:", {
          blocksIsArray: Array.isArray(blocks),
          coordsIsArray: Array.isArray(parsedCoords),
          blocks: blocks,
          coords: parsedCoords
        });
        toast.error("Invalid data for image reconstruction!", {
          description: "The blocks or coordinates data is not in the expected format.",
          duration: 1000,
          position: "top-left",
        });

      }
    }

  }

  const copyProof = () => {
    if (nft.proof || proof) {
      navigator.clipboard.writeText(nft.proof || proof || "")
    }
  }

  const downloadReconstructedImage = () => {
    if (!reconstructedImage) {
      toast.error("No reconstructed image available", {
        description: "Please decrypt the NFT first to download the image.",
        duration: 3000,
        position: "top-right",
      });
      return;
    }

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.download = `${nft.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reconstructed.png`;
      link.href = reconstructedImage;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Image downloaded successfully!", {
        description: `${nft.name} has been saved to your device.`,
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Download failed", {
        description: "There was an error downloading the image. Please try again.",
        duration: 3000,
        position: "top-right",
      });
    }
  }

  function buildNextLevel(hashes: string[]) {
    const nextLevel = [];

    for (let i = 0; i < hashes.length; i += 2) {
      // If there’s a “pair” (i and i+1), hash them together.
      // If the last element is alone (odd count), duplicate it.
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : hashes[i];

      // Concatenate the two hex strings and SHA256() them:
      // (Note: concatenating hex strings directly is fine as long as
      //  you consistently do it this way on both ends.)
      const concatenatedHex = left + right;
      const parentHash = SHA256(concatenatedHex).toString();

      nextLevel.push(parentHash);
    }

    return nextLevel;
  }

  /**
   * Compute Merkle root from an array of leaf‐hashes.
   * @param {string[]} leafHashes — Array of hex hashes at the leaf level
   * @returns {string}            — Single hex string = Merkle root
   */
  function computeMerkleRoot(leafHashes: string[]) {
    if (leafHashes.length === 0) {
      throw new Error('Need at least one leaf to compute a Merkle root');
    }

    let currentLevel = leafHashes.slice(); // copy the array

    // Keep building up until we end up with just one hash
    while (currentLevel.length > 1) {
      currentLevel = buildNextLevel(currentLevel);
    }

    return currentLevel[0];
  }
  function merklerootverification(merkleroot: string, coords: { x: number, y: number }[]): boolean {
    const leaves = [];
    for (let i = 0; i < coords.length; i++) {
      const { x, y } = coords[i];
      if (x === undefined || y === undefined) {
        throw new Error('Invalid coordinate: both x and y are required');
      }
      const coordString = `${x},${y}`;              // e.g. "1,2"
      const leafHash = SHA256(coordString).toString(); // hex of SHA256
      console.log(`Leaf ${i}: SHA256("${coordString}") = ${leafHash}`);
      leaves.push(leafHash);
    }
    if (merkleroot == computeMerkleRoot(leaves)) {
      console.log(`Merkle root: ${merkleroot}`);
      console.log("Merkle root verification successful!");
      return true;
    }
    else {
      console.log("Merkle root verification failed!");
      return false;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{nft.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border">
              {reconstructedImage ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img src={reconstructedImage} alt={`${nft.name} (Reconstructed)`} className="object-cover w-full" />
                  <div className="absolute top-3 left-3">
                    <div className="flex items-center gap-2 bg-background/90 rounded-full px-3 py-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">Decrypted</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Button
                      onClick={downloadReconstructedImage}
                      size="sm"
                      className="bg-background/90 hover:bg-background text-foreground rounded-full h-8 w-8 p-0"
                      title="Download reconstructed image"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <img src={nft.image} alt={nft.name} className="object-cover" />
                  {nft.isObfuscated && (
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-2 bg-background/90 rounded-full px-3 py-1">
                        <Lock className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary font-medium">Encrypted</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Price</span>
                {/* <Badge variant="secondary">{nft.rarity}</Badge> */}
              </div>
              <div className="text-3xl font-bold text-primary">{nft.metadata.price} SUI</div>
            </div>

            <Separator />

            {reconstructedImage && (
              <div className="space-y-2">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Options
                </h4>
                <Button
                  onClick={downloadReconstructedImage}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Reconstructed Image
                </Button>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{nft.metadata.description}</p>
            </div>
            {/* 
            {nft.revealConditions && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Reveal Conditions
                </h4>
                <p className="text-sm text-muted-foreground">{nft.revealConditions}</p>
              </div>
            )} */}

            {!isMarketplace && nft.proof && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ownership Proof
                </h4>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono break-all">
                      {nft.proof.slice(0, 20)}...{nft.proof.slice(-20)}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyProof} className="ml-2">
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isMarketplace && (
              <div className="space-y-4">
                {showProof && proof && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>Verification successful! Proof generated:</p>
                        <div className="bg-muted rounded p-2">
                          <code className="text-xs font-mono break-all">
                            {proof.slice(0, 20)}...{proof.slice(-20)}
                          </code>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">


                  {isMarketplace && <Button onClick={handleBuy} className="w-full">
                    {isBuying ? "Processing..." : `Pay to escrow ${nft.metadata.price/2} SUI`}
                  </Button>}
                  <Button className='w-full' onClick={async () => await completepayment(account?.address || '0xb9fedd0c0027963e53e7b0ba00d56034bfacea29f06a0adb8cbeddf83b61eaca', nft.name)}>Complete payment</Button>
                  {/* <Button onClick={async () => await fetchescrow()}>Fetch Escrow</Button> */}
                </div>

              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
