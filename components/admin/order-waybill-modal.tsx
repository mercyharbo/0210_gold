'use client'

import { formatNaira } from '@/components/index/shop/shop-data'

export type OrderReceiptData = {
  id: string
  order_number: number
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_country: string
  subtotal_amount: number
  delivery_amount: number
  total_amount: number
  payment_status: string
  status: string
  created_at: string
  order_items: Array<{
    id: string
    product_name: string
    quantity: number
    price: number
    selected_size?: string | null
    selected_color?: string | null
  }>
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function createOrderReceiptHtml(order: OrderReceiptData) {
  const receiptNumber = `REC-${String(order.order_number).padStart(4, '0')}`
  const isPaid = order.payment_status === 'paid'
  const receiptDate = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const itemRows = order.order_items.length
    ? order.order_items
        .map((item) => {
          const description =
            [item.selected_size, item.selected_color].filter(Boolean).join(' / ') || 'Standard'

          return `
            <tr>
              <td>${escapeHtml(item.product_name)}</td>
              <td>${escapeHtml(description)}</td>
              <td class="center">${escapeHtml(item.quantity)}</td>
              <td class="amount">${escapeHtml(formatNaira(item.price * item.quantity))}</td>
            </tr>
          `
        })
        .join('')
    : '<tr><td colspan="4" class="empty">No items recorded for this order.</td></tr>'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt ${escapeHtml(receiptNumber)}</title>
    <style>
      @page { size: A4 portrait; margin: 12mm 14mm; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #000; }
      body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        line-height: 1.45;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .receipt { display: flex; width: 100%; flex-direction: column; gap: 28px; }
      .receipt-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 32px; }
      .business { display: flex; align-items: flex-start; gap: 20px; }
      .logo {
        display: flex;
        width: 92px;
        height: 112px;
        flex: 0 0 92px;
        align-items: center;
        justify-content: center;
        border: 2px solid #000;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
      }
      .business-details { display: flex; flex-direction: column; gap: 7px; color: #333; }
      .business-name { margin: 0 0 2px; color: #000; font-size: 15px; font-weight: 700; }
      .receipt-title { margin: 0; border-bottom: 2px solid #000; font-size: 38px; line-height: 1; }
      .rule { width: 100%; border-top: 2px solid #000; }
      .details { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
      .customer { display: flex; flex-direction: column; gap: 7px; padding: 0 28px; }
      .section-title { margin: 0 0 4px; font-size: 11px; font-weight: 700; }
      .customer-name { font-size: 13px; font-weight: 700; }
      .receipt-meta {
        display: grid;
        grid-template-columns: minmax(118px, 1fr) minmax(0, 1fr);
        gap: 18px 22px;
        border-left: 1px solid #000;
        padding: 4px 34px;
      }
      .receipt-meta dt { font-weight: 700; }
      .receipt-meta dd { margin: 0; overflow-wrap: anywhere; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      th, td { border: 1px solid #000; padding: 14px 12px; overflow-wrap: anywhere; }
      th { background: #f5f5f5; text-align: center; font-weight: 700; }
      th:nth-child(1) { width: 28%; }
      th:nth-child(2) { width: 45%; }
      th:nth-child(3) { width: 9%; }
      th:nth-child(4) { width: 18%; }
      td { text-align: center; }
      .center { text-align: center; }
      .amount { text-align: right; white-space: nowrap; }
      .empty { color: #555; text-align: center; }
      .summary-section {
        display: grid;
        grid-template-columns: 1fr 240px;
        gap: 40px;
        padding: 0 28px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .notes { display: flex; flex-direction: column; gap: 10px; }
      .notes p { margin: 0; }
      .summary { margin: 0; }
      .summary-row { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #d1d5db; padding: 8px 12px; }
      .summary-row dt { font-weight: 700; }
      .summary-row dd { margin: 0; white-space: nowrap; }
      .total { border-bottom: 0; background: #f3f4f6; font-size: 13px; font-weight: 700; }
      .status { border-bottom: 0; background: #6b7280; color: #fff; font-weight: 700; }
      .receipt-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        border-top: 2px solid #000;
        padding-top: 18px;
        text-align: center;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .thank-you { margin: 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-style: italic; }
      .appreciation { margin: 0; font-size: 12px; font-weight: 700; }
      @media screen {
        body { padding: 32px; }
        .receipt { max-width: 794px; margin: 0 auto; }
      }
      @media print {
        body { width: 100%; }
        .receipt { width: 100%; }
      }
    </style>
  </head>
  <body>
    <main class="receipt">
      <header class="receipt-header">
        <div class="business">
          <div class="logo">0210<br />GOLD</div>
          <div class="business-details">
            <h2 class="business-name">MERCYHARBO / 0210 GOLD</h2>
            <span>support@fmluxe.com</span>
            <span>+234 800 000 0000</span>
            <span>Victoria Island, Lagos, Nigeria</span>
            <span>www.mercyharbo.com</span>
          </div>
        </div>
        <h1 class="receipt-title">RECEIPT</h1>
      </header>

      <div class="rule"></div>

      <section class="details">
        <div class="customer">
          <h2 class="section-title">RECEIVED FROM</h2>
          <span class="customer-name">${escapeHtml(order.customer_name)}</span>
          <span>${escapeHtml(order.shipping_address)}</span>
          <span>${escapeHtml(order.shipping_city)}, ${escapeHtml(order.shipping_state)}, ${escapeHtml(order.shipping_country)}</span>
          <span>${escapeHtml(order.customer_phone)}</span>
          <span>${escapeHtml(order.customer_email)}</span>
        </div>
        <dl class="receipt-meta">
          <dt>RECEIPT #:</dt><dd>${escapeHtml(receiptNumber)}</dd>
          <dt>DATE:</dt><dd>${escapeHtml(receiptDate)}</dd>
          <dt>PAYMENT METHOD:</dt><dd>${isPaid ? 'Bank Transfer (Paid)' : 'Pay on Delivery'}</dd>
          <dt>REFERENCE #:</dt><dd>TXN-${escapeHtml(order.id.slice(0, 12).toUpperCase())}</dd>
        </dl>
      </section>

      <table>
        <thead>
          <tr>
            <th>ITEM / SERVICE</th>
            <th>DESCRIPTION</th>
            <th>QTY</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <section class="summary-section">
        <div class="notes">
          <h2 class="section-title">NOTES:</h2>
          <div>
            <p>Thank you for your payment!</p>
            <p>We appreciate your business.</p>
          </div>
        </div>
        <dl class="summary">
          <div class="summary-row"><dt>SUBTOTAL</dt><dd>${escapeHtml(formatNaira(order.subtotal_amount))}</dd></div>
          <div class="summary-row"><dt>DELIVERY</dt><dd>${escapeHtml(formatNaira(order.delivery_amount))}</dd></div>
          <div class="summary-row total"><dt>TOTAL</dt><dd>${escapeHtml(formatNaira(order.total_amount))}</dd></div>
          <div class="summary-row status"><dt>STATUS:</dt><dd>${isPaid ? 'PAID &#10003;' : 'UNPAID'}</dd></div>
        </dl>
      </section>

      <footer class="receipt-footer">
        <p class="thank-you">Thank You</p>
        <p class="appreciation">WE APPRECIATE YOUR BUSINESS</p>
      </footer>
    </main>
  </body>
</html>`
}

export function printOrderWaybill(order: OrderReceiptData) {
  const printWindow = window.open('', '_blank', 'width=900,height=1100')

  if (!printWindow) {
    window.alert('Please allow pop-ups for this site, then try printing the waybill again.')
    return
  }

  printWindow.opener = null
  printWindow.document.open()
  printWindow.document.write(createOrderReceiptHtml(order))
  printWindow.document.close()
  printWindow.setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 250)
}
