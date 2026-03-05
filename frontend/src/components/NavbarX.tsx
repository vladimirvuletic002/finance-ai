import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";


const NavbarX = () => {
    const navigate = useNavigate();
    const {isLoggedIn, user, logoutUser} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const username = user?.name ||  user?.email || "User";
    const initials = (username?.[0] || "U").toUpperCase();

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav id="navbar">
            <div className="navLogo">
                FINANCE-AI
            </div>

            <div className="navHome" onClick={() => navigate('/')}>
                Home
            </div>

            <div className="navAbout" onClick={() => navigate('/about')}>
                About
            </div>

            <div className="navUser">
            {!user ? (
                <button className="navLoginBtn" onClick={()=> navigate("/login")}>
                    SIGN IN
                </button>
            ) : (
                <>
                <div id="userLabel"className="navUsername">{username}</div>
                <button id="LogoutBtn" className="navLogoutBtn" onClick={() => logoutUser()}>
                    LOG OUT
                </button>
                </>
            )}
            </div>

            
                <div className="navUserMenuWrapper">
                    <div className="hamburger" onClick={toggleMenu}>
                        <FaBars />
                    </div>

                {menuOpen && (
                    <div className="dropdownMenu">
                    { user ? (
                        <button className="dropdowmLogout" onClick={()=> {logoutUser(); toggleMenu();}}>
                            LOG OUT
                        </button>
                    ) : (
                        <button className="dropdowmLogin" onClick={() => {navigate('/login'); toggleMenu();}}>
                            SIGN IN
                        </button>
                    )}
                    
                        
                    </div>
                )}
                </div>
            
        </nav>
    )
};

export default NavbarX;