export default async function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>){
    return <div className="p-10">
        {children}
    </div>
}