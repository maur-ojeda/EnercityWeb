import { useState } from 'react';
import type { AdminUser } from '@/types/admin';
import { SidebarContent } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface AdminShellProps {
  adminUser?: AdminUser;
  currentPath: string;
}

function AdminShell({ adminUser, currentPath }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden bg-[#154660] lg:flex">
        <SidebarContent currentPath={currentPath} />
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 bg-[#154660] p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación</SheetTitle>
          </SheetHeader>
          <SidebarContent
            currentPath={currentPath}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <AdminTopbar
        adminUser={adminUser}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
    </>
  );
}

export { AdminShell };