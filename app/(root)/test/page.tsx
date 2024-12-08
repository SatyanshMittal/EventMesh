"use client";
import PaymentWidget from "@requestnetwork/payment-widget/react";

export default function PaymentPage() {
  return (
    <PaymentWidget
      sellerInfo={{
        logo: "https://example.com/logo.png",
        name: "Example Store",
      }}
      productInfo={{
        name: "Digital Art Collection",
        description: "A curated collection of digital artworks.",
        image: "https://example.com/product-image.jpg",
      }}
      amountInUSD={1.5}
      sellerAddress="0x1234567890123456789012345678901234567890"
      supportedCurrencies={[
        "REQ-mainnet",
        "ETH-sepolia-sepolia",
        "USDC-mainnet",
      ]}
      persistRequest={true}
      onPaymentSuccess={(request) => {
        console.log(request);
      }}
      onError={(error) => {
        console.error(error);
      }}
    />
  );
}
