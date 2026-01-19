import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X, UserCircle, SignOut } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-Auth";
import logo from "@/assets/tradeomen-logo.png";

// ✅ 1. Filter Links: Hide Pricing & FAQ in Production, Show in Localhost
const navLinks = [
  { label: "Features", href: "/#features", type: "hash" },
  { label: "Demo", href: "/#demo", type: "hash" },
  ...(import.meta.env.DEV ? [
    { label: "Pricing", href: "/pricing", type: "route" },
    { label: "FAQ", href: "/pricing#faq", type: "route" },
  ] : []),
  { label: "About", href: "/about", type: "route" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, signOut } = useAuth(); // Hook into auth state
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, type: string) => {
    setIsMobileMenuOpen(false);
    
    if (type === 'hash') {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(targetId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // ✅ 2. Dynamic Button Text: "Get Started" (Local) vs "Join Beta Free" (Prod)
  const ctaText = import.meta.env.DEV ? "Get Started" : "Join Beta Free";

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass-nav py-3" : "bg-transparent py-4"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="TradeOmen"
                className="h-9 sm:h-10 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.type === 'route' ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === link.href 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.type)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>

            {/* Desktop CTAs - Conditional Rendering */}
            <div className="hidden lg:flex items-center gap-4">
              {session ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <UserCircle size={20} />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => signOut()}
                    className="text-sm font-medium text-red-400/80 hover:text-red-400 transition-colors flex items-center gap-2"
                  >
                    <SignOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/auth?mode=signup"
                    className="glow-button px-5 py-2.5 rounded-full text-sm font-medium text-primary-foreground"
                  >
                    {ctaText}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-foreground"
            >
              <List size={24} weight="bold" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-card border-l border-border z-50 lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8">
                  <img src={logo} alt="TradeOmen" className="h-8" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-foreground"
                  >
                    <X size={24} weight="bold" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    link.type === 'route' ? (
                      <Link
                        key={link.label}
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                          location.pathname === link.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href, link.type)}
                        className="px-4 py-3 rounded-xl text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        {link.label}
                      </a>
                    )
                  ))}
                </div>
                <div className="mt-auto flex flex-col gap-3">
                  {session ? (
                    <>
                      <Link 
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-3 text-center font-medium text-foreground border border-border rounded-xl hover:bg-secondary transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                      <button 
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-3 text-center font-medium text-red-400 bg-red-400/5 rounded-xl border border-red-400/20"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/auth"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-3 text-center font-medium text-foreground border border-border rounded-xl hover:bg-secondary transition-colors"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/auth?mode=signup"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="glow-button w-full py-3 text-center font-medium text-primary-foreground rounded-xl"
                      >
                        {ctaText}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}