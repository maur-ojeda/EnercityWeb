import { useState } from 'react';
import { Menu, X, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import styles from './navbar.module.css';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#' },
    { label: 'Nosotros', href: '#nosotros' },
    { 
      label: 'Soluciones', 
      href: '#servicios',
      children: [
        { label: 'Residencial', href: '#servicios' },
        { label: 'Comercial', href: '#servicios' },
        { label: 'Industrial', href: '#servicios' },
      ]
    },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className={styles.navbarHeader}>
      <div className={styles.container}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <a href="#" className={styles.logoLink}>
            <div className={styles.logoIcon}>
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className={styles.logoText}>Enercity</span>
          </a>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.label}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-sm font-medium">
                          {item.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-3 p-4">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <NavigationMenuLink asChild>
                                  <a
                                    href={child.href}
                                    className={cn(
                                      navigationMenuTriggerStyle(),
                                      "justify-start"
                                    )}
                                  >
                                    {child.label}
                                  </a>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <a href={item.href} className={cn(navigationMenuTriggerStyle(), "text-sm font-medium")}>
                          {item.label}
                        </a>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <button className={styles.ctaButton}>
              Simular ahorro hogar
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={styles.mobileMenuLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#simulador" className={styles.mobileMenuCta}>
              Simular ahorro hogar
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
