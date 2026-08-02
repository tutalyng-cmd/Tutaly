'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    CreditCard,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Megaphone,
    Menu,
    PlusCircle,
    X,
} from 'lucide-react';

const navigation = [
    { href: '/advertise', label: 'Overview', icon: LayoutDashboard },
    { href: '/advertise/create', label: 'Create campaign', icon: PlusCircle },
    { href: '/advertise/billing', label: 'Billing', icon: CreditCard },
];

type AccessState = 'checking' | 'allowed' | 'restricted';

function getAccessState(rawUser: string | null): AccessState {
    try {
        const user = rawUser ? JSON.parse(rawUser) : null;
        return user?.role === 'seeker' ? 'restricted' : 'allowed';
    } catch {
        return 'allowed';
    }
}

export default function AdsPortalShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [access, setAccess] = useState<AccessState>('checking');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const rawUser = localStorage.getItem('user');
        if (!token) {
            router.replace(`/auth/signin?next=${encodeURIComponent(pathname || '/advertise')}`);
            return;
        }

        const nextAccess = getAccessState(rawUser);
        const timer = window.setTimeout(() => setAccess(nextAccess), 0);
        return () => window.clearTimeout(timer);
    }, [pathname, router]);

    if (access === 'checking') {
        return (
            <main className="ads-access-state" aria-busy="true" aria-label="Loading advertising workspace">
                <div className="ads-skeleton ads-skeleton--brand" />
                <div className="ads-skeleton ads-skeleton--line" />
                <div className="ads-skeleton ads-skeleton--panel" />
            </main>
        );
    }

    if (access === 'restricted') {
        return (
            <main className="ads-access-state">
                <div className="ads-access-state__icon"><LockKeyhole aria-hidden="true" /></div>
                <p className="ads-eyebrow">Employer workspace</p>
                <h1>Campaign creation is for employers</h1>
                <p>Job seekers can see sponsored content across Tutaly, but only employer accounts can fund and manage campaigns.</p>
                <Link href="/seeker" className="btn btn--primary">
                    <ArrowLeft size={18} aria-hidden="true" /> Return to your dashboard
                </Link>
            </main>
        );
    }

    const isActive = (href: string) => href === '/advertise'
        ? pathname === href
        : pathname?.startsWith(href);

    return (
        <div className="ads-shell">
            <aside className={`ads-sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Advertising navigation">
                <div className="ads-sidebar__top">
                    <Link href="/advertise" className="ads-sidebar__brand" onClick={() => setMenuOpen(false)}>
                        <Image src="/logo.png" alt="Tutaly" width={132} height={38} priority />
                        <span><Megaphone aria-hidden="true" /> Ads</span>
                    </Link>
                    <button type="button" className="ads-icon-button ads-sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
                        <X aria-hidden="true" />
                    </button>
                </div>

                <nav className="ads-sidebar__nav">
                    <p className="ads-sidebar__label">Campaign workspace</p>
                    {navigation.map((item) => (
                        <Link
                            href={item.href}
                            key={item.href}
                            className={`ads-nav-link ${isActive(item.href) ? 'is-active' : ''}`}
                            aria-current={isActive(item.href) ? 'page' : undefined}
                            onClick={() => setMenuOpen(false)}
                        >
                            <item.icon aria-hidden="true" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="ads-sidebar__footer">
                    <p>Campaigns are reviewed before they go live.</p>
                    <Link href="/employer" className="ads-sidebar__exit">
                        <LogOut aria-hidden="true" /> Employer dashboard
                    </Link>
                </div>
            </aside>

            {menuOpen && <button className="ads-sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}

            <div className="ads-main">
                <header className="ads-mobile-header">
                    <Link href="/advertise" className="ads-mobile-header__brand">
                        <Image src="/logo.png" alt="Tutaly" width={112} height={32} />
                        <span>Ads</span>
                    </Link>
                    <button type="button" className="ads-icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
                        <Menu aria-hidden="true" />
                    </button>
                </header>
                <main className="ads-content" id="main-content">{children}</main>
            </div>
        </div>
    );
}