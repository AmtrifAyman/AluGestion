import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FicheClient() {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clientActuel, setClientActuel] = useState(null);
    
    const [factures, setFactures] = useState([]);
    const [paiements, setPaiements] = useState([]);

    // 1. Njibo l'Kliyan f l'bedya
    useEffect(() => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/')
            .then(res => setClients(res.data.filter(t => t.type_tier === 'CLIENT')))
            .catch(err => console.error(err));
    }, []);

    // 2. Mli t3zel chi client, njibo l'historique dyalo
    const handleClientChange = async (e) => {
        const clientId = e.target.value;
        setSelectedClientId(clientId);

        if (!clientId) {
            setClientActuel(null);
            setFactures([]);
            setPaiements([]);
            return;
        }

        // N7eddo l'client li mkhtar bax n-affichiw smiyto w solde dyalo
        const clientTrouve = clients.find(c => c.id === parseInt(clientId));
        setClientActuel(clientTrouve);

        try {
            // Njibo ga3 les factures w les paiements mn l'API
            const resFactures = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/factures/');
            const resPaiements = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/');

            // N-filtriw gha dyal had l'client (Kandiro typeof bax ntfadaw mochkil ila kan l'backend kaysifet l'objet kaml wla gha l'ID)
            const clientFactures = resFactures.data.filter(f => 
                (typeof f.client === 'object' ? f.client.id : f.client) === parseInt(clientId)
            );
            
            const clientPaiements = resPaiements.data.filter(p => 
                (typeof p.tier === 'object' ? p.tier.id : p.tier) === parseInt(clientId)
            );

            setFactures(clientFactures);
            setPaiements(clientPaiements);
        } catch (error) {
            console.error("Mochkil f jiban dyal l'historique", error);
        }
    };

    // Fonction sghira bax t7seb l'total dyal l'facture mn les lignes
    const calculerTotalFacture = (lignes) => {
        if (!lignes) return 0;
        return lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', marginTop: '20px' }}>
            <h2>📋 Fiche Client (Historique)</h2>
            
            {/* --- KHTIYAR L'CLIENT --- */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Choisir un client :</label>
                <select 
                    value={selectedClientId} 
                    onChange={handleClientChange} 
                    style={{ padding: '10px', minWidth: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                    <option value="">-- Sélectionnez un client --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                </select>
            </div>

            {/* --- AFFICHAGE DYAL L'HISTORIQUE ILA KAN CHI CLIENT MKHTAR --- */}
            {clientActuel && (
                <div style={{ borderTop: '2px dashed #ccc', paddingTop: '20px' }}>
                    
                    {/* EN-TETE CLIENT */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>👤 {clientActuel.nom}</h3>
                            <p style={{ margin: '0' }}>📞 {clientActuel.telephone || 'N/A'} | 📍 {clientActuel.adresse || 'N/A'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '14px', color: '#666' }}>Reste à payer (Solde)</span>
                            <h2 style={{ margin: '5px 0 0 0', color: clientActuel.solde > 0 ? '#dc3545' : '#28a745' }}>
                                {parseFloat(clientActuel.solde || 0).toFixed(2)} DH
                            </h2>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        
                        {/* JADWAL DYAL LES FACTURES (VENTES) */}
                        <div style={{ flex: '1', minWidth: '400px' }}>
                            <h4 style={{ color: '#007bff' }}>🛒 Historique des Ventes (Factures)</h4>
                            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#e9ecef' }}>
                                    <tr>
                                        <th>Date</th>
                                        <th>N° Facture</th>
                                        <th>Total TTC (DH)</th>
                                        <th>Détails</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factures.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucune facture l'had l'client.</td></tr>
                                    ) : (
                                        factures.map(f => (
                                            <tr key={f.id}>
                                                <td>{f.date_facture || '-'}</td>
                                                <td style={{ fontWeight: 'bold' }}>FAC-{f.id}</td>
                                                <td style={{ fontWeight: 'bold', color: '#007bff' }}>{parseFloat(f.montant_ttc || 0).toFixed(2)}</td>
                                                <td>
                                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                                                        {f.lignes && f.lignes.map((l, index) => (
                                                            <li key={index}>{l.quantite}x (Produit N°{l.produit})</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* JADWAL DYAL LKHALAS (PAIEMENTS) */}
                        <div style={{ flex: '1', minWidth: '400px' }}>
                            <h4 style={{ color: '#28a745' }}>💰 Historique des Paiements</h4>
                            <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: '#d4edda' }}>
                                    <tr>
                                        <th>Date</th>
                                        <th>Montant (DH)</th>
                                        <th>Mode</th>
                                        <th>Réf / Remarque</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paiements.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucun paiement mssjel.</td></tr>
                                    ) : (
                                        paiements.map(p => (
                                            <tr key={p.id}>
                                                <td>{p.date_paiement || p.date || '-'}</td>
                                                <td style={{ fontWeight: 'bold', color: '#28a745' }}>+ {parseFloat(p.montant).toFixed(2)}</td>
                                                <td>{p.mode_paiement}</td>
                                                <td>{p.reference || p.remarque || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

export default FicheClient;