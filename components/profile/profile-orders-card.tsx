import Link from 'next/link'
import { formatNaira } from '@/components/index/shop/shop-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export type RecentOrder = {
  id: string
  date: string
  status: string
  items: string
  total: number
}

export function ProfileOrdersCard({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">Recent orders</CardTitle>
        <CardAction><Button asChild variant="link"><Link href="/track-order">Track an order</Link></Button></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {orders.length ? orders.map((order) => (
          <article key={order.id} className="grid gap-4 py-5 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="break-words text-sm font-semibold">{order.id}</h3>
              <p className="text-xs text-muted-foreground">{order.date}</p>
              <p className="text-sm text-muted-foreground">{order.items}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <Badge variant="outline">{order.status}</Badge>
              <p className="text-sm font-semibold">{formatNaira(order.total)}</p>
            </div>
          </article>
        )) : <p className="py-6 text-sm text-muted-foreground">No orders placed yet.</p>}
      </CardContent>
    </Card>
  )
}
