import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import ProfileDropdown from "./ProfileDropdown";

function Navbar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <nav>
            {/* Hamburger button */}
            <button
                className="menu-button"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                {menuOpen ? "✕" : "☰"}
            </button>

            {/* Navbar links */}
            <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
                <Link to="/dashboard" onClick={closeMenu}>
                    Dashboard
                </Link>

                <Link to="/transactions" onClick={closeMenu}>
                    Transactions
                </Link>

                <Link to="/categories" onClick={closeMenu}>
                    Categories
                </Link>

                <Link to="/budgets" onClick={closeMenu}>
                    Budgets
                </Link>

                <ProfileDropdown handleLogout={handleLogout} />
            </div>
        </nav>
    );
}

export default Navbar;