import { ProductCard } from './ProductCard'
import { ProductWithRelations } from '@/lib/actions/products'
import { Skeleton } from '../ui/skeleton'

function ProductCardWrapper({ products, isPending }: { products: ProductWithRelations[], isPending: boolean }) {

    console.log(products)
    return (
        <div>
            {isPending ? <>{Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-xl" />
            ))}</> : <> {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}</>}
        </div>
    )
}

export default ProductCardWrapper