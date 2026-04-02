import type { Metadata } from 'next';
import { getAllItems } from '@/lib/items/get';
import { getAllTags } from '@/lib/items/tags';
import ProductsClient from '@/components/ProductsClient';
import ProductListStructuredData from '@/components/seo/ProductListStructuredData';

export async function generateMetadata(): Promise<Metadata> {
    const { items } = await getAllItems();
    const itemNames = (items ?? []).slice(0, 4).map((item) => item.meta_title?.trim() || item.name);
    const description = itemNames.length > 0
        ? `Shop handmade cake toppers, party boxes, and celebration decor including ${itemNames.join(', ')}.`
        : 'Shop handmade cake toppers, party boxes, and celebration decor.';

    return {
        title: 'Products',
        description,
        alternates: {
            canonical: '/products',
        },
    };
}

export default async function Products(){
    const { items } = await getAllItems();
    const { tags } = await getAllTags();
    const structuredDataDescription = 'Shop handmade cake toppers, party boxes, and celebration decor across the full Cute & Creative collection.';

    if (!items || items.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center">
                <h1 className="text-xl">No Items found</h1>
            </div>
        );
    }

    return (
        <>
            <ProductListStructuredData items={items} title="Shop Our Collection" description={structuredDataDescription} />
            <ProductsClient initialItems={items} initialTags={tags} />
        </>
    );
}
