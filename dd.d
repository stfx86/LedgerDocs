import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/Layout";
import { Star, Download, Eye, Share2, Shield } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { ethers } from "ethers";

interface EthereumWindow extends Window {
  ethereum?: any;
}
declare const window: EthereumWindow;

const ProductDetail = () => {
  const { id } = useParams();
  const docId = parseInt(id || "1");
  const { LedgerDocAddress, abi, user, isConnected, provider3 } = useUser();
  const [document, setDocument] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch document data from contract and IPFS
  useEffect(() => {
    const fetchDocument = async () => {
      if (!provider3 || !LedgerDocAddress || !abi) {
        console.log("[fetchDocument] Missing provider, address, or abi");
        setError("Blockchain provider not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("[fetchDocument] Initializing contract with address:", LedgerDocAddress);
        const contract = new ethers.Contract(LedgerDocAddress, abi, provider3);
        console.log("[fetchDocument] Fetching document for docId:", docId);
        const doc = await contract.getDocument(docId);
        console.log("[fetchDocument] Document data:", doc);

        const status = Number(doc.status);
        if (status !== 0) {
          console.log("[fetchDocument] Document is not active, docId:", docId, "Status:", status);
          setError("Document is not active");
          setLoading(false);
          return;
        }

        // Fetch description from IPFS
        let fullDescription = "Fetched document details from blockchain.";
        if (doc.descriptionCid) {
          const descriptionResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${doc.descriptionCid}`);
          if (descriptionResponse.ok) {
            fullDescription = await descriptionResponse.text();
            console.log("[fetchDocument] Fetched description:", fullDescription);
          }
        }

        // Fetch preview images from IPFS
        let previewPages = [];
        if (doc.previewCid) {
          const previewResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${doc.previewCid}`);
          if (previewResponse.ok) {
            const previewData = await previewResponse.json();
            if (Array.isArray(previewData)) {
              previewPages = previewData.map(cid => `https://gateway.pinata.cloud/ipfs/${cid}`);
            } else {
              console.log("[fetchDocument] Invalid preview data format, expected array of cids");
              previewPages = [
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop",
              ];
            }
          }
        }

        setDocument({
          id: Number(doc.id),
          title: doc.title,
          description: JSON.parse(fullDescription).description || "No description available",
          price: ethers.formatEther(BigInt(doc.price)),
          categories: doc.categories.length > 0 ? doc.categories : ["Uncategorized"],
          downloads: Number(doc.downloads),
          rating: Number(doc.totalRating) / (Number(doc.ratingCount) || 1) || 0,
          reviewCount: Number(doc.ratingCount),
          uploader: {
            name: doc.uploaderName || "Unknown",
            avatar: "/placeholder.svg",
            totalSales: 0,
            rating: 0,
            joinDate: "Unknown",
          },
          previewAvailable: !!doc.previewCid,
          tags: doc.categories,
          fileSize: "Unknown",
          pages: 0,
          lastUpdated: new Date(Number(doc.uploadTime) * 1000).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          language: "English",
          previewPages,
        });
      } catch (err) {
        console.error("[fetchDocument] Error fetching document:", err);
        setError(err.message || "Failed to fetch document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [docId, provider3, LedgerDocAddress, abi]);

  const relatedDocs = [
    { id: 2, title: "Smart Contract Security Audit Checklist", price: "0.02", rating: 4.7 },
    { id: 3, title: "DeFi Protocol Development Guide", price: "0.08", rating: 4.8 },
    { id: 4, title: "NFT Marketplace Development", price: "0.06", rating: 4.6 },
    { id: 5, title: "Ethereum Gas Optimization", price: "0.03", rating: 4.7 },
  ];

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LedgerDocAddress, abi, signer);
      const tx = await contract.purchaseDocument(docId, {
        value: ethers.parseEther(document?.price || "0.05"),
      });
      console.log("transaction hash ::", tx.hash);
      await tx.wait();
    } catch (err) {
      console.error("[handlePurchase] Error:", err);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
    // Optionally, add logic to submit rating to the blockchain
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">Loading document...</div>
      </Layout>
    );
  }

  if (error || !document) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center text-red-600">
          Error: {error || "Document not found"}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Sidebar - Document Info */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {document.categories.map((category) => (
                  <Badge key={category} variant="outline" className="capitalize">
                    {category}
                  </Badge>
                ))}
                {document.previewAvailable && (
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-3">{document.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{document.rating.toFixed(1)}</span>
                  <span>({document.reviewCount})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>{document.downloads.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4">{document.description}</p>

              {/* Rate this document */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Rate this document:</p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= (hoveredRating || userRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {userRating} star{userRating !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handlePurchase}
                disabled={isPurchasing || !isConnected}
              >
                {isPurchasing ? "Processing..." : isConnected ? `Purchase for ${document.price} ETH` : "Connect Wallet"}
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pages</span>
                    <span className="font-medium">{document.pages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium">{document.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language</span>
                    <span className="font-medium">{document.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated</span>
                    <span className="font-medium">{document.lastUpdated}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploader Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={document.uploader.avatar} />
                    <AvatarFallback>{document.uploader.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-sm">{document.uploader.name}</h4>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{document.uploader.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Center - Document Preview */}
          <div className="lg:col-span-3">
            <Card className="h-[800px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Document Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4 h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-4">
                    {document.previewPages.map((pageUrl, index) => (
                      <div key={index} className="relative">
                        <div className="bg-white shadow-lg mx-auto max-w-[500px]">
                          <div className="relative overflow-auto max-w-full bg-white rounded shadow">
                            <img
                              src={pageUrl}
                              alt={`Preview page ${index + 1}`}
                              className="max-w-full h-auto mx-auto max-h-[700px]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20">
                              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-center">
                                <Shield className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-700 font-medium">Preview Mode - Page {index + 1}</p>
                                <p className="text-xs text-gray-600">Purchase to view full quality</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Related Docs */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">You might also like</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-3">
                {relatedDocs.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-2">
                    <Link to={`/product/${doc.id}`} className="block hover:text-blue-600">
                      <div className="aspect-[3/4] w-full bg-gray-100 rounded mb-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=160&fit=crop"
                          alt={doc.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <h4 className="font-medium text-xs mb-1 line-clamp-2">{doc.title}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{doc.rating}</span>
                        </div>
                        <span className="font-medium text-blue-600">{doc.price} ETH</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;