
module nftverifier::testv;



    // blobblobstores the blob-ID's to display them on the market place
    // Public market Place code

    use std::string;
    use std::vector::{push_back, empty};
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    public struct Blobstore has key, store {
        id: UID,
        blobs: vector<string::String>,
    }

    // Initialize and share the Blobstore
    fun init(ctx: &mut TxContext) {
        let blobstore = Blobstore {
            id: object::new(ctx),
            blobs: empty()
        };
        transfer::share_object(blobstore);
    }

    // Create a new blobstore (if you need multiple instances)
    public fun create_blobstore(ctx: &mut TxContext): Blobstore {
        Blobstore {
            id: object::new(ctx),
            blobs: empty()
        }
    }

    // Add a blob ID to the blobstore
    public fun add_blob(registry: &mut Blobstore, new_blob: vector<u8>) {
        push_back<string::String>(&mut registry.blobs, string::utf8(new_blob));
    }

    // Get all blob IDs from the blobstore
    public fun get_blobs(registry: &Blobstore): vector<string::String> {
        registry.blobs
    }

    // Get the number of blobs
    public fun get_blob_count(registry: &Blobstore): u64 {
        std::vector::length(&registry.blobs)
    }

