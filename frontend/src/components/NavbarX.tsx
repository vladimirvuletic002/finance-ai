import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useState } from "react";
import { FaBars } from "react-icons/fa";
import SignOutIcon from "../assets/sign-out.svg?react";


const NavbarX = () => {
    const navigate = useNavigate();
    const {user, logoutUser} = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const username = user?.name ||  user?.email || "User";

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav id="navbar">
            <div className="navLogo" onClick={() => navigate('/')}>
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
                <div id="userLabel" className="navUsername" onClick={() => navigate('/dashboard')}>{username}</div>
                <button id="LogoutBtn" className="navLogoutBtn" onClick={() => logoutUser()} title="Log out">
                    <SignOutIcon width="18" height="18" />
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
                        <>
                        <div className="navUsername" onClick={() => navigate('/dashboard')}>{username}</div>
                        <button className="dropdownLogout" onClick={() => navigate('/dashboard')}> Dashboard </button>
                        <button className="dropdowmLogout" onClick={()=> {logoutUser(); toggleMenu();}} title="Log out">
                            <SignOutIcon width="18" height="18" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                            
                        </button>
                        </>
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