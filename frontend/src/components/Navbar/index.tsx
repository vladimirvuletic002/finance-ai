import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
  NavLogo,
  UserMenu, UserButton, Avatar, Username, UserDropdown, DropItem, DropButton,
  MobileMenu,
  MobileLink,
  MobileBtnLink,
} from "./NavbarElements";
import '../../App.css';
import { useAuth } from "../../Context/AuthContext";

const Navbar = () => {
    const { isLoggedIn, user, logoutUser } = useAuth();
    const [open, setOpen] = useState(false); // za MobileMenu (hamburger)
    const location = useLocation();
    const [userOpen, setUserOpen] = useState(false); // za desktop dropdown
    const userRef = useRef<HTMLDivElement>(null);

    // zatvori dropdown kad se promeni ruta
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // zatvori dropdown klikom van njega
  useEffect(() => {
    const onDocClick = (e: Event) => {
      if (
        userRef.current &&
        !userRef.current.contains(e.target as Node)
      ) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const username = user?.name ||  user?.email || "User";
  const initials = (username?.[0] || "U").toUpperCase();

  return (
    <>
      <Nav>
        <Bars
          onClick={() => setOpen((o) => !o)}
          aria-label="Open menu"
          aria-expanded={open}
          role="button"
        />

        <NavLogo>
          <p>FINANCE-ASSIST</p>
        </NavLogo>

        <NavMenu>
          <NavLink to="/">Home</NavLink>

          <NavLink to="/about">About</NavLink>

          {/* Second Nav */}
          {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
        </NavMenu>

        {!user ? (
          <NavBtn>
            <NavBtnLink to="/login">SIGN IN</NavBtnLink>
          </NavBtn>
        ) : (
          <UserMenu ref={userRef}>
            <UserButton
              onClick={() => setUserOpen((v) => !v)}
              aria-expanded={userOpen}
            >
              <Avatar>
                {initials}
              </Avatar>
              <Username>{username}</Username>
            </UserButton>



            <UserDropdown $open={userOpen}>
              
                  <DropItem to="/QuizManager">Moji Kvizovi</DropItem><DropItem to="/AttemptsHistory">Moji Rezultati</DropItem><DropItem to="/Live/Rooms/Join">Pridruži se sobi</DropItem>
              


              <DropButton as={Link} to="/"
                onClick={() => {
                  logoutUser();
                }}
              >
                LOG OUT
              </DropButton>
            </UserDropdown>
          </UserMenu>
        )}
      </Nav>

      {typeof MobileMenu !== "undefined" && (
        <MobileMenu $open={open}>
          <MobileLink to="/">Početna</MobileLink>
          <MobileLink to="/about">O nama</MobileLink>

          {!user ? (
            <>
              <MobileBtnLink as={Link} to="/login">Prijava</MobileBtnLink>
            </>
          ) : (
            

                  <><MobileLink to="/QuizManager">Moji Kvizovi</MobileLink><MobileLink to="/AttemptsHistory">Moji Rezultati</MobileLink><MobileLink to="/Live/Rooms/Join">Pridruži se sobi</MobileLink>
                  <MobileBtnLink as={Link} to="/" onClick={() => logoutUser()}>
                LOG OUT
              </MobileBtnLink></>
              )}
              


              
            
          
        </MobileMenu>
      )}
    </>
  );


}

export default Navbar;