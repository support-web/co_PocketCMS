import { TabNavigation } from '@/components/admin/TabNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-20">{children}</main>
      <TabNavigation />
    </div>
  );
}
