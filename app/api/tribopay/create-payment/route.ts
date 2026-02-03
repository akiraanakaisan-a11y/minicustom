import { NextResponse } from 'next/server'
import { createTribopayTransaction } from '@/lib/tribopay'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('[v0] Creating Tribopay payment:', body)

    const {
      amount,
      description,
      customer_name,
      customer_email,
      customer_document,
      order_data,
    } = body

    // Criar transação na Tribopay (amount já vem em reais do checkout)
    const transaction = await createTribopayTransaction({
      amount: amount, // Valor já está em reais
      description,
      customer_name,
      customer_email,
      customer_document,
      payment_method: 'pix',
      metadata: {
        order_type: order_data?.product_size || 'miniatura',
        has_remote: order_data?.has_remote || 'false',
      },
    })

    // Salvar pedido no banco de dados usando os campos corretos da tabela orders
    const supabase = await createClient()
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_email,
        customer_document,
        size: order_data?.product_size,
        include_remote_control: order_data?.has_remote === 'true',
        vehicle_model: order_data?.vehicle_model,
        vehicle_color: order_data?.vehicle_color,
        vehicle_description: order_data?.customization_details || '',
        price: amount,
        total_price: amount,
        quantity: 1,
        payment_method: 'tribopay_pix',
        payment_status: 'pending',
        pix_transaction_id: transaction.transaction_hash,
        pix_qrcode: transaction.pix?.qrcode_text,
        order_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error saving order:', error)
      throw error
    }

    console.log('[v0] Order saved with ID:', order.id)

    return NextResponse.json({
      success: true,
      transaction_hash: transaction.transaction_hash,
      qrcode: transaction.pix?.qrcode,
      qrcode_text: transaction.pix?.qrcode_text,
      expires_at: transaction.pix?.expires_at,
      order_id: order.id,
    })
  } catch (error) {
    console.error('[v0] Error in create-payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
