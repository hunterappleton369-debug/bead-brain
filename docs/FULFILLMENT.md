# Shipping the free abacus kit: which platform, and how to set it up

Written 2026-10-21 for the free-abacus funnel. The pages promise a kit "delivered to your door in 7 days or less", shipped "in 2 to 3 business days", US addresses only, for $9.95 shipping. The kit is a soroban, the printed Child Prodigy Secrets Playbook, a welcome card, and (when the bump is taken) the printed Prodigy Maker Workbook. That mix rules some options out before price enters it.

## The short answer

**Updated 2026-10-21.** Checkout is **Stripe** for every step, including the kit, because a Stripe Payment Link can send the parent straight back to page 2 after paying; Shopify's checkout ends on Shopify's own thank-you page and would lose the University offer. **Shopify + CJ Dropshipping** is the fulfilment back office: the two products and the $9.95 US rate are already set up in the store (j1tu10-he), and the abacus is pre-stocked in a CJ warehouse in the United States with the printed Playbooks and quick-start cards sent to the same warehouse so every order ships as one branded box. Paid orders now flow Stripe → Supabase function (`stripe-webhook`) → Shopify automatically once the Shopify token is set (`docs/products/legal-and-ops/stripe-setup.md` §8, "Shopify order creation"); a draft order made by hand (see "Backup" below) stays the fallback. Once you pass roughly 300 kits a month, or the moment you buy 1,000 units up front, move the stock to a US fulfilment house that specialises in kitting (ShipMonk first, ShipBob second).

DSers is the wrong tool for this product. It is an AliExpress order tool: it ships from Chinese suppliers in 7 to 20+ days, it cannot bundle a printed book into the parcel, and it has no branded packaging. Every one of those breaks a promise the page makes.

## How the options compare for this kit

| Option | Fits the 7-day promise | Can kit abacus + book in one branded box | Cost shape | Verdict |
|---|---|---|---|---|
| DSers + AliExpress (you have it) | No. China shipping, 7–20+ days; "ships from US" listings for a 13-rod soroban are rare | No | Free app, pay per order | Not for this product |
| CJ Dropshipping (Shopify app) | Yes when the abacus sits in a CJ US warehouse: reviews report 2–7 days, CJ claims 3–6 | Yes, with custom packaging (minimums apply) and your own inventory stored at CJ; confirm bundle kitting in writing | No monthly fee; per-order fulfilment; small inbound fee; storage for slow stock | **Best fit to launch** |
| ShipMonk (3PL) | Yes, 2–5 days domestic | Yes, kitting is its core service | Custom quote, no published minimum | Best once volume or the 1,000-unit buy justifies it |
| ShipBob (3PL) | Yes | Yes | Published minimum about $275/month and roughly 400 orders/month; setup fee reported near $975 | Only at volume |
| Amazon MCF | Yes, fast | No branded box, Amazon packaging, no inserts | Per-unit, cheap | Cheap but kills the unboxing |
| Zendrop | Partly (US stock on some items only) | Branded packaging on paid plans | $29–49/month plus per-order fees | Costlier than CJ for the same job |

Sources are third-party reviews and community posts, not contracts, so confirm numbers with each provider before you commit:
[CJ US warehouses blog](https://blog.cjdropshipping.cn/detail/Unlock-3-Day-Delivery-with-CJ-s-New-US-Warehouses), [CJ custom packaging guide](https://blog.cjdropshipping.cn/detail/all-you-want-to-know-about-custom-packaging), [CJ review, Spocket 2026](https://www.spocket.co/blogs/cjdropshipping-overview), [CJ review, Super-DS 2026](https://super-ds.com/blog/cjdropshipping-review-2026), [CJ review, hustlegotreal](https://hustlegotreal.com/blog/cj-dropshipping-review/), [DSers vs Zendrop](https://ecommerce-platforms.com/articles/dsers-vs-zendrop), [Zendrop vs CJ](https://ecommerce-platforms.com/dropshipping-comparisons), [ShipBob alternatives 2026](https://www.shipfusion.com/blog/shipbob-alternatives), [best fulfilment companies 2026](https://fitsmallbusiness.com/best-fulfillment-warehouse/), [Shopify cart permalinks](https://community.shopify.com/t/cart-use-permalinks-to-pre-load-the-cart/7494/1).

## Why Stripe is the checkout and Shopify is the back office (replaces the earlier plan below)

The funnel is a static site. Its order form collects name, email, phone and address, then sends the parent to a hosted checkout link from `free-abacus/config.js`. Today those are meant to be Stripe Payment Links. A Shopify cart link does the same job and drops the order straight into the fulfilment app, with no Zapier glue:

- Kit only: `https://YOUR-STORE.myshopify.com/cart/KIT_VARIANT_ID:1`
- Kit plus the $27 bump: `https://YOUR-STORE.myshopify.com/cart/KIT_VARIANT_ID:1,BUMP_VARIANT_ID:1`

The site already appends the parent's email. Shopify also accepts `checkout[shipping_address][first_name]`-style parameters to prefill the address the parent typed on step 1, though community reports say the prefill is unofficial and sometimes fails on a first visit, so treat it as a convenience, not a guarantee. The parent re-enters the card and confirms the address on Shopify's page, which is normal for this kind of funnel.

Costs on the Shopify side: the Basic plan plus card fees. Shipping is collected as a $9.95 flat rate on a $0 product, which keeps the "free kit" promise honest on the receipt.

## Setup, click by click

### 1. Shopify (about an hour)

1. Shopify admin → **Products → Add product**: "Child Phenoms Free Abacus Kit", price $0.00, "This is a physical product" ticked, weight filled in. Save. Open the product, note the **variant ID** from the URL (Products → the product → Variants → the number at the end of the address).
2. Add a second product: "Prodigy Maker Workbook + Audiobook", price $27.00, physical.
3. **Settings → Shipping and delivery** → General shipping rates → create one rate for the United States only: "USPS Ground Advantage, 2–7 days", flat $9.95. Delete every other zone. Finish signal: a test checkout shows exactly one shipping option at $9.95.
4. **Settings → Checkout**: customer accounts off, email and phone both collected, "Require shipping address" on.
5. Build the two cart links above with your variant IDs, paste them into `free-abacus/config.js` as `checkoutUrl` and `checkoutUrlWithBump`, push the site. Finish signal: on the live page, the green button on step 2 lands on your Shopify checkout with the parent's email filled in.

### 2. CJ Dropshipping (one to two weeks, because stock has to land)

1. Shopify **Apps** → search "CJdropshipping" → install → connect the store.
2. In CJ, search the catalog for "soroban 13 rods" (or 17). If nothing matches the kit's abacus (black frame, natural wood beads, silver bar), use **Sourcing request** with the photo from `img/funnel/abacus.webp` and ask for a US-warehouse quote.
3. **Warehouse → Private inventory**: buy an opening batch (start with 200, not 1,000) into a CJ US warehouse. Ask CJ support, in the ticket, to confirm in writing: that your own printed Playbooks can be received at the same warehouse, that a bundle SKU (abacus + Playbook + welcome card, plus Workbook when ordered) will be kitted at pick time, the per-order fulfilment fee, and the storage fee for slow stock.
4. **Custom packaging**: order the white mailer with the logo and the welcome card through CJ's custom packaging form, choosing the same warehouse. Expect a minimum quantity and an up-front charge that is credited back per order.
5. Print the Playbook and the Workbook with a short-run printer (perfect-bound, 1,000 and 300 copies) and ship them to the CJ warehouse address CJ gives you in step 3.
6. In the CJ app, **map** the Shopify kit product to the bundle SKU and the bump product to the Workbook.
7. Place one real order to your own address. Finish signal: tracking appears in Shopify within 2 business days and the box arrives inside 7 with the abacus, the Playbook and the card in it.

### 3. When to move to a 3PL

Move when any of these is true: you are shipping more than about 300 kits a month, you have bought the 1,000-unit batch the urgency box talks about, or CJ cannot confirm bundle kitting. Ask ShipMonk and ShipBob for a kitting quote on the same three-item bundle and compare their per-order total (pick, pack, materials, postage) against CJ's.

## Backup: a Shopify order by hand

Use this when the function could not make the order and a re-send from Stripe will not fix it. That happens when the event is older than 30 days, or when Shopify keeps refusing the address. The Supabase logs say `SHOPIFY ORDER FAILED` or `SHOPIFY NOT SET UP`, and that `purchases` row has an empty `shopify_order_id`.

1. Stripe → **Payments** → open the payment. Note the email, the shipping address, the phone, and whether the Playbook was in it.
2. Shopify admin → **Orders** → **Drafts** → **Create order**.
3. **Products**: add "Child Phenoms Free Abacus Kit", plus "Child Prodigy Secrets Playbook + Audiobook" if it was bought.
4. **Customer**: type the parent's email. Paste the shipping address from Stripe.
5. **Shipping**: **Add shipping** → pick "USPS Ground Advantage (2 to 7 days)" at $9.95.
6. **Notes**: `Stripe checkout cs_…` (the checkout id from the `order_ref` column). **Tags**: `childphenoms, stripe`.
7. **Collect payment** → **Mark as paid** → **Create order**.
8. Supabase → **Table Editor** → `purchases` → that row: type the order number (for example `#1007`) into `shopify_order_name` and the long number from the order's web address into `shopify_order_id`. A later re-send then leaves it alone.

Finish signal: the order shows **Paid** in Shopify with the right address, and the supplier app lists it.

## Promises on the page to keep true

- "Ships in 2 to 3 business days by USPS": CJ may ship USPS or UPS. Either change the line to "by USPS or UPS" or ask CJ to pin the carrier.
- "Delivered in 7 days or less": only true with US stock. Never ship a kit from China under this promise.
- "US addresses only": matches the single shipping zone above.
- The $9.95 shipping charge: the Shopify receipt must show the kit at $0 and shipping at $9.95, not a $9.95 product.
- The urgency box's "1,000 kits" and "6 weeks": make the numbers match the batch you actually buy.

## Compliance for a children's product

An abacus sold for 7 to 11 year olds is a children's product under the US Consumer Product Safety Improvement Act. You need the supplier's Children's Product Certificate backed by a CPSC-accepted lab test (lead in surface coatings and substrate, phthalates, and a tracking label on the product or packaging). Ask CJ or the supplier for the certificate before the first batch leaves the warehouse. The paperwork lives with the kit's supplier records, and the review file already lists it as a pre-launch item.
