"use client";
import { useState } from "react";
import PaymentWidget from "@requestnetwork/payment-widget/react";

export default function PaymentPage() {
  const [eventName, setEventName] = useState("Test Event");
  const [eventDescription, setEventDescription] = useState(
    "Test Event Description",
  );
  const [eventPrice, setEventPrice] = useState(1.5);
  return (
    <PaymentWidget
      sellerInfo={{
        logo: "/assets/images/logo-black.png",
        name: "Event Mesh",
      }}
      productInfo={{
        name: eventName,
        description: eventDescription,
        image: "/assets/images/logo-black.png",
      }}
      amountInUSD={eventPrice}
      sellerAddress="0xF3205A1fBc393f5205E37A71B29818AaC83ceB34"
      supportedCurrencies={["ETH-sepolia-sepolia", "USDC-mainnet"]}
      persistRequest={true}
      onPaymentSuccess={(request) => {
        console.log();
      }}
      onError={(error) => {
        console.error(error);
      }}
    />
  );
}
