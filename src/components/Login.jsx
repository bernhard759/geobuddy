import React, { useState } from 'react';
import { useAuth } from '../authProvider';

const Login = () => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(email);
            alert('Check your email for the login link!');
        } catch (error) {
            alert('Error signing in ' + error.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            {/* GeoBuddy Header */}
            <header className="top-0 w-full py-6 text-center">
                <h1 className="text-6xl font-bold text-slate-800">
                    Geo<span className="text-orange-500"><i>Buddy</i></span>
                </h1>
                <div className="text-3xl text-slate-500 mt-4">Your online learning buddy for Geography knowledge</div>
            </header>

            {/* Login Form */}
            <div className="flex flex-col items-center bg-slate-100 p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Sign In</h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-72">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="p-2 border rounded"
                        required
                    />
                    <button type="submit" className="bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition">
                        Send Magic Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
