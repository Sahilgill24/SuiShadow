module nftverifier::store;
    // stores the blob-ID's to display them on the market place
    // Public market Place code

    use std::string;
    use std::vector::{push_back, empty};
    use sui::object::{Self, UID};
    use sui::tx_context::TxContext;
    use sui::transfer;

    public struct Marketplace has key, store {
        id: UID,
        blobs: vector<string::String>,
    }

    // Initialize and share the marketplace
    fun init(ctx: &mut TxContext) {
        let marketplace = Marketplace {
            id: object::new(ctx),
            blobs: empty()
        };
        transfer::share_object(marketplace);
    }

    // Create a new marketplace (if you need multiple instances)
    public fun create_marketplace(ctx: &mut TxContext): Marketplace {
        Marketplace {
            id: object::new(ctx),
            blobs: empty()
        }
    }

    // Add a blob ID to the marketplace
    public fun add_blob(registry: &mut Marketplace, new_blob: string::String) {
        push_back<string::String>(&mut registry.blobs, new_blob);
    }

    // Get all blob IDs from the marketplace
    public fun get_blobs(registry: &Marketplace): &vector<string::String> {
        &registry.blobs
    }

    // Get the number of blobs
    public fun get_blob_count(registry: &Marketplace): u64 {
        std::vector::length(&registry.blobs)
    }
