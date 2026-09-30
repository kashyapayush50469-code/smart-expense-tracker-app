import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPopup, setShowPopup] = useState(true);
    const navigate = useNavigate(); 


    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Button clicked, function started");
        try {
            const response = await api.post("/login", { email, password });
            console.log("Login successful:", response.data);
            localStorage.setItem("token", response.data.access_token);
            navigate("/dashboard")
        } catch (err) {
            console.log("ACTUAL ERROR:", err);
            setError("Invalid email or password");
        }
    };

    const popup = () => {
        if (!showPopup) return null;
        return (
            <div className="popup">
                <button
                    type="button"
                    className="popup-close"
                    onClick={() => setShowPopup(false)}
                >
                    ✕
                </button>

                <strong style={{marginTop:"25px"}}>if you haven't an account.then, you need to create account.go to the register page.after creating an account.then you will able to log in.otherwise, you will get an error
                    "Invalid email or password."
                </strong>
                <p><b>Thank, you!</b></p>
            </div>
        );

    };

    return (
        <div>
            <div className="from-conatiner">
                <form  className="form-Field" onSubmit={handleLogin}> 
                    <h2>Login</h2>
                    <img className="images" src="public-images/login-image-2.png" alt="login-image" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="email"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="password1"
                    />
                    <button className="loginbtn" type="submit">Login</button>
                </form>
                {popup()}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p className="account">Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
        </div>
    );
}

export default Login;