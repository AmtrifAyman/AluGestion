import React, { useState } from 'react';
import axios from 'axios';


function Login({ onLoginSuccess }) {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [erreur, setErreur] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Nsifto l'username w password l'Django
            const res = await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/login/', credentials);
            
            // Ila jabhom s7a7, Django ay3tina Token (Ssarout)
            const token = res.data.access;
            
            // N-khb3o Ssarout f l'navigateur (localStorage) bax maytmsa7x ila drna Actualiser
            localStorage.setItem('access_token', token);
            
            // N-configuriw Axios bax yweli dima y-sifet had ssarout f ay demande jayya
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // N3lmo l'App bli rah dkhel mzyan
            onLoginSuccess();
            
        } catch (err) {
            setErreur('L\'Username wla l\'Password ghaltin! ❌');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' }}>
            <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '300px' }}>
                <h2 style={{ textAlign: 'center', color: '#333' }}>🔐 Connexion</h2>
                
                {erreur && <div style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{erreur}</div>}
                
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="text" 
                        placeholder="Nom d'utilisateur" 
                        required 
                        value={credentials.username}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Mot de passe" 
                        required 
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Se Connecter
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;