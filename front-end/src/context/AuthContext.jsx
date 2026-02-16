import { createContext, useState, useContext } from "react";

export const AuthContext = createContext(); //This creates a context object , It will hold authentication-related data like:token,setToken

export const AuthProvider = ({ children }) => { //This is a wrapper component , It wraps the app (or part of it)
  const [token, setToken] = useState( //Initializing the token
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );
  //When the app loads, it tries to: Read the token from localStorage /If not found,
  //  read it from sessionStorage ,Stores the token in React state
  return (
    // Providing the context value Makes token and setToken available 
    // Any component wrapped by AuthProvider can access them
    <AuthContext.Provider value={{ token, setToken }}> 
      {children} 
    </AuthContext.Provider>
  );
};
export function useAuth() { //This is a custom React hook , It simplifies accessing the authentication context
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default AuthContext;

//When a state value changes using useState, React re-renders the component.
//When you call setToken(), React updates the state, re-renders the AuthProvider, 
// and every component that uses the token updates automatically.
