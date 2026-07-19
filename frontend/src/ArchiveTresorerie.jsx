import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ArchiveTresorerie() {
    const [paiements, setPaiements] = useState([]);
    const [tiers, setTiers] = useState([]);
    const [charges, setCharges] = useState([]);
    
    // Config dyal la date
    const dateActuelle = new Date();
    const [moisSelectionne, setMoisSelectionne] = useState(dateActuelle.getMonth() + 1);
    const [anneeSelectionnee, setAnneeSelectionnee] = useState(dateActuelle.getFullYear());

    const MOIS = [
        { id: 1, nom: 'Janvier' }, { id: 2, nom: 'Février' }, { id: 3, nom: 'Mars' },
        { id: 4, nom: 'Avril' }, { id: 5, nom: 'Mai' }, { id: 6, nom: 'Juin' },
        { id: 7, nom: 'Juillet' }, { id: 8, nom: 'Août' }, { id: 9, nom: 'Septembre' },
        { id: 10, nom: 'Octobre' }, { id: 11, nom: 'Novembre' }, { id: 12, nom: 'Décembre' }
    ];

    const ANNEES = Array.from(new Array(5), (val, index) => 2024 + index);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resPaiements = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/');
                const resTiers = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/');
                setPaiements(resPaiements.data);
                setTiers(resTiers.data);

                // Njibo l'charges safely, ila makantx l'API f backend maytplantax l'code
                try {
                    const resCharges = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/charges/');
                    setCharges(resCharges.data);
                } catch (e) {
                    console.log("Mochkil wla makaynach API dyal charges:", e);
                }
            } catch (error) {
                console.error("Erreur f jiban l'data dyal trésorerie:", error);
            }
        };
        fetchData();
    }, []);

    // Helper function bax n3rfo s-smiya dyal l'client/fournisseur w l'type dyalo
    const getTierInfo = (tierId) => {
        const t = tiers.find(item => item.id === parseInt(tierId));
        return t ? { nom: t.nom, type: t.type_tier } : { nom: 'Inconnu', type: 'INCONNU' };
    };

    // --- FILTRAGE DIAL L'ENCAISSEMENTS (Client -> Type 'CLIENT') ---
    const encaissementsDuMois = paiements.filter(p => {
        const dateP = new Date(p.date_paiement || p.date || p.created_at);
        const matchesDate = (dateP.getMonth() + 1) === parseInt(moisSelectionne) && 
                            dateP.getFullYear() === parseInt(anneeSelectionnee);
        
        if (!matchesDate) return false;

        const tierInfo = typeof p.tier === 'object' ? p.tier : getTierInfo(p.tier);
        return tierInfo.type === 'CLIENT';
    });

    // --- FILTRAGE DIAL L'DECAISSEMENTS (Fournisseur -> Type 'FOURNISSEUR' + L'Charges) ---
    // 1. Paiements Fournisseurs
    const decaissementsFournisseurs = paiements.filter(p => {
        const dateP = new Date(p.date_paiement || p.date || p.created_at);
        const matchesDate = (dateP.getMonth() + 1) === parseInt(moisSelectionne) && 
                            dateP.getFullYear() === parseInt(anneeSelectionnee);
        
        if (!matchesDate) return false;

        const tierInfo = typeof p.tier === 'object' ? p.tier : getTierInfo(p.tier);
        return tierInfo.type === 'FOURNISSEUR';
    });

    // 2. Charges dyal d-dahr (L'kraya, d-daw, s-sly3a...)
    const chargesDuMois = charges.filter(c => {
        const dateC = new Date(c.date_charge || c.date || c.created_at);
        return (dateC.getMonth() + 1) === parseInt(moisSelectionne) && 
               dateC.getFullYear() === parseInt(anneeSelectionnee);
    });

    // Njm3o ga3 l'décaissements f tableau wahed mferreq
    const tousLesDecaissements = [
        ...decaissementsFournisseurs.map(df => {
            const tierInfo = typeof df.tier === 'object' ? df.tier : getTierInfo(df.tier);
            return {
                id: `p-${df.id}`,
                date: df.date_paiement || df.date || df.created_at,
                source: `Fournisseur: ${tierInfo.nom}`,
                montant: parseFloat(df.montant || 0),
                remarque: df.remarque || 'Paiement Fournisseur'
            };
        }),
        ...chargesDuMois.map(c => ({
            id: `c-${c.id}`,
            date: c.date_charge || c.date || c.created_at,
            source: `Charge: ${c.nom || c.designation || 'Dépense'}`,
            montant: parseFloat(c.montant || 0),
            remarque: c.remarque || 'Frais Généraux'
        }))
    ];

    // --- LES TOTAUX ---
    const totalEncaissements = encaissementsDuMois.reduce((acc, curr) => acc + parseFloat(curr.montant || 0), 0);
    const totalDecaissements = tousLesDecaissements.reduce((acc, curr) => acc + curr.montant, 0);
    const soldeDuMois = totalEncaissements - totalDecaissements;

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '30px', border: '1px solid #ddd' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>💰 Suivi de Trésorerie (Flux Financiers)</h2>

            {/* --- FILTER BLOCK --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Chhar :</label>
                    <select value={moisSelectionne} onChange={(e) => setMoisSelectionne(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {MOIS.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>L'3am :</label>
                    <select value={anneeSelectionnee} onChange={(e) => setAnneeSelectionnee(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* --- CARDS DYAL L'KPI --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#d4edda', borderRadius: '8px', color: '#155724', borderLeft: '5px solid #28a745' }}>
                    <span style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>📥 Total Encaissements</span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>+{totalEncaissements.toFixed(2)} DH</h2>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8d7da', borderRadius: '8px', color: '#721c24', borderLeft: '5px solid #dc3545' }}>
                    <span style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>📤 Total Décaissements</span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>-{totalDecaissements.toFixed(2)} DH</h2>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: soldeDuMois >= 0 ? '#d1ecf1' : '#fff3cd', borderRadius: '8px', color: soldeDuMois >= 0 ? '#0c5460' : '#856404', borderLeft: soldeDuMois >= 0 ? '5px solid #17a2b8' : '5px solid #ffc107' }}>
                    <span style={{ fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}>⚖️ Solde du Mois (Cash Net)</span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '28px' }}>{soldeDuMois.toFixed(2)} DH</h2>
                </div>
            </div>

            {/* --- TABLES SIDE BY SIDE --- */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* 1. TABLE DYAL L'ENCAISSEMENTS */}
                <div style={{ flex: 1, minWidth: '450px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <h3 style={{ color: '#28a745', marginTop: '0', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📥 Détail des Encaissements (Dkhla)</span>
                    </h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', borderColor: '#eee' }}>
                        <thead style={{ backgroundColor: '#28a745', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>Client</th>
                                <th>Remarque</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {encaissementsDuMois.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '15px', color: '#888' }}>Makayn 7ta dkhla msejla f had chhar.</td></tr>
                            ) : (
                                encaissementsDuMois.map(p => {
                                    const tierInfo = typeof p.tier === 'object' ? p.tier : getTierInfo(p.tier);
                                    return (
                                        <tr key={p.id}>
                                            <td>{new Date(p.date_paiement || p.date || p.created_at).toLocaleDateString('fr-FR')}</td>
                                            <td style={{ fontWeight: 'bold' }}>{tierInfo.nom}</td>
                                            <td style={{ fontStyle: 'italic', color: '#555' }}>{p.remarque || '-'}</td>
                                            <td style={{ color: '#28a745', fontWeight: 'bold', textAlign: 'right' }}>+{parseFloat(p.montant).toFixed(2)} DH</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 2. TABLE DYAL L'DECAISSEMENTS */}
                <div style={{ flex: 1, minWidth: '450px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
                    <h3 style={{ color: '#dc3545', marginTop: '0' }}>📤 Détail des Décaissements (Khrja)</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px', borderColor: '#eee' }}>
                        <thead style={{ backgroundColor: '#dc3545', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>Bénéficiaire / Motif</th>
                                <th>Type / Remarque</th>
                                <th>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tousLesDecaissements.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '15px', color: '#888' }}>Makayn 7ta khrja msejla f had chhar.</td></tr>
                            ) : (
                                tousLesDecaissements.map(d => (
                                    <tr key={d.id}>
                                        <td>{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                                        <td style={{ fontWeight: 'bold' }}>{d.source}</td>
                                        <td style={{ fontStyle: 'italic', color: '#555' }}>{d.remarque || '-'}</td>
                                        <td style={{ color: '#dc3545', fontWeight: 'bold', textAlign: 'right' }}>-{d.montant.toFixed(2)} DH</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

export default ArchiveTresorerie;