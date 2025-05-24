import type { NFT } from "./types";

export const marketplaceNFTs: NFT[] = [
  {
    id: "1",
    name: "Obfuscated Ape #1337",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description:
        "A mysterious ape with hidden features waiting to be revealed.",
      price: 2.5,
    },
    merkleroot:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
  {
    id: "2",
    name: "Shadow Punk #0042",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "A cyberpunk character with encrypted accessories.",
      price: 1.8,
    },
    merkleroot:
      "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
  {
    id: "3",
    name: "Encrypted Dragon #777",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description:
        "A legendary dragon with hidden powers and encrypted flames.",
      price: 5.2,
    },
    merkleroot:
      "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
  {
    id: "4",
    name: "Mystery Box #001",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "A mystery box containing unknown digital treasures.",
      price: 0.5,
    },
    merkleroot:
      "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
  {
    id: "5",
    name: "Time Capsule #2024",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description:
        "A time capsule that will reveal its contents in the future.",
      price: 3.1,
    },
    merkleroot:
      "0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
  {
    id: "6",
    name: "Cipher Cat #999",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "A cute cat with encrypted patterns and hidden messages.",
      price: 1.2,
    },
    merkleroot:
      "0x6789012345abcdef6789012345abcdef6789012345abcdef6789012345abcdef",
    image: "/monkey.jpg",
    isObfuscated: "true",
  },
];

export const myNFTs: NFT[] = [
  {
    id: "owned-1",
    name: "Revealed Ape #1234",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "A fully revealed ape with all features visible.",
      price: 2.0,
    },
    merkleroot:
      "0x7890123456abcdef7890123456abcdef7890123456abcdef7890123456abcdef",
    image: "/monkey.jpg",

  },
  {
    id: "owned-2",
    name: "My Shadow Punk #0001",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "Your personal shadow punk with unique traits.",
      price: 1.5,
    },
    merkleroot:
      "0x8901234567abcdef8901234567abcdef8901234567abcdef8901234567abcdef",
    image: "/monkey.jpg",

  },
  {
    id: "owned-3",
    name: "Unlocked Mystery #555",
    creator:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: {
      description: "A mystery box that has been opened to reveal its contents.",
      price: 0.8,
    },
    merkleroot:
      "0x9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcdef",
    image: "/monkey.jpg",

  },
];

export type SortOption = "price-low" | "price-high" | "newest" | "oldest";

export const sortOptions = [
  { value: "price-low" as SortOption, label: "Price: Low to High" },
  { value: "price-high" as SortOption, label: "Price: High to Low" },
  { value: "newest" as SortOption, label: "Newest First" },
  { value: "oldest" as SortOption, label: "Oldest First" },
];

export function sortNFTs(nfts: NFT[], sortBy: SortOption): NFT[] {
  const sorted = [...nfts];

  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => a.metadata.price - b.metadata.price);
    case "price-high":
      return sorted.sort((a, b) => b.metadata.price - a.metadata.price);
    case "newest":
      return sorted;
    case "oldest":
      return sorted;
    default:
      return sorted;
  }
}

export function generateProof(): string {
  // Simulate proof generation
  const chars = "0123456789abcdef";
  let proof = "0x";
  for (let i = 0; i < 64; i++) {
    proof += chars[Math.floor(Math.random() * chars.length)];
  }
  return proof;
}
