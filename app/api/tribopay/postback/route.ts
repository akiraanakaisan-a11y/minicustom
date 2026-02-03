import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('[v0] Tribopay postback received:', body)

    const {
      transaction_hash,
      status,
      amount,
      payment_method,
      paid_at,
      customer_email,
      customer_name,
      product_id
    } = body

    // Validar se os campos obrigatórios existem
    if (!transaction_hash || !status) {
      console.log('[v0] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mapear status da Tribopay para status do sistema
    let orderStatus = 'pending'
    if (status === 'paid' || status === 'approved') {
      orderStatus = 'paid'
    } else if (status === 'cancelled' || status === 'refunded') {
      orderStatus = 'cancelled'
    } else if (status === 'pending' || status === 'waiting') {
      orderStatus = 'pending'
    }

    console.log('[v0] Mapped status:', status, '->', orderStatus)

    // Buscar pedido pelo transaction_hash
    const { data: existingOrder, error: searchError } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', transaction_hash)
      .single()

    if (searchError && searchError.code !== 'PGRST116') {
      console.log('[v0] Error searching order:', searchError)
      throw searchError
    }

    if (existingOrder) {
      // Atualizar pedido existente
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: orderStatus,
          payment_method: payment_method || 'tribopay',
          updated_at: new Date().toISOString(),
          ...(paid_at && { paid_at: paid_at })
        })
        .eq('transaction_id', transaction_hash)

      if (updateError) {
        console.log('[v0] Error updating order:', updateError)
        throw updateError
      }

      console.log('[v0] Order updated successfully:', transaction_hash)
    } else {
      // Criar novo pedido se não existir
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          transaction_id: transaction_hash,
          customer_name: customer_name || 'Cliente Tribopay',
          customer_email: customer_email || '',
          payment_status: orderStatus,
          payment_method: payment_method || 'tribopay',
          amount: amount ? (amount / 100) : 0, // Converter de centavos para reais
          product_name: product_id || 'Produto',
          created_at: new Date().toISOString(),
          ...(paid_at && { paid_at: paid_at })
        })

      if (insertError) {
        console.log('[v0] Error creating order:', insertError)
        throw insertError
      }

      console.log('[v0] Order created successfully:', transaction_hash)
    }

    // Retornar sucesso para a Tribopay
    return NextResponse.json(
      { 
        success: true,
        message: 'Postback processed successfully',
        transaction_hash 
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('[v0] Tribopay postback error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// Permitir GET para verificar se a rota está ativa
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Tribopay Postback Handler',
    timestamp: new Date().toISOString()
  })
}
