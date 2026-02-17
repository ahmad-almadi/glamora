import "./Sign_up.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import {
  auth,
  provider,
  signInWithPopup,
} from "../../../firebase";

export default function Sign_up() {
  const { setToken } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function validatePassword(password, confirmPassword) {
    if (password.length < 6) return "Password must be at least 6 characters"; //Min 6 characters.
    if (!/[A-Z]/.test(password)) // /[A-Z] regular expression (regex) /.test(password) → a method that checks if the string contains a match
      return "Password must contain at least one uppercase letter"; //At least one uppercase, lowercase, number, and special character.
    if (!/[a-z]/.test(password))
      return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(password))
      return "Password must contain at least one special character (!@#$%^&*)";
    if (password !== confirmPassword) return "Passwords do not match"; //Password and confirm password must match.
    return null;
  }
  const handleSignup = async (e) => {
    e.preventDefault(); //stops the browser’s default behavior.
    try {
      const error = validatePassword(password, confirmPassword);
      if (error) { //Runs password validation before sending request.
        setError(error);
        return;
      }
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "https://glamora.up.railway.app"}/signup`, {
        name,
        email,
        password,
      });
      const token = res.data.token;
      if (token) {
        sessionStorage.setItem("token", token);
        setToken(token);
        navigate("/");
      }
    } catch (err) {
      console.error("Signup failed:", err); // for developer
      setError(
        err.response?.data?.message || "Signup failed. Please try again.", //for user
      );
    }
  };
  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "https://glamora.up.railway.app"}/google`, {
        email: user.email,
        name: user.displayName,
        googleId: user.uid,
      });
      const token = res.data.token;
      if (token) {
        sessionStorage.setItem("token", token);
        setToken(token);
        navigate("/");
      }
      navigate("/");
    } catch (err) {
      console.error("Signup failed:", err); // for developer
      setError("Signup failed. Please try again");
    }
  };
  return (
    <>
      <div className="con d-flex justify-content-around p-5 m-5">
        <div className="full form-container">
          <p className="title">Create Account</p>
          <form className="form" onSubmit={handleSignup}>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              type="text"
              className="input"
              placeholder="UserName"
              required
            />

            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              type="email"
              className="input"
              placeholder="Email"
              required
            />
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              type="password"
              className="input"
              placeholder="Password"
              required
            />
            <input
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              type="password"
              className="input"
              placeholder="Confirm Password"
              required
            />
            {/* this display errors*/}
            {error && <p className="error">{error}</p>}
            <button className="form-btn " type="submit">
              Create Account
            </button>
          </form>
          <p className="sign-up-label">
            Already Created?
            <Link to="/login">
              <span className="sign-up-link">Login Here</span>
            </Link>
          </p>
          <div className="buttons-container">
            <div className="google-login-button" onClick={handleGoogleSignUp}>
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
              <span>Sign up with Google</span>
            </div>
           
          </div>
        </div>
        <img
          className="my_img"
          src="./images/login.avif"
          alt="asds"
          width={500}
          height={550}
        />
      </div>
    </>
  );
}
