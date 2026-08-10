import { getProduct, getProducts } from '@/lib/actions/products'
import { NavBar } from './NavBar'
import { useProducts } from '@/hooks/useProducts'
import { useUrlSearch } from '@/hooks/use-url-search';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/products-page/ProductCard';
import ProductCardWrapper from '@/components/products-page/ProductCardWrapper';
import { cn } from '@/lib/utils';

function Dashboard() {
    const { filters, setFilters, searchDebounce } = useUrlSearch();
    const { search } = filters
    const { data: products = [], isPending, isError, error } = useProducts({ q: searchDebounce, allProducts: true });
    return (
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            <div className={cn("flex flex-col gap-4", products.length === 0 && "col-span-full")}>
                <div>
                    <Search className="relative left-3 top-7 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
                        value={search}
                        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ProductCardWrapper products={products} isPending={isPending} />
                </div>
            </div>
        </div>
    )
}

export default Dashboard