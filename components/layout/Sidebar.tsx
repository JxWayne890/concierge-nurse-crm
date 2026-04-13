'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Send,
  Tags,
  Settings,
  Upload,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/contacts/import', label: 'Import', icon: Upload },
  { href: '/campaigns', label: 'Campaigns', icon: Send },
  { href: '/segments', label: 'Segments', icon: Tags },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-navy-lighter">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy font-bold text-sm">
          CN
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Concierge Nurse</p>
          <p className="text-[11px] text-slate-light leading-tight">Business Society</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-lighter text-gold'
                  : 'text-gray-300 hover:bg-navy-light hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-navy-lighter px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:bg-navy-light hover:text-white transition-colors">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
