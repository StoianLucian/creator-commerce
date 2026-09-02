import { ProductCard } from './ProductCard'
import { ProductWithRelations } from '@/lib/actions/products'
import { Skeleton } from '../ui/skeleton'

function ProductCardWrapper({ products, isPending }: { products: ProductWithRelations[], isPending: boolean }) {
  if (isPending) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </>
    )
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  )
}

export default ProductCardWrapper
