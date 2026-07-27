# Tutaly Marketplace: Services & Payments Overview

This document outlines the architecture, business logic, and lifecycle of the **Services Marketplace** on the Tutaly platform. It is designed to provide clarity for the team and stakeholders regarding how users list services, how payments are processed, and how the escrow and dispute systems protect both buyers and sellers.

---

## 1. Roles & Permissions

The Tutaly marketplace operates on a strict role-based access control system to ensure professional accountability:

- **Employers (Sellers):** Only authenticated users with the `employer` role have the authority to create listings, sell services, and respond to quote requests in the shop.
- **Seekers (Buyers):** Users with the `seeker` role (and employers acting as buyers) can browse the shop, request custom quotes, and purchase services. Seekers cannot list their own services.

---

## 2. Service Listing Models

When an employer lists a service, they must define how the service is priced and purchased. The platform supports two distinct purchasing flows:

### A. Fixed Price (Per Unit)
Best for standardized services with a clear, upfront cost (e.g., "Resume Review - ₦50,000"). 
- The buyer sees the fixed price.
- The buyer can instantly checkout and pay for the service.

### B. Request Quote (Custom Pricing)
Best for bespoke or variable-scope services (e.g., "Custom Web Development").
- The buyer submits a formal **Quote Request** detailing their specific needs.
- The seller reviews the request and issues a binding quote with a custom price.
- The buyer reviews the quote and, if accepted, proceeds to payment.

---

## 3. The Commission Split

To sustain the platform, Tutaly automatically splits all incoming payments at the point of the transaction's completion. 

- **Tutaly Commission:** A flat **20%** is deducted from the total transaction value.
- **Seller Earnings:** The remaining **80%** is credited to the seller.

*Note: This split is calculated immediately upon payment, but the seller's 80% is held securely in escrow until the service is successfully delivered.*

---

## 4. Payment & Escrow Lifecycle

Because services carry an inherent risk of non-delivery or dissatisfaction, Tutaly utilizes a **48-Hour Auto-Release Escrow System**. Funds are not released to the seller instantly; they are held by the platform until the buyer has had a chance to verify the work.

Here is the exact step-by-step lifecycle of a service order:

### Phase 1: Payment & Escrow (`paid`)
1. The buyer pays for the service using our integrated payment gateways (Flutterwave, Paystack, etc.).
2. The order status updates to `paid`.
3. The funds are held securely in the platform's escrow account.

### Phase 2: Fulfillment & Delivery (`delivered`)
4. The seller performs the agreed-upon service off-platform or via platform messaging.
5. Once the work is complete, the seller marks the order as **Delivered** in their dashboard.
6. **The Countdown Begins:** Marking the order as delivered triggers a strict 48-hour auto-release timer. 

### Phase 3: The Dispute Window (`flagged`)
7. During the 48-hour window, the buyer is notified to review the delivered work. 
8. If the buyer is unsatisfied or the work was not delivered as promised, they can click **"Report an Issue"**.
9. This action immediately updates the order status to `flagged`, completely pausing the 48-hour auto-release timer and notifying the administration team.

### Phase 4: Resolution (`completed` or `refunded`)
10. **Happy Path (Auto-Release):** If 48 hours pass and the buyer has not reported any issues, the system automatically marks the order as `completed`. The 80% earnings are instantly released to the seller's withdrawable balance.
11. **Dispute Path:** If the order was flagged, a Tutaly Admin reviews the evidence from both the buyer and the seller. The Admin will then manually force the order to either `completed` (releasing funds to the seller) or `refunded` (returning the money to the buyer).

---

## 5. Security & Audit Trails

To ensure maximum security and trust on the platform:
- **Webhook Verification:** All payment confirmations from gateways (like Flutterwave) require cryptographic HMAC-SHA512 signature verification before Tutaly acknowledges the payment.
- **Permanent Dispute Records:** If an order is disputed, all evidence, admin notes, and the final resolution decision are stored permanently in an independent `OrderDispute` database table. This ensures a permanent audit trail even after the order is closed.
- **MFA:** Administrators resolving disputes are required to use Multi-Factor Authentication, and employers are highly encouraged to enable it.
