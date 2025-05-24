<center>
<h1> SUI Shadow </h1>

<img src="./readmeimages/shadow-logo.png" size=600*600>
</center>

> Sui Shadow is an innovative, privacy-first art platform built on the SUI blockchain, where artists encrypt their work into hidden tiles and mint suspense-filled NFTs. Powered by Key encryption security from Sui `Seal`, each artwork’s AES key is securely generated and released only to legitimate buyers. All encrypted chunks live off-chain in `Walrus`, keeping gas costs minimal and storage unlimited. The artists idendity is verified using `zklogin` as the log-in option on the app . Perfect for creators who want to monetize secret reveals and collectors craving exclusive digital treasures, Sui Shadow turns every purchase into a thrilling unmasking experience backed by robust blockchain security.

---

## Table of Contents

1. [Introduction](#introduction)  
2. [User Flow](#user-flow)  
3. [Architecture](#architecture)  
4. [Challenges](#challenges)  
5. [Future](#future)

---

## Introduction

**Sui Shadow** is a NFT marketplace on the Sui blockchain where artists can sell “hidden” or **obfuscated** images. Instead of minting a clear‐text PNG on-chain, this project which can be stolen or used to mint NFT's by other people:

1. Splits an image into multiple blocks/tiles (we are using 4 blocks of 1/10th the images dimensions)  
2. AES‐encrypts each block with a symmetric key managed by a Sui key‐server contract (leveraging Sui Seal).  
3. Builds a Merkle tree over the ciphertexts to guarantee integrity. (we are using SHA-256 to build the merkleroot)
4. Stores all encrypted blocks off‐chain in Walrus . (the coordinates as well as the removed blocks are encrypted and stored) 
5. Mints an NFT whose on‐chain metadata holds:
   - A **Merkle root** (32 bytes)  
   - A **Walrus blob ID** (blobID)  

When a buyer pays the seller in SUI, the payment is verified and the key-server shares the AES symmetric key to the buyer (encrypted to their wallet), and the front end fetches ciphertexts from Walrus, verifies Merkle proofs, decrypts the blocks, and reassembles the original image—all on the client side.

By shifting bulk storage and computation off‐chain, while keeping a tamper‐proof Merkle root on‐chain, we ensure:

- **Authenticity**: No one can swap or alter encrypted blocks without invalidating the Merkle root.  
- **Efficiency**: On‐chain gas fees only cover a 32‐byte root and a string blob ID.  
- **Privacy/Exclusivity**: Until purchase, viewers only see a blacked‐out or watermarked preview.  

---

## User Flow

Below is the high‐level sequence of steps for each participant (Seller, Marketplace, Buyer).

<img src="./readmeimages/homepage.png" caption="Home Page">

### 1. Seller Registration and Upload

1. **zkLogin / Wallet Connect**  
   - Seller logs in with Sui’s `zkLogin` (zero‐knowledge identity) using their preferable oauth (we currently added google as the oauth) Their wallet address is now linked to a verifiable Sui account.


2. **Image Obfuscation**  
   - Seller picks an image (e.g., a high‐resolution JPEG/PNG).  
   - The front‐end/UI tool automatically “blacks out” or “pixelates” selected regions (e.g., tiles). These obfuscated tiles become placeholders for encrypted blocks.  
   - Optionally: A low‐resolution preview or watermarked version is generated for marketplace browsing.

3. **AES Key Derivation**  
   - Front end requests a fresh AES key from the **Key‐Server Contract**, which uses Sui Seal to generate a secure, random 256-bit symmetric key.  
   - This key is kept off‐chain within a secure enclave (the contract), never exposed publicly.

4. **Block Encryption & Merkle Construction**  
   - The image is divided into \(N\) tiles (e.g., 16×16 grid = 256 blocks).  
   - Each tile (raw pixel‐data) is AES‐encrypted (e.g., `AES‐GCM`) using the derived symmetric key.  
   - All ciphertexts are collected, their SHA-256 hashes become the leaves of a binary Merkle tree.  
   - A single 32-byte **Merkle root** is computed.

5. **Upload to Walrus & Mint**  
   - Upload the array of \(N\) ciphertexts (plus any coordinate metadata) to Walrus. Walrus returns a **blob ID** (CID).  
   - Call `mint_to_sender(bloblast_id: String, merkle_root: [u8;32])` on the Sui NFT contract:
     - An NFT object is created with immutable fields:
       - `blob_id` (e.g., “bafy…”)  
       - `merkle_root` (32-byte)
       - (Optionally) `preview_url` or `preview_hash` for a low-res thumbnail.  
   - Seller now has a “Shadow NFT” in their Sui wallet. This NFT shows a blacked-out image or a watermarked preview in UIs that support the metadata.

<img src="./readmeimages/image copy.png" >
---

### 2. Marketplace Browsing & Purchase

1. **Marketplace Listing**  
   - A Sui‐compatible marketplace (e.g., a custom UI or a generic NFT marketplace) queries NFT metadata. It sees:
     - The **blob_id** (Walrus CID).  
     - The **merkle_root** (on‐chain).  
     - A small “blacked‐out preview PNG” or a thumbnail link.  
   - Marketplaces display a “locked” or “blacked-out” preview (buyers can see “this is a Shadow NFT”).  

2. **Buyer Initiates Purchase**  
   - Buyer connects their Sui wallet + zkLogin.  
   - Buyer clicks “Buy Now” in the marketplace UI → a `buy_and_reveal` transaction is submitted:
     1. Transfers the agreed price (in SUI) from Buyer → Seller.  
     2. Calls the **Key‐Server Contract**’s `request_key(nft_id, buyer_address)` method.  
     3. Key‐Server verifies:
        - Buyer has transferred the correct amount to Seller (or the marketplace escrow).  
        - The NFT ID is valid.  
        - The contract has not yet released a key for this buyer+NFT pair.  
     4. Key‐Server encrypts the AES key under the Buyer’s public key (Sui address) and stores a short “release record” associating `(nft_id, buyer_address) → key_ciphertext`.  
     5. The NFT is transferred from Seller → Buyer.

3. **Key Delivery & Image Reconstruction**  
   - Front end listens for the `KeyReleased` event (emitted by Key‐Server) or calls a read API: `get_key_ciphertext(nft_id, buyer_address)`.  
   - Once the encrypted key is fetched, Buyer’s front end uses their wallet’s private key to **decrypt** the AES key.  
   - Buyer’s front end:
     1. Uses `blob_id` to fetch the array of ciphertext blocks from Walrus.  
     2. For each block:
        - Recomputes `leaf_hash = SHA256(ciphertext)`.  
        - Verifies the Merkle proof against the on‐chain `merkle_root` (also fetched from NFT object).  
     3. After all proofs pass, runs AES‐GCM decrypt on each ciphertext block using the decrypted AES key and the stored IVs/tags.  
     4. Puts the plaintext tiles back into their original coordinates → reassembles the full image in memory or canvas.  
   - Buyer is shown the fully‐revealed, high‐resolution image. They can download it or view it on‐chain.


<img src="./readmeimages/image copy 3.png"></img>
---

## Architecture

<img src="./readmeimages/image.png"></img>

The system is divided into four logical layers:

<!-- ───────────────────────────────────────────────────────────────────────────── -->


### Key Components

1. **Client / UI**  
   - **Seller UI**:  
     - Image obfuscation (black‐out or pixelation).  
     - AES‐encrypt blocks + call backend to compute Merkle tree.  
     - Initiate `mint_to_sender(blob_id, merkle_root)`.  
   - **Buyer UI**:  
     - Display “locked” preview.  
     - Trigger `buy_and_reveal` transaction.  
     - Fetch encrypted key via Key‐Server, fetch ciphertexts from Walrus, verify Merkle proofs, decrypt, and render complete image.

2. **Off‐Chain Backend**  
   - A lightweight Node.js (or Rust/Python) service that:  
     - Splits image into an \(M \times N\) grid of tiles.  
     - Generates a new AES symmetric key (requesting it from Key‐Server or generating locally and registering it on-chain).  
     - Encrypts each tile with AES‐GCM (storing IV + ciphertext + tag).  
     - Computes SHA-256 hashes of each ciphertext (leaf nodes).  
     - Builds a binary Merkle tree, storing all intermediate nodes and yielding a single 32-byte root.  
     - Uploads all ciphertexts as a single JSON/Binary array to Walrus → obtains a CID.  
     - Returns `(blob_id, merkle_root)` to the front end for minting.

3. **On‐Chain Contracts (Sui)**  
   - **NFT Module**  
     - Standard Sui‐NFT blueprint, extended with two custom fields:  
       - `blob_id: String`  
       - `merkle_root: vector<u8>` (32 bytes)  
     - `mint_to_sender(recipient: address, blob_id: String, merkle_root: vector<u8>)`:  
       - Mints an NFT object, initializes those two fields + standard metadata (name, description, maybe `preview_hash`).  
   - **Key‐Server Module**  
     - Uses `Sui::seal()` to generate nondeterministic randomness on mainnet.  
     - Derives a 256-bit AES key (`key_bytes`) and securely stores it in the object’s state.  
     - `request_key(nft_id: UID, buyer_addr: address)` (entry):  
       1. Checks that `buyer_addr` transferred the required SUI amount to the seller’s address (or marketplace escrow).  
       2. Looks up the symmetric key for `nft_id`.  
       3. Encrypts `key_bytes` under `buyer_addr`’s public key (Sui’s Ed25519).  
       4. Emits event `KeyReleased(nft_id, buyer_addr, encrypted_key_blob)`.  
       5. Stores a record `(nft_id, buyer_addr) → encrypted_key_blob` for later retrieval.  
     - `get_key_ciphertext(nft_id: UID, buyer_addr: address): vector<u8>` (read):  
       - Returns the previously stored encrypted AES key for on‐chain clients or off‐chain listeners.

4. **Off‐Chain Storage (Walrus / IPFS)**  
   - All encrypted image blocks are uploaded as a single, pinned JSON or binary blob.  
   - Walrus returns a content‐addressed CID (`blob_id`).  
   - Because it’s pinned, it remains available indefinitely (or until the NFT is burned).  
   - Buyers fetch by doing an HTTP GET to `https://walrus.sui.io/{blob_id}` (or using an IPFS gateway).

---

## Challenges

Building a “pay‐to‐reveal” NFT system involved tackling several nontrivial hurdles:

1. **Secure Key Management**  
   Implementing key management with Sui’s Seal was a steep learning curve, as it was my first time leveraging on-chain randomness for AES key generation. Figuring out how to call `Sui::seal()` correctly, securely store the derived key, and only release it to authorized buyers required careful study of Sui’s documentation and iterative testing to avoid leaks or misuse.

2. **Merkle Tree Integrity**  
   Integrating a Merkle tree on the front end proved challenging because very few JavaScript libraries support full Merkle proof construction and verification in-browser. To ensure every encrypted tile could be verified against the on-chain root, I ended up writing a custom Merkle implementation—manually handling leaf hashing, proof generation, and root comparison—so that buyers’ browsers could independently confirm data integrity before decryption.

3. **Freemium / Preview Experience**  
   Striking a balance between hiding most of the artwork and showing enough for a convincing preview was tricky. Since users can’t see the full image before purchase, they can’t fully judge its quality or appeal. I had to experiment with which pixels or regions to leave unobfuscated (so the preview remains recognizable) while still encrypting the critical coordinates. Ensuring that those preview tiles didn’t compromise the encrypted data required careful block selection and coordinate extraction so that the hidden portions stayed secure yet enticing.  

---

## Conclusion

Sui Shadow demonstrates how to build a modern, privacy‐preserving, “pay‐to‐reveal” NFT system on the Sui blockchain. By combining:

- **zkLogin** for wallet‐based identity  
- **AES encryption + Sui Seal** for secret key management  
- **Merkle proofs** for off‐chain integrity  
- **Walrus storage** for large blobs  

we enable artists to sell exclusive, high‐value artwork without ever storing the full image on‐chain. Buyers can trust that the artwork they pay for is genuine, remains verifiable, and gets securely revealed only upon purchase.

Feel free to explore the contracts under `nftverifier/` and the front‐end under `ui/`. Pull requests, bug reports, and new feature proposals are very welcome!

---

