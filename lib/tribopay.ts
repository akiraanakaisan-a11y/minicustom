const TRIBOPAY_API_URL = 'https://api.tribopay.com.br/api/public/v1'
const TRIBOPAY_TOKEN = 'll4fkocXjmGIAWPqT9ovfJ0Nzq41BzrC16090r6a4RqoKiCgvsDMbw7SM4ZM'

export interface TribopayTransactionRequest {
  amount: number
  description: string
  customer_name: string
  customer_email: string
  customer_document: string
  offer_hash?: string
  metadata?: Record<string, string>
}

export interface TribopayTransactionResponse {
  success: boolean
  transaction_hash: string
  amount: number
  status: string
  payment_method: string
  pix?: {
    qrcode: string
    qrcode_text: string
    expires_at: string
  }
  created_at: string
}

export async function createTribopayTransaction(
  data: TribopayTransactionRequest
): Promise<TribopayTransactionResponse> {
  try {
    // Tribopay espera o valor em CENTAVOS
    const amountInCentavos = Math.round(data.amount * 100)
    
    // Gerar um hash único para oferta e produto
    const uniqueHash = `offer_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // Estrutura EXATA conforme exemplo que funcionou
    const payload = {
      amount: amountInCentavos,
      offer_hash: uniqueHash,
      payment_method: 'pix',
      customer: {
        name: data.customer_name,
        email: data.customer_email,
        phone_number: '21999999999', // Número padrão
        document: data.customer_document,
      },
      cart: [
        {
          product_hash: uniqueHash,
          title: data.description,
          price: amountInCentavos,
          quantity: 1,
          operation_type: 1, // INTEGER 1 para venda simples
          tangible: false,
        },
      ],
    }

    console.log('[v0] Creating Tribopay payment with payload:', JSON.stringify(payload))

    // API token vai na URL como query parameter
    const response = await fetch(`${TRIBOPAY_API_URL}/transactions?api_token=${TRIBOPAY_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[v0] Tribopay API error:', errorText)
      throw new Error(`Tribopay API error: ${response.status}`)
    }

    const result = await response.json()
    console.log('[v0] Tribopay transaction created successfully:', result.hash)
    console.log('[v0] Tribopay full response:', JSON.stringify(result))
    console.log('[v0] PIX data:', JSON.stringify(result.pix))
    
    // Mapear resposta da Tribopay para o formato esperado
    return {
      success: true,
      transaction_hash: result.hash,
      amount: result.amount,
      status: result.payment_status,
      payment_method: result.payment_method,
      pix: {
        qrcode: result.pix?.qr_code_base64 || result.pix?.qrcode_base64 || '',
        qrcode_text: result.pix?.pix_qr_code || result.pix?.qrcode || '',
        expires_at: result.pix?.expires_at || '',
      },
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('[v0] Error creating Tribopay transaction:', error)
    throw error
  }
}

export async function checkTribopayTransaction(
  transactionHash: string
): Promise<TribopayTransactionResponse> {
  try {
    const response = await fetch(
      `${TRIBOPAY_API_URL}/transactions/${transactionHash}?api_token=${TRIBOPAY_TOKEN}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Tribopay API error: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('[v0] Error checking Tribopay transaction:', error)
    throw error
  }
}
