import { userState, useState } from "react"; 
import api from "../api/axios"; 
import { Link } from "react-router-dom";

function Register(){
    const [name, setName] =  useState(""); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState(""); 
    const [error, setError] = useState(""); 
    const [success, setSuccess] = useState(""); 

    const handleRegister = async (e) => {
        e.preventDefault(); 
        try { 
            const response = await api.post("/register", {name, email, password}); 
            console.log("Registration Successful:", response.data); 
            setSuccess("Registration successful! you can now login."); 
            setError(""); 
        }catch (err){ 
            console.log("ACTUAL ERROR:", err); 
            setError("Registration failed. Try a different email.");             setSuccess(""); 
        }
    }; 
    return (
        <div className="from-conatiner"> 
            <form className="form-Field" onSubmit={handleRegister}>
            <h2>Register</h2>
                <img className="images"  src="https://i.pinimg.com/736x/e0/ad/d5/e0add58005eb5130afedda3635639e4a.jpg" alt="register-image" />
                <input 
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="name"
                />
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
                <button className="registerbtn"  type="submit">Register</button>
            </form>
            <p className="register">Already have an account? <Link to="/login">Login here</Link></p>
            {error && <p style={{color: "red"}}>{error}</p>}
            {success && <p style={{color: "Green"}}>{success}</p>}
        </div>
    )
}
export default Register; 