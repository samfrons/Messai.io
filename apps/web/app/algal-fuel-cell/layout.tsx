export default function AlgalFuelCellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {children}
    </div>
  )
}