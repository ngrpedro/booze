import { useProduct } from '@/contexts/ProductContext'
import { api } from '@/lib/axios'
import React from 'react'

interface ProductsOnOrderProps {
  productId: string
  orderId: string
  quantify: number
}

interface Product {
  id: string
  name: string
}

const ProductsOnOrder = ({
  productId,
  orderId,
  quantify,
}: ProductsOnOrderProps) => {
  const { products } = useProduct()

  return (
    <>
      {products !== undefined ? (
        products.map((prod: Product) => {
          if (prod.id === productId) {
            return <p  key={productId} className='text-sm'>{prod.name}</p>
          }
        })
      ) : (
        <>Carregando</>
      )}
    </>
  )
}

export default ProductsOnOrder
