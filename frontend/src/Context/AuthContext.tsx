import React, { useContext, useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import type { LoginPayload, RegisterPayload, UserProfile } from "../models/Auth";
import { loginApi, registerApi } from "../services/AuthService";
import { toast } from "react-toastify";
import axios from "axios";
import { isTokenExpired } from "../helpers/jwt";

type UserContextType = {
    user: UserProfile | null;
    token: string | null;
    registerUser: (payload: RegisterPayload) => void;
    loginUser: (payload: LoginPayload) => void;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
}

type Props = {
    children: React.ReactNode;
}

const AuthContext = createContext<UserContextType>({} as UserContextType);

export const AuthProvider = ({ children }: Props) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);
    const navigate = useNavigate();

    const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if(storedUser && storedToken){
            if(isTokenExpired(storedToken)){
                clearAuth();
            }
            else{

            
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            axios.defaults.headers.common["Authorization"] = "Bearer " + storedToken;
            }
        }

        setIsReady(true);

    }, []); // only renders once

    // whenever token changes, keep axios in sync
  useEffect(() => {
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }, [token]);

    const registerUser = async(payload: RegisterPayload) => {
        await registerApi(payload).then((res) => {
            if(res){
                localStorage.setItem("token", res?.data.token);
                const userObj = {
                    id: res?.data.user.id,
                    name: res?.data.user.name,
                    email: res?.data.user.email
                }

                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(res?.data.token!);
                setUser(userObj!);
                toast.success("Login Successful!");
                navigate("/");
            }
        }).catch((err) => toast.warning("Server error occured"));
    }

    const loginUser = async(payload: LoginPayload) => {
        await loginApi(payload).then((res) => {
            if(res){
                localStorage.setItem("token", res?.data.token);
                const userObj = {
                    id: res?.data.user.id,
                    name: res?.data.user.name,
                    email: res?.data.user.email
                }

                localStorage.setItem("user", JSON.stringify(userObj));
                setToken(res?.data.token!);
                setUser(userObj!);
                toast.success("Login Successful!");
                navigate("/");
            }
        }).catch((err) => toast.warning("Serve error occured"));
    }

    const isLoggedIn = () => {
        if (!token || !user) return false;
        return !isTokenExpired(token);
    }

    const logoutUser = () => {
        clearAuth();
        navigate("/");
    }

    return (
        <AuthContext.Provider value={{loginUser, user, token, logoutUser, registerUser, isLoggedIn}}>
            {isReady ? children : null}
        </AuthContext.Provider>
    )

}

export const useAuth = () => useContext(AuthContext);