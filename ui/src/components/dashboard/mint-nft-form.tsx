import React, { useEffect, useState } from "react";
import { FileUpload } from "../ui/file-upload";
import { Button } from "../ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { usePixelRemover } from "@/hooks/use-pixel-remover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const MintNFTForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const { accounts } = useAuthStore();
  const walletAddress = accounts[0].userAddr;

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [merkleroot, setMerkleroot] = useState("");
  const [obfuscating, setObfuscating] = useState(false);

  const {
    canvasRef,
    outputSrc,
    handleImageUpload,
    // slicedBlocks,
  } = usePixelRemover();

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setImage(files[0]);
      setImagePreview(URL.createObjectURL(files[0]));
    }
  };

  useEffect(() => {
    setImagePreview(outputSrc)
  }, [outputSrc])

  const handleObfuscate = async () => {
    setObfuscating(true);
    // Simulate obfuscation and merkleroot generation
    if (image) {
      handleImageUpload(image);
      setTimeout(() => {
        setMerkleroot("0xMERKLEROOT1234567890abcdef");
        setObfuscating(false);
      }, 1500);
      console.log(outputSrc);
    } else {
      setObfuscating(false);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle publish logic here
    alert("NFT Minted!");
  };

  return (
    <form
      className="max-w-3xl mx-auto space-y-6 p-6 bg-muted/50 mb-10 border rounded-xl"
      onSubmit={handlePublish}
    >
      <div>
        <Label className="block font-medium mb-1">Name</Label>
        <Input
          type="text"
          className="w-full border rounded px-3 py-2 bg-muted"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label className="block font-medium mb-1">Description</Label>
        <Textarea
          className="w-full border rounded px-3 py-2 bg-muted"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label className="block font-medium mb-1">Price (SUI)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            className="w-full border rounded px-3 py-2 bg-muted"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <Label className="block font-medium mb-1">Wallet Address</Label>
          <Input
            type="text"
            className="w-full border rounded px-3 py-2 bg-muted border-primary"
            value={walletAddress}
            readOnly
          />
        </div>
      </div>
      <div>
        <Label className="block font-medium mb-1">Upload Image</Label>
        <FileUpload accept="image/*" onChange={handleFileChange} />
      </div>
      <div className="flex items-end gap-4">
        <Button
          type="button"
          onClick={handleObfuscate}
          size={"lg"}
          disabled={!image || obfuscating}
        >
          {obfuscating ? "Obfuscating..." : "Obfuscate Image"}
        </Button>
        <div className="flex-1">
          <Label className="block font-medium mb-1">Merkleroot</Label>
          <Input
            type="text"
            className="w-full border rounded px-3 py-2 bg-muted border-primary"
            placeholder="Merkleroot (will be generated automatically)"
            value={merkleroot}
            disabled={!merkleroot}
            readOnly
          />
        </div>
      </div>
      <div>
        <Label className="block font-medium mb-1">Image Preview</Label>
        <div className="w-full h-48 border rounded flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="object-contain w-full h-full"
            />
          ) : (
            <span className="text-muted-foreground">No image selected</span>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full mt-4"
        disabled={!merkleroot || !image}
      >
        Final Publish
      </Button>
    </form>
  );
};

export { MintNFTForm };
