
/// Can be used for generating keys for AES encryption 
/// of the coordinates of the obfuscateed parts
module nftverifier::keyserver;

use sui::table::{Self, Table};
use sui::event;

const ENoAccess: u64 = 77;
const ENotOwner: u64 = 78;
const EAlreadyShared: u64 = 79;
const ENotShared: u64 = 80;

/// Event emitted when a key is shared with an address
public struct KeyShared has copy, drop {
    key_id: vector<u8>,
    owner: address,
    shared_with: address,
}

/// Event emitted when key access is revoked
public struct KeyRevoked has copy, drop {
    key_id: vector<u8>,
    owner: address,
    revoked_from: address,
}

/// Main data structure that holds encrypted data
public struct PrivateData has key, store {
    id: UID,
    creator: address,
    nonce: vector<u8>,
    data: vector<u8>,
}

/// Key server that manages access permissions
public struct KeyServer has key {
    id: UID,
    /// Maps key_id -> Table of (address -> bool) for access control
    access_control: Table<vector<u8>, Table<address, bool>>,
    /// Maps key_id -> owner address
    key_owners: Table<vector<u8>, address>,
}

/// Initialize a new key server
fun init(ctx: &mut TxContext) {
    transfer::share_object(KeyServer {
        id: object::new(ctx),
        access_control: table::new(ctx),
        key_owners: table::new(ctx),
    });
}

/// The encryption key id is [pkg id][creator address][random nonce]
fun compute_key_id(sender: address, nonce: vector<u8>): vector<u8> {
    let mut blob = sender.to_bytes();
    blob.append(nonce);
    blob
}

/// Store encrypted data and register the key in the key server
public fun store_with_key_server(
    nonce: vector<u8>, 
    data: vector<u8>, 
    key_server: &mut KeyServer,
    ctx: &mut TxContext
): PrivateData {
    let key_id = compute_key_id(ctx.sender(), nonce);
    
    // Register the key owner in the key server
    if (!key_server.key_owners.contains(key_id)) {
        key_server.key_owners.add(key_id, ctx.sender());
        // Initialize access control table for this key
        key_server.access_control.add(key_id, table::new(ctx));
    };
    
    PrivateData {
        id: object::new(ctx),
        creator: ctx.sender(),
        nonce,
        data,
    }
}

/// Share a key with another address
public fun share_key(
    key_server: &mut KeyServer,
    nonce: vector<u8>,
    recipient: address,
    ctx: &TxContext
) {
    let key_id = compute_key_id(ctx.sender(), nonce);
    
    // Check if the key exists and sender is the owner
    assert!(key_server.key_owners.contains(key_id), ENoAccess);
    let owner = key_server.key_owners.borrow(key_id);
    assert!(*owner == ctx.sender(), ENotOwner);
    
    // Get or create access control table for this key
    let access_table = key_server.access_control.borrow_mut(key_id);
    
    // Check if already shared
    assert!(!access_table.contains(recipient), EAlreadyShared);
    
    // Add access permission
    access_table.add(recipient, true);
    
    // Emit event
    event::emit(KeyShared {
        key_id,
        owner: ctx.sender(),
        shared_with: recipient,
    });
}

/// Revoke key access from an address
public fun revoke_key_access(
    key_server: &mut KeyServer,
    nonce: vector<u8>,
    target: address,
    ctx: &TxContext
) {
    let key_id = compute_key_id(ctx.sender(), nonce);
    
    // Check if the key exists and sender is the owner
    assert!(key_server.key_owners.contains(key_id), ENoAccess);
    let owner = key_server.key_owners.borrow(key_id);
    assert!(*owner == ctx.sender(), ENotOwner);
    
    // Get access control table for this key
    let access_table = key_server.access_control.borrow_mut(key_id);
    
    // Check if access was granted
    assert!(access_table.contains(target), ENotShared);
    
    // Remove access permission
    access_table.remove(target);
    
    // Emit event
    event::emit(KeyRevoked {
        key_id,
        owner: ctx.sender(),
        revoked_from: target,
    });
}

