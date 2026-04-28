import type { AdminUser } from '@/types/admin';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';

interface AdminTopbarProps {
  adminUser: AdminUser;
  onMenuClick?: () => void;
}

function AdminTopbar({ adminUser, onMenuClick }: AdminTopbarProps) {
  const initials = adminUser.email.slice(0, 2).toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 lg:left-64">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </Button>

      <div className="ml-auto flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback className="bg-[#154660] text-xs text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden text-sm text-muted-foreground sm:inline-block">
          {adminUser.email}
        </span>
        <form action="/api/admin/logout" method="POST">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </form>
      </div>
    </header>
  );
}

export { AdminTopbar };