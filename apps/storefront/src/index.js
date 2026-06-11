import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { InquiryProvider } from "./context/InquiryContext";
import { WishlistProvider } from "./context/WishlistContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <InquiryProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </InquiryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