/// Check if an address has access to a key
public fun has_key_access(
    key_server: &KeyServer,
    key_id: vector<u8>,
    accessor: address
): bool {
    // Check if key exists
    if (!key_server.key_owners.contains(key_id)) {
        return false
    };
    
    // Owner always has access
    let owner = key_server.key_owners.borrow(key_id);
    if (*owner == accessor) {
        return true
    };
    
    // Check if explicitly shared
    let access_table = key_server.access_control.borrow(key_id);
    access_table.contains(accessor)
}

/// Get the key_id for decryption (only if caller has access)
public fun get_key_id_for_decryption(
    key_server: &KeyServer,
    data: &PrivateData,
    ctx: &TxContext
): vector<u8> {
    let key_id = compute_key_id(data.creator, data.nonce);
    assert!(has_key_access(key_server, key_id, ctx.sender()), ENoAccess);
    key_id
}

/// Access control check for seal operations
fun check_policy(key_server: &KeyServer, id: vector<u8>, e: &PrivateData, ctx: &TxContext): bool {
    let key_id = compute_key_id(e.creator, e.nonce);
    key_id == id && has_key_access(key_server, key_id, ctx.sender())
}

/// Entry function to store encrypted data
entry fun store_entry(
    nonce: vector<u8>, 
    data: vector<u8>, 
    key_server: &mut KeyServer,
    ctx: &mut TxContext
) {
    let private_data = store_with_key_server(nonce, data, key_server, ctx);
    transfer::transfer(private_data, ctx.sender());
}

/// Entry function to share a key
entry fun share_key_entry(
    key_server: &mut KeyServer,
    nonce: vector<u8>,
    recipient: address,
    ctx: &TxContext
) {
    share_key(key_server, nonce, recipient, ctx);
}

/// Entry function to revoke key access
entry fun revoke_key_access_entry(
    key_server: &mut KeyServer,
    nonce: vector<u8>,
    target: address,
    ctx: &TxContext
) {
    revoke_key_access(key_server, nonce, target, ctx);
}

/// Seal approval with key server access control
entry fun seal_approve(
    key_server: &KeyServer,
    id: vector<u8>, 
    e: &PrivateData,
    ctx: &TxContext
) {
    assert!(check_policy(key_server, id, e, ctx), ENoAccess);
}

/// Get list of addresses that have access to a key (for the owner)
public fun get_shared_addresses(
    key_server: &KeyServer,
    nonce: vector<u8>,
    ctx: &TxContext
): vector<address> {
    let key_id = compute_key_id(ctx.sender(), nonce);
    
    // Check if the key exists and sender is the owner
    assert!(key_server.key_owners.contains(key_id), ENoAccess);
    let owner = key_server.key_owners.borrow(key_id);
    assert!(*owner == ctx.sender(), ENotOwner);
    
    // Note: In a real implementation, you'd need to iterate through the table
    // This is a placeholder as Sui's Table doesn't have iterator methods
    // You might want to maintain a separate vector of shared addresses
    vector::empty<address>()
}

#[test_only]
public fun destroy_private_data(e: PrivateData) {
    let PrivateData { id, .. } = e;
    object::delete(id);
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext): KeyServer {
    KeyServer {
        id: object::new(ctx),
        access_control: table::new(ctx),
        key_owners: table::new(ctx),
    }
}

#[test]
fun test_key_sharing() {
    let ctx = &mut tx_context::dummy();
    let mut key_server = init_for_testing(ctx);
    
    // Store some data
    let private_data = store_with_key_server(b"test_nonce", b"secret_data", &mut key_server, ctx);
    let key_id = compute_key_id(@0x0, b"test_nonce");
    
    // Owner should have access
    assert!(has_key_access(&key_server, key_id, @0x0), 0);
    
    // Random address should not have access
    assert!(!has_key_access(&key_server, key_id, @0x123), 0);
    
    // Share key with another address
    share_key(&mut key_server, b"test_nonce", @0x123, ctx);
    
    // Now the shared address should have access
    assert!(has_key_access(&key_server, key_id, @0x123), 0);
    
    // Revoke access
    revoke_key_access(&mut key_server, b"test_nonce", @0x123, ctx);
    
    // Access should be revoked
    assert!(!has_key_access(&key_server, key_id, @0x123), 0);
    
    private_data.destroy_private_data();
    let KeyServer { id, access_control, key_owners } = key_server;
    object::delete(id);
    access_control.destroy_empty();
    key_owners.destroy_empty();
}