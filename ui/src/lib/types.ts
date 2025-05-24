export interface NFT {
  id: string;
  name: string;
  creator: string;
  metadata: {
    description: string;
    price: number;
  };
  merkleroot: string;
  image: string;
  isObfuscated?: string;
  proof?: string;
}
