export default async function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
    return <div className="flex min-h-0 flex-1 overflow-hidden">
        {children}
    </div>
}