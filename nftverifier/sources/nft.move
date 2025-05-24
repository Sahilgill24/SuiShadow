/// This is the code for the NFT 
module nftverifier::nft;
use std::string;
use sui::event;
use sui::sui::SUI;
use sui::url::{Self,Url};
use sui::dynamic_field as df;
use nftverifier::utils::is_prefix;
// this will be used to buy the NFT 

const EInvalidCap: u64 = 0;
const ENoAccess: u64 = 1;
const EDuplicate: u64 = 2;
const MARKER: u64 = 3;

/// An example NFT that can be minted by anybody
public struct NFT has key, store {
		id: UID,
		/// Name for the token
		name: string::String,
		/// metadata of the token
		metadata: string::String,
		/// URL for the token
		/// aka obfuscated image
		url: Url,
		/// Merkle Root of the merkle tree
		/// formed using the coordinated
		/// of the Obfuscated image .
		merkleroot: string::String,
		blobId: string::String,
		

}


public struct NFTMinted has copy, drop {
		// The Object ID of the NFT
		object_id: ID,
		// The creator of the NFT
		creator: address,
		// The name of the NFT
		name: string::String,
}

// ===== Public view functions =====

/// Get the NFT's name
public fun name(nft: &NFT): &string::String {
		&nft.name
}

/// Get the NFT's `metadata`
/// the price and description will be stored here
public fun metadata(nft: &NFT): &string::String {
		&nft.metadata
}

public fun blobId(nft : &NFT) : &string::String {
	&nft.blobId
}
/// Get the NFT's `url`
/// Not a public function as this would result in the photo
/// it has to be a private function
public fun url(nft: &NFT): &Url {
		&nft.url
}

// ===== Entrypoints =====

#[allow(lint(self_transfer))]
/// Create a new devnet_nft
public fun mint_to_sender(
		name: vector<u8>,
		metadata: vector<u8>,
		url: vector<u8>,	
		merkleroot: vector<u8>,
		blobId: vector<u8>,
		ctx: &mut TxContext,

) {
		let sender = ctx.sender();
		let nft = NFT {
				id: object::new(ctx),
				name: string::utf8(name),
				metadata: string::utf8(metadata),
				url: url::new_unsafe_from_bytes(url) ,
				merkleroot: string::utf8(merkleroot),
				blobId : string::utf8(blobId),


		};

		event::emit(NFTMinted {
				object_id: object::id(&nft),
				creator: sender,
				name: nft.name,
		});

		transfer::public_transfer(nft, sender);
}

/// Transfer `nft` to `recipient`
public fun transfer(nft: NFT, recipient: address, _: &mut TxContext) {
		transfer::public_transfer(nft, recipient)
}

/// Update the `description` of `nft` to `new_description`
public fun update_metadata(
		nft: &mut NFT,
		new_metadata: vector<u8>,
		_: &mut TxContext,
) {
		nft.metadata = string::utf8(new_metadata)
}

/// Permanently delete `nft`
public fun burn(nft: NFT, _: &mut TxContext) {
		let NFT { id, name: _, metadata: _, url: _ ,merkleroot: _, blobId: _} = nft;
		id.delete()
}