// src/pages/Login.js

import { useState } from 'react';
import Button from '../components/Button';
import './Login.css';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="login-container">
            <div className='login-form'>
                <div className="login-form-head">
                    <h1>Dhindu Admin</h1>
                </div>
                <div className="login-form-body">
                    <InputField
                        label="Email/Username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter email/username"
                        required
                    />
                    <InputField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                    />
                    <button className='forgot-password'>Forgot Password</button>
                    <GradientButton>Login</GradientButton>
                </div>
            </div>
            <div className="contact-btn-container">
                <Button className="">Contact Us</Button>
            </div>
        </div>
    )
}

export default Login;