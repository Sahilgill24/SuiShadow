

module nftverifier::zkverifier;
use sui::groth16;
use sui::hex;
use std::string;



public fun groth16_verifier(pvk :vector<u8> , 
    proof : vector<u8> , 
    public_inputs : vector<u8> 
){
	let pvkey = groth16::prepare_verifying_key(&groth16::bn254(),&pvk);
	let proof_points = groth16::proof_points_from_bytes(proof);
	let public_input_values = groth16::public_proof_inputs_from_bytes(public_inputs);
	// These three construct the variables requiret for the final function
	assert!(groth16::verify_groth16_proof(&groth16::bn254(), &pvkey,&public_input_values,&proof_points))

}