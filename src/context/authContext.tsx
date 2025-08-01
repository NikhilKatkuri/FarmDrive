"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import firebase, { listenToAuthChanges, logout } from "../../firebase/firebase";  
import { useRouter } from "@/i18n/navigation";   
import { useTranslations, useLocale } from "next-intl"; // <--- Import useLocale

export interface authDetails {
  email: string;
  password: string;
}

export interface authScreen {
  title: string;
  desc: string;
  btnText: string;
  handle: string;
}

type AuthContextType = {
  screen: 0 | 1;
  setScreen: (value: 0 | 1) => void;
  value: string;
  _authScreen: authScreen[];
  setvalue: (value: string) => void;
  authCredientials: authDetails;
  setAuthCredientials: (authCredientials: authDetails) => void;
  login: () => Promise<void>;
  SignUp: () => Promise<void>;
  Logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const currentLocale = useLocale();  
  const t = useTranslations();
  const _authScreen: authScreen[] = [t.raw("auth.1"), t.raw("auth.2")];

  const [value, setvalue] = useState<string>("defaultValue");
  const [screen, setScreen] = useState<0 | 1>(0);
  const [authCredientials, setAuthCredientials] = useState<authDetails>({
    email: "",
    password: "",
  });

  const login = async () => {
    try {
      if (!authCredientials.email || !authCredientials.password) {
        throw new Error("Email or password is missing.");
      }

      const user = await firebase.signInWithEmailPassword(
        authCredientials.email,
        authCredientials.password
      );

      console.log("Login successful:", user.uid);
      // The useEffect will handle the redirect based on auth state
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        alert(error.message || "Login failed. Check your credentials.");
      }
    }
  };

  const Logout = async () => {
    await logout();
     
    router.replace('/', { locale: currentLocale }); // <--- Redirect to root, preserving locale
  };

  const SignUp = async () => {
    try {
      if (!authCredientials.email || !authCredientials.password) {
        throw new Error("Email or password is missing.");
      }

      const user = await firebase.signupWithEmailPassword(
        authCredientials.email,
        authCredientials.password
      );

      console.log("Signup successful:", user.uid); // Log signup successful
      // The useEffect will handle the redirect based on auth state
    } catch (error) {
      console.error("Signup error:", error); // Console error for signup
      if (error instanceof Error) {
        alert(error.message || "Signup failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((user) => {
      console.log(user ? "Signed in: " + user.uid : "Signed out");

      if (user) {
        // Corrected redirect: use `locale` option with Next.js router
        router.replace(`/user?v=${user.uid}`, { locale: currentLocale });
      } else {
         
      }
    });

    return () => unsubscribe();  
  }, [router, currentLocale]);  

  return (
    <AuthContext.Provider
      value={{
        value,
        setvalue,
        screen,
        setScreen,
        _authScreen,
        authCredientials,
        setAuthCredientials,
        login,
        SignUp,
        Logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within a AuthContextProvider");
  return context;
};