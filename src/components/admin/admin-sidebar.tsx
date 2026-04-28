import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Mail,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/contacts', label: 'Contactos', icon: Mail },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

interface SidebarContentProps {
  currentPath: string;
  onNavigate?: () => void;
}

function SidebarContent({ currentPath, onNavigate }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-[#154660] text-white">
      <div className="flex h-16 items-center gap-2 px-4">
        <span className="text-xl font-bold tracking-tight">Enercity</span>
        <span className="text-sm font-medium text-white/60">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? currentPath === '/admin'
              : currentPath.startsWith(item.href);

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#F07E04] text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-2">
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}

export { SidebarContent, NAV_ITEMS };