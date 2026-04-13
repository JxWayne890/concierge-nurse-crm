'use client';

import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">{title}</h1>
        {subtitle && <p className="text-sm text-slate mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <button className="relative p-2 text-slate hover:text-charcoal transition-colors rounded-lg hover:bg-cream-dark">
          <Search size={18} />
        </button>
        <button className="relative p-2 text-slate hover:text-charcoal transition-colors rounded-lg hover:bg-cream-dark">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center text-navy text-sm font-bold">
            A
          </div>
          <span className="text-sm font-medium text-charcoal">Admin</span>
        </div>
      </div>
    </header>
  );
}
