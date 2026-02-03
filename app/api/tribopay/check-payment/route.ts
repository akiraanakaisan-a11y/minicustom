import { NextResponse } from 'next/server'
import { checkTribopayTransaction } from '@/lib/tribopay'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { transaction_hash } = await request.json()

    if (!transaction_hash) {
      return NextResponse.json(
        { success: false, error: 'Transaction hash required' },
        { status: 400 }
      )
    }

    // Verificar status na Tribopay
    const transaction = await checkTribopayTransaction(transaction_hash)

    // Atualizar pedido no banco de dados se pago
    if (transaction.status === 'paid') {
      const supabase = await createClient()
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('transaction_hash', transaction_hash)
    }

    return NextResponse.json({
      success: true,
      status: transaction.status,
      paid: transaction.status === 'paid',
    })
  } catch (error) {
    console.error('[v0] Error checking payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check payment' },
      { status: 500 }
    )
  }
}
