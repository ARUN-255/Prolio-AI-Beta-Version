import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Features", to: "/features" },
  { label: "For Students", to: "/students" },
  { label: "For Recruiters", to: "/recruiters" },
  { label: "Pricing", to: "/pricing" },
];

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Prolio AI home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Prolio <strong>AI</strong></span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          id="primary-navigation"
          className={`primary-nav ${menuOpen ? "is-open" : ""}`}
          aria-label="Primary navigation"
        >
          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="nav-actions">
            <Link className="button button-ghost" to="/login" onClick={closeMenu}>Log in</Link>
            <Link className="button button-primary" to="/register" onClick={closeMenu}>Get started</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default PublicHeader;
