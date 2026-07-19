import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FicheFournisseur() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [selectedFournisseurId, setSelectedFournisseurId] = useState('');
    const [fournisseurActuel, setFournisseurActuel] = useState(null);
    
    const [achats, setAchats] = useState([]);
    const [paiements, setPaiements] = useState([]);

    // 1. Njibo les Fournisseurs
    useEffect(() => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/')
            .then(res => setFournisseurs(res.data.filter(t => t.type_tier === 'FOURNISSEUR')))
            .catch(err => console.error(err));
    }, []);

    // 2. Mli t3zel fournisseur, njibo ga3 li 3la9a bih
    // 2. Mli t3zel fournisseur, njibo ga3 li 3la9a bih
const handleFournisseurChange = async (e) => {
    const frsId = e.target.value;
    setSelectedFournisseurId(frsId);

    if (!frsId) {
        setFournisseurActuel(null);
        setAchats([]);
        setPaiements([]);
        return;
    }

    // N7eddo l'fournisseur li mkhtar bax n-affichiw les infos dyalo
    const frsTrouve = fournisseurs.find(f => f.id === parseInt(frsId));
    setFournisseurActuel(frsTrouve);

    try {
        // Njibo l'Achats w Nfiltriwhom b l'ID dyal fournisseur
        const resAchats = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/achats/');
        const achatsFrs = resAchats.data.filter(a => 
            a.fournisseur === parseInt(frsId) || (a.fournisseur && a.fournisseur.id === parseInt(frsId))
        );
        setAchats(achatsFrs);

        // HNA L'FIX: Njibo les Paiements w Nfiltriwhom 7ta homa b l'ID dyal fournisseur
        const resPaiements = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/');
        const paiementsFrs = resPaiements.data.filter(p => 
            p.tier === parseInt(frsId) || (p.tier && p.tier.id === parseInt(frsId))
        );
        setPaiements(paiementsFrs);

    } catch (err) {
        console.error("Mochkil f jilane dyal data:", err);
    }
};

    return (
        <div style={{ padding: '20px' }}>
            <h2>🏭 Fiche Fournisseur</h2>
            <select onChange={handleFournisseurChange} value={selectedFournisseurId} style={{ padding: '10px', width: '300px' }}>
                <option value="">-- Khtar le Fournisseur --</option>
                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>

            {fournisseurActuel && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Détails: {fournisseurActuel.nom}</h3>
                    <h4 style={{ color: fournisseurActuel.solde > 0 ? 'red' : 'green' }}>
                        Solde Actuel : {parseFloat(fournisseurActuel.solde).toFixed(2)} DH
                    </h4>

                    {/* Table Achats */}
                    <h4>Historique des Achats</h4>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {achats.map(a => {
                                // Kan7esbo total d l'achat mn les lignes dyalo (Tari9a madmouna 100%)
                                // Ila mal9ach les lignes, kayakhod montant_ttc mn la base de données
                                const totalAchat = a.lignes && a.lignes.length > 0
                                    ? a.lignes.reduce((sum, ligne) => sum + parseFloat(ligne.total || 0), 0)
                                    : parseFloat(a.montant_ttc || 0);

                                return (
                                    <tr key={a.id}>
                                        <td>{a.date_achat || 'N/A'}</td>
                                        <td style={{ fontWeight: 'bold' }}>{totalAchat.toFixed(2)} DH</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Table Paiements */}
                    <h4 style={{ marginTop: '20px' }}>Historique des Paiements (Khlas li 3tina lih)</h4>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Montant</th>

                            </tr>
                        </thead>
                        <tbody>
                            {paiements.map(p => (
                                <tr key={p.id}>
                                    <td>{p.date_paiement || 'N/A'}</td>
                                    <td style={{ color: 'red' }}>- {parseFloat(p.montant).toFixed(2)} DH</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FicheFournisseur;