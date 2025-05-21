/*
/// Module: nftverifier
module nftverifier::nftverifier;
*/

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions


module nftverifier::zkverifier;
use sui::groth16;
use std::string;


public fun groth16_verifier(pvk : string::String , 
    proof : string::String , 
    public_inputs : string::String 
){
	let pvkey = groth16::prepare_verifying_key(&groth16::bn254(),&pvk.into_bytes());
	let proof_points = groth16::proof_points_from_bytes(proof.into_bytes());
	let public_input_values = groth16::public_proof_inputs_from_bytes(public_inputs.into_bytes());
	// These three construct the variables requiret for the final function
	assert!(groth16::verify_groth16_proof(&groth16::bn254(), &pvkey,&public_input_values,&proof_points))

}