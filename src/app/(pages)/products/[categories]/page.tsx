import type { Metadata } from "next";
import { getItemsByCategory } from "@/lib/items/get";
import { getAllTags } from "@/lib/items/tags";
import { formatCategoryDisplayName } from "@/lib/items/categories";
import ProductsCategoryClient from "@/components/ProductsCategoryClient";
import ProductListStructuredData from '@/components/seo/ProductListStructuredData';

type Props = { params: Promise<{ categories: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { categories } = await params;
    const displayCategory = formatCategoryDisplayName(categories);
    const { items } = await getItemsByCategory(categories);
    const highlightedProducts = (items ?? []).slice(0, 3).map((item) => item.meta_title?.trim() || item.name);
    const description = highlightedProducts.length > 0
        ? `Browse ${displayCategory} products including ${highlightedProducts.join(', ')}.`
        : `Browse ${displayCategory} cake toppers and party decor.`;

    return {
        title: displayCategory,
        description,
        alternates: {
            canonical: `/products/${categories}`,
        },
    };
}

export default async function ProductCategories({ params }: Props){

    const {categories} = await params;
    const displayCategory = formatCategoryDisplayName(categories);

    const {items, error} = await getItemsByCategory(categories);
    const { tags } = await getAllTags();

    if(error){
        return <div>Error Loading Products</div>
    }

    if(!items || items.length === 0){
        return <div className="h-screen flex items-center justify-center">
            <h1 className="text-xl">No Items found</h1>
        </div>
    }

    return (
                <>
                        <ProductListStructuredData items={items} title={displayCategory} description={`Browse ${displayCategory} handmade products from Cute & Creative Toppers.`} />
                        <ProductsCategoryClient 
                            categoryName={categories} 
                            initialItems={items}
                            initialTags={tags}
                        />
                </>
    );
}
