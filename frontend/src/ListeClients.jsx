import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ListeClients() {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/')
            .then(res => {
                // Kanjibo gha l'Kliyan (CLIENT)
                const ghaKliyan = res.data.filter(t => t.type_tier === 'CLIENT');
                setClients(ghaKliyan);
            })
            .catch(err => console.error(err));
    }, []);

    // N7esbo ch7al l'kridi total li 3nd l'kliyan kamlin
    const totalCredits = clients.reduce((acc, client) => acc + parseFloat(client.solde || 0), 0);

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
            <h2>👥 Liste des Clients (Kridiyat)</h2>
            <h4 style={{ color: '#dc3545' }}>Total kridiyat 3la l'kliyan: {totalCredits.toFixed(2)} DH</h4>
            
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', marginTop: '15px' }}>
                <thead style={{ backgroundColor: '#e9ecef' }}>
                    <tr>
                        <th>Nom du Client</th>
                        <th>Téléphone</th>
                        <th>Adresse</th>
                        <th style={{ textAlign: 'right' }}>Solde (Ch7al kansaloh)</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td style={{ fontWeight: 'bold' }}>{client.nom}</td>
                            <td>{client.telephone || '-'}</td>
                            <td>{client.adresse || '-'}</td>
                            <td style={{ 
                                textAlign: 'right', 
                                fontWeight: 'bold', 
                                color: client.solde > 0 ? 'red' : 'green' 
                            }}>
                                {parseFloat(client.solde || 0).toFixed(2)} DH
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListeClients;