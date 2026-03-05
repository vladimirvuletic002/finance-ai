import { FaBars } from "react-icons/fa";
import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: rgb(8, 75, 75);
    height: 70px;
    display: flex;
    position: sticky;
    box-shadow: 1px 5px 10px rgba(0, 0, 0, 0.5);
    top: 0;
    align-items: center;
    font-size: 12px;
    justify-content: space-between;
    /*padding: 0.2rem calc((100vw - 1000px) / 2); */
    padding: 0 16px;
    z-index: 12;
    /* Third Nav */
    /* justify-content: flex-start; */
`;

export const NavLogo = styled.div`
    display: flex;
    align-items: center;
    text-align: left;
    margin-right: 10px;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5);
    font-size: 14px;
    font-weight: bold;
    color: #07b0b0ff;
    height: 26%;
    background-color: #002e2eff;
    border-radius: 5px;
    padding: 10px;
    justify-content: center;
    font-style: italic;
    /* Third Nav */
    /* justify-content: flex-end;
  width: 100vw; */
    
`;

export const NavLink = styled(Link)`
    color: #07b0b0ff;
    min-width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: left;
    text-decoration: none;
    padding: 0 1rem;
    hright: 100%;
    cursor: pointer;
    /*&.active {
        color: #000000;
        background: #8882ffff;
        height: 100%;
    } */
    &:hover {
        transition: all 0.2s ease-in-out;
        color: white;
        height: 100%;
    }
`;

export const Bars = styled(FaBars)`
    display: none;
    height: 100%;
    color: #808080;
    @media screen and (max-width: 450px) {
        display: block;
        position: absolute;
        top: 0;
        right: 0;
        transform: translate(-100%, 1%);
        font-size: 1.8rem;
        cursor: pointer;
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    white-space: nowrap;
    /* Second Nav */
    /* margin-right: 24px; */
    /* Third Nav */
    /* width: 100vw;
  white-space: nowrap; */
    @media screen and (max-width: 500px) {
        display: none;
    }
`;

export const NavBtn = styled.nav`
    display: flex;
    align-items: center;
    margin-left: auto;
    /* Third Nav */
    /* justify-content: flex-end;
  width: 100vw; */
    @media screen and (max-width: 450px) {
        display: none;
    }
`;

export const NavBtnLink = styled(Link)`
    border-radius: 4px;
    background: #002e2eff;
    padding: 10px 22px;
    color: white;
    outline: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    text-decoration: none;
    /* Second Nav */
    margin-left: 24px;
    &:hover {
        transition: all 0.2s ease-in-out;
        background: #fff;
        color: #808080;
    }
`;

//kada se korisnik uloguje
export const UserMenu = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  margin-left: auto; /* gura ka desnoj ivici ako treba */

  @media (max-width: 450px) {
    display: none;
  }
`;

export const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  font-weight: 500;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.35);
  padding: 8px 12px;
  border-radius: 9999px;
  cursor: pointer;
`;

export const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: grid;
  place-items: center;
  font-weight: 700;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;        
    display: block;
  }
`;

export const Username = styled.span`
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserDropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  max-width: 200px;
  background: rgb(8, 75, 75);
  color: #07b0b0ff;
  border-radius: 10px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.18);
  padding: 8px;
  z-index: 20;

  visibility: ${({ $open }) => ($open ? "visible" : "hidden")};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: translateY(${({ $open }) => ($open ? "0" : "-6px")});
  transition: opacity .15s ease, transform .15s ease, visibility .15s ease;
`;

export const DropItem = styled(Link)`
  display: block;
  padding: 10px 12px;
  color: #07b0b0ff;
  text-align: center;
  text-decoration: none;
  border-radius: 8px;
  
  &:hover { background: #002e2eff; color: white; }
`;

export const DropButton = styled.button`
  display: block;
  
  text-align: center;
  text-decoration: none;
  color: red;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover { background: #002e2eff; color: white;}
`;

//za responsive
export const MobileMenu = styled.div<{ $open: boolean }>`
  
position: fixed;
  top: 70px;         /* ispod navbara */
  left: 0;
  right: 0;
  background: #6963d4ff;
  border-top: 1px solid rgba(255,255,255,0.15);
  z-index: 11;
  justify-content: center;
  justify-items: center;
  text-align: center;
  border-radius: 5px;
  box-shadow: 1px 7px 10px rgba(0, 0, 0, 0.5);

  /* SCROLL */
  /* opcija A: max-visina + overflow */
  max-height: calc(100dvh - 70px);         /* moderni viewport unit */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;        /* iOS glatko skrolovanje */
  overscroll-behavior: contain;             /* ne propagira scroll pozadini */
  scrollbar-gutter: stable;                 /* spreči skakutanje pri pojavi scrolla */
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);

  /* (fallback ako 100dvh nije podržan) */
  @supports not (height: 100dvh) {
    max-height: calc(100vh - 70px);
  }

  /* animacija prikaza */
  transform: ${({ $open }) => ($open ? 'translateY(0)' : 'translateY(-8px)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  transition: transform .2s ease, opacity .2s ease, visibility .2s ease;

  padding: 10px;
  display: none;

  @media screen and (max-width: 450px) {
    display: block;
  }

  
`;

export const MobileLink = styled(Link)`
  display: block;
  width: 80%;
  padding: 12px 8px;
  text-decoration: none;
  color: white;
  border-radius: 6px;

  &.active {
    color: #000000;
    background: #8882ffff;
  }

  &:hover {
    background: #8882ffff;
    color: #000000;
  }
`;

export const MobileBtnLink = styled(Link)`
  display: block;
  width: 80%;
  text-align: center;
  margin-top: 8px;
  border-radius: 6px;
  background: #124eb6ff;
  padding: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #fff;
    color: #808080;
  }
`;