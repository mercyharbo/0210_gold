# Executive Admin Dashboard & Architecture Guide

Welcome to the **Mercyharbo / 0210 Gold & Fashion** Admin Console developer documentation. This guide details the system architecture, component breakdown, database aggregations, and maintenance guidelines for future developers and maintainers.

---

## 🏛️ 1. Architecture Overview

The admin system is built on **Next.js 16 (App Router)** with **Supabase Server & Admin Clients**, utilizing **Recharts 3.x** for interactive data visualizations and **Tailwind CSS / shadcn UI** for clean, responsive interfaces.

```
app/(admin)/admin/
├── page.tsx                           # Main Server Page (Data Aggregations)
├── layout.tsx                         # Root Admin Layout & Auth Protection
├── orders/                            # Orders Management & Waybills
│   ├── page.tsx
│   ├── actions.ts                     # Status Update Server Actions
│   └── [id]/                          # Order Detail & Printable Waybill
├── personal-shopper-requests/         # Bespoke Sourcing Leads
│   ├── page.tsx
│   ├── client.tsx
│   └── actions.ts
├── products/                          # Product Catalog Management
└── categories/                        # Product Categories Management
```

---

## 📊 2. Executive Analytics Dashboard (`/admin`)

The main dashboard provides real-time financial tracking, store activity streams, and sales target metrics.

### Key Components

1. **`app/(admin)/admin/page.tsx` (Server Component)**:
   - Fetches live database records using `createSupabaseAdminClient()`.
   - Performs real-time aggregations for monthly revenue (`Jan` – `Dec`) and category sales distribution.
   - Merges recent orders and personal shopper requests into a unified live activity feed.

2. **`components/admin/admin-dashboard-client.tsx` (Client Component)**:
   - **Metric Cards Array**: Maps over `metricCards` array passing data directly to `<AdminPlaceholderCard />`.
   - **Activity Feed**: Displays recent activity with `text-xs font-medium` lowercase status badges (`processing`, `shipped`, `pending`, `sourcing`).
   - **Monthly Target Gauge**: Calculates percentage progress towards the ₦50M revenue goal.
   - **Management Shortcuts**: Flat, monochrome action buttons for quick navigation.

3. **`components/admin/revenue-trend-chart.tsx`**:
   - Renders an interactive Recharts `<AreaChart>` with gold gradient fill (`#D4AF37`).
   - Uses the **shadcn UI `Tabs`** component (`Tabs`, `TabsList`, `TabsTrigger`) to toggle timeframes (*This Year*, *6 Months*, *3 Months*).

4. **`components/admin/category-sales-chart.tsx`**:
   - Renders an interactive Recharts `<PieChart>` donut chart (`innerRadius={70}`, `outerRadius={105}`).
   - **Recharts 3.x/4.x Compliance**: Attaches `fill` properties directly to data objects in `formattedChartData` (avoids deprecated `<Cell />` elements).

---

## 📦 3. Order Lifecycle & Waybill Dispatch (`/admin/orders`)

Allows store managers to inspect customer orders, adjust fulfillment states, and generate printable shipping manifests for courier dispatch.

### Key Workflows

1. **Fulfillment State Machine**:
   - `pending` ➔ `processing` ➔ `shipped` ➔ `delivered` (or `cancelled`).
   - Status updates are triggered via `updateOrderStatusAction` in `app/(admin)/admin/orders/actions.ts`.
   - Automatically revalidates `/admin/orders` and `/track-order`.

2. **Printable Courier Waybill (`components/admin/order-waybill-modal.tsx`)**:
   - Formats sender/recipient shipping addresses, parcel item manifest, and payment status tags (`PAID IN FULL` vs `PAY ON DELIVERY`).
   - Includes a **Print Waybill** button that triggers native `window.print()` with CSS `@media print` optimizations.

---

## 🛍️ 4. Personal Shopper Requests (`/admin/personal-shopper-requests`)

Handles bespoke UK sourcing requests for high-value items.

- **Status Workflow**: `Pending` ➔ `Sourcing` ➔ `Completed` ➔ `Cancelled`.
- **Admin Notes**: Includes an interactive drawer component (`client.tsx`) allowing admins to record sourcing notes and update request statuses.

---

## 🎨 5. Design Guidelines & Constraints

When extending the admin interface, adhere strictly to these UI conventions:

| Rule | Guideline |
| :--- | :--- |
| **Typography** | Use standard `font-sans` everywhere. **Do not use `font-mono` or `font-heading`** for prices or titles. |
| **Letter Spacing** | **Do not use `tracking-` classes** (`tracking-wider`, `tracking-tight`). Keep natural font letter-spacing. |
| **Status Badges** | Render status badges in **lowercase** with `text-xs font-medium px-2.5 py-0.5 rounded-full border`. |
| **Drop Shadows** | **Do not use `shadow-` classes**. Maintain a clean, flat aesthetic using `border border-border bg-white`. |
| **Icons** | Use clean, minimal outline icons (`DollarSign`, `ShoppingBag`, `Users`, `FileText`, `Package`). **Do not use Sparkles or AI-style icons**. |
| **Chart Filtering** | Use the shadcn `Tabs` component for chart filter controls instead of raw buttons or custom divs. |

---

## 🛠️ 6. Maintenance & Verification Commands

### Development Server
```bash
pnpm dev
```

### Production Build & Type Checking
```bash
pnpm build
```

---
*Documentation maintained by Mercyharbo Technical Engineering Team.*
