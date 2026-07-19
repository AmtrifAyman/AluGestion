import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ListeFournisseurs() {
    const [fournisseurs, setFournisseurs] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/api/tiers/')
            .then(res => {
                // Kanjibo gha l'Fournisseurs
                const ghaFournisseurs = res.data.filter(t => t.type_tier === 'FOURNISSEUR');
                setFournisseurs(ghaFournisseurs);
            })
            .catch(err => console.error(err));
    }, []);

    // N7esbo ch7al l'kridi total li kaysalona l'fournisseurs
    const totalDettes = fournisseurs.reduce((acc, frs) => acc + parseFloat(frs.solde || 0), 0);

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
            <h2>🏭 Liste des Fournisseurs (Dettes)</h2>
            <h4 style={{ color: '#ff8c00' }}>Total li kaysalona: {totalDettes.toFixed(2)} DH</h4>
            
            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left', marginTop: '15px' }}>
                <thead style={{ backgroundColor: '#fff3cd' }}>
                    <tr>
                        <th>Nom du Fournisseur</th>
                        <th>Téléphone</th>
                        <th>Adresse</th>
                        <th style={{ textAlign: 'right' }}>Solde (Ch7al kaysalna)</th>
                    </tr>
                </thead>
                <tbody>
                    {fournisseurs.map(frs => (
                        <tr key={frs.id}>
                            <td style={{ fontWeight: 'bold' }}>{frs.nom}</td>
                            <td>{frs.telephone || '-'}</td>
                            <td>{frs.adresse || '-'}</td>
                            <td style={{ 
                                textAlign: 'right', 
                                fontWeight: 'bold', 
                                color: frs.solde > 0 ? '#d35400' : 'green' 
                            }}>
                                {parseFloat(frs.solde || 0).toFixed(2)} DH
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListeFournisseurs;