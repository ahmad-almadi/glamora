import "./Log_in.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../../../firebase";
import { jwtDecode } from "jwt-decode";

export default function Log_in() {
  const { setToken } = useAuth();
  const [email, setEmail] = useState(""); //Stores email input.
  const [password, setPassword] = useState(""); //Stores password input.
  const [error, setError] = useState(""); //Stores any login error to show to user.
  const [rememberMe, setRememberMe] = useState(false); //Checkbox for storing token in localStorage
  const [sessionExpired, setSessionExpired] = useState(false); //Shows session expired message
  const navigate = useNavigate(); //Used to redirect user after successful login

  // Check if user was redirected due to session expiration
  useEffect(() => {
    const expired = sessionStorage.getItem("sessionExpired");
    if (expired === "true") {
      setSessionExpired(true);
      sessionStorage.removeItem("sessionExpired"); // Clear the flag
    }
  }, []);

  const handleLogin = async (e) => {
    //Handle login with email/password
    e.preventDefault();
    try {
      const res = await axios.post("http://glamora.up.railway.app/login", {
        //Sends email & password to backend API /login.
        email,
        password,
        rememberMe,
      });
      const tokenFromServer = res.data.token;
      if (tokenFromServer) {
        if (rememberMe) {
          localStorage.setItem("token", tokenFromServer); //if “Remember me” checked (persists after browser close)
        } else {
          sessionStorage.setItem("token", tokenFromServer); //if not (clears after browser close)
        }
        setToken(tokenFromServer);

        try {
          const decoded = jwtDecode(tokenFromServer); //Decodes JWT token to check role: Admin → navigate to /admin Normal user → navigate to /
          if (decoded.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Token decode failed:", error);
          navigate("/");
        }
      }
    } catch (err) {
      // عرض الخطأ للمستخدم
      setError(err.response?.data?.message || "Login failed");
    }
  };
  const handleGoogleLogin = async () => {
    //Uses Firebase Google authentication.
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await axios.post("http://glamora.up.railway.app/google", {
        //Sends the Google user info to your backend /google.
        email: user.email,
        name: user.displayName,
        googleId: user.uid,
        rememberMe, // Send rememberMe flag to backend for token duration
      });
      const token = res.data.token;
      if (token) {
        // Store token based on rememberMe checkbox
        if (rememberMe) {
          localStorage.setItem("token", token); // Persists after browser close
        } else {
          sessionStorage.setItem("token", token); // Clears after browser close
        }
        setToken(token);

        try {
          const decoded = jwtDecode(token); ////Decodes JWT token to check role: Admin → navigate to /admin Normal user → navigate to /
          if (decoded.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } catch (error) {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Google auth failed:", err);
      if (err.response) {
        setError(err.response.data.message || "Login failed. Try again.");
      } else {
        setError("Login failed. Try again");
      }
    }
  };
  return (
    <>
      <div className="con d-flex justify-content-around p-5 m-5">
        <div className="form-container">
          <p className="title">Log In</p>

          <form className="form" onSubmit={handleLogin}>
            {/* Session Expired Warning */}
            {sessionExpired && (
              <div className="session-expired-alert">
                <i className="fas fa-exclamation-circle"></i>
                <span>Session expired. Please log in again.</span>
              </div>
            )}

            <input
              value={email} //prop binds the input field to the React state.
              onChange={(e) => setEmail(e.target.value)} // onChange : event handler / e.target.value : is the current value typed by the user. setEmail : updates the React state email with that value
              type="email"
              className="input"
              placeholder="Email"
              required
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="input"
              placeholder="Password"
              required
            />
            {/*  this displays error  */}
            {error && <p className="error">{error}</p>}
            <div className="remember-box d-flex align-items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember" className="m-0">
                Remember me
              </label>
            </div>

            <button className="form-btn" type="submit">
              Log in
            </button>
          </form>
          <p className="sign-up-label">
            Don't have an account?
            <Link to="/signup">
              <span className="sign-up-link">Sign up</span>
            </Link>
          </p>
          <div className="buttons-container">
            <div className="google-login-button" onClick={handleGoogleLogin}>
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                version="1.1"
                x="0px"
                y="0px"
                className="google-icon"
                viewBox="0 0 48 48"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                ></path>
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                ></path>
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                ></path>
              </svg>
              <span>Log in with Google</span>
            </div>

          </div>
        </div>
        <img
          className="my_img"
          src="./images/login.avif"
          alt="asds"
          width={500}
          height={450}
        />
      </div>
    </>
  );
}
