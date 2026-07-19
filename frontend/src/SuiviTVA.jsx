import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SuiviTVA() {
    const [factures, setFactures] = useState([]);
    const [achats, setAchats] = useState([]);
    const [tiers, setTiers] = useState([]);
    const [parametres, setParametres] = useState(null);
    
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
                const resFactures = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/factures/');
                const resAchats = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/achats/');
                const resTiers = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/');
                const resParams = await axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/parametres/');

                setFactures(resFactures.data);
                setAchats(resAchats.data);
                setTiers(resTiers.data);
                if (resParams.data.length > 0) setParametres(resParams.data[0]);
            } catch (error) {
                console.error("Mochkil f jiban dyal data TVA:", error);
            }
        };
        fetchData();
    }, []);

    const getNomTier = (id) => {
        const t = tiers.find(tier => tier.id === parseInt(id));
        return t ? t.nom : 'Inconnu';
    };

    // --- 1. TVA FACTURÉE (Ventes) ---
    const tvaFactureeMois = factures.filter(f => {
        const dateF = new Date(f.date_facture || f.created_at);
        const matchesDate = (dateF.getMonth() + 1) === parseInt(moisSelectionne) && dateF.getFullYear() === parseInt(anneeSelectionnee);
        // Kanjbdo gha li fihom TVA (avec_tva = true wla montant_tva > 0)
        return matchesDate && (f.avec_tva === true || parseFloat(f.montant_tva) > 0);
    });

    const totalTVAFacturee = tvaFactureeMois.reduce((acc, f) => acc + parseFloat(f.montant_tva || 0), 0);

    // --- 2. TVA RÉCUPÉRABLE (Achats) ---
    const tvaRecuperableMois = achats.filter(a => {
        const dateA = new Date(a.date_achat || a.created_at);
        const matchesDate = (dateA.getMonth() + 1) === parseInt(moisSelectionne) && dateA.getFullYear() === parseInt(anneeSelectionnee);
        // N.B: Khas tkon 3ndk 'montant_tva' wla 'avec_tva' mseyvya f l'achats dyalek
        return matchesDate && (a.avec_tva === true || parseFloat(a.montant_tva) > 0);
    });

    const totalTVARecuperable = tvaRecuperableMois.reduce((acc, a) => acc + parseFloat(a.montant_tva || 0), 0);

    // --- 3. TVA DUE (TVA li ghatkhles l'dwla) ---
    const tvaDue = totalTVAFacturee - totalTVARecuperable;

    // Ila kan système TVA ma-activéch ga3 f les paramètres
    if (parametres && parametres.tva_vente_mode === 'NON') {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', marginTop: '20px' }}>
                <h3>⚠️ L'TVA m-désactiviya f l'paramètres.</h3>
                <p>Bax tkhdem b had l'interface, khassek t-activi l'TVA (Mode MIXTE wla OUI) f l'paramètres dyal l'application.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginTop: '30px', border: '1px solid #ced4da' }}>
            <h2 style={{ color: '#343a40', borderBottom: '2px solid #6c757d', paddingBottom: '10px' }}>📊 Déclaration & Suivi de la TVA</h2>

            {/* --- FILTER --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Période (Mois) :</label>
                    <select value={moisSelectionne} onChange={(e) => setMoisSelectionne(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {MOIS.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Année :</label>
                    <select value={anneeSelectionnee} onChange={(e) => setAnneeSelectionnee(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
            </div>

            {/* --- KPI CARDS (Calcul dyal TVA) --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#cce5ff', borderRadius: '8px', color: '#004085', borderLeft: '5px solid #007bff' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>TVA Facturée (Classe 4455)</span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '26px' }}>{totalTVAFacturee.toFixed(2)} DH</h2>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#e2e3e5', borderRadius: '8px', color: '#383d41', borderLeft: '5px solid #6c757d' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>TVA Récupérable (Classe 3455)</span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '26px' }}>{totalTVARecuperable.toFixed(2)} DH</h2>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: tvaDue > 0 ? '#f8d7da' : '#d4edda', borderRadius: '8px', color: tvaDue > 0 ? '#721c24' : '#155724', borderLeft: tvaDue > 0 ? '5px solid #dc3545' : '5px solid #28a745' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {tvaDue > 0 ? 'TVA Due (À payer - 4456)' : 'Crédit de TVA (3456)'}
                    </span>
                    <h2 style={{ margin: '10px 0 0 0', fontSize: '26px' }}>{Math.abs(tvaDue).toFixed(2)} DH</h2>
                </div>
            </div>

            {/* --- DETAILS TABLES --- */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* 1. TABLE TVA FACTURÉE */}
                <div style={{ flex: 1, minWidth: '450px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #b8daff' }}>
                    <h3 style={{ color: '#007bff', marginTop: '0' }}>📈 Détail TVA Facturée (Ventes)</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px', borderColor: '#b8daff' }}>
                        <thead style={{ backgroundColor: '#007bff', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>N° Facture</th>
                                <th>Client</th>
                                <th>Montant TVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tvaFactureeMois.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Makayn 7ta facture fih TVA f had chhar.</td></tr>
                            ) : (
                                tvaFactureeMois.map(f => (
                                    <tr key={f.id}>
                                        <td>{f.date_facture ? f.date_facture.substring(0, 10) : '-'}</td>
                                        <td>{f.numero_facture || `F-${f.id}`}</td>
                                        <td style={{ fontWeight: 'bold' }}>{typeof f.client === 'object' ? f.client.nom : getNomTier(f.client)}</td>
                                        <td style={{ color: '#007bff', fontWeight: 'bold', textAlign: 'right' }}>{parseFloat(f.montant_tva).toFixed(2)} DH</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 2. TABLE TVA RÉCUPÉRABLE */}
                <div style={{ flex: 1, minWidth: '450px', backgroundColor: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #d6d8db' }}>
                    <h3 style={{ color: '#6c757d', marginTop: '0' }}>📉 Détail TVA Récupérable (Achats)</h3>
                    <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13px', borderColor: '#d6d8db' }}>
                        <thead style={{ backgroundColor: '#6c757d', color: '#fff' }}>
                            <tr>
                                <th>Date</th>
                                <th>N° Achat/Facture</th>
                                <th>Fournisseur</th>
                                <th>Montant TVA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tvaRecuperableMois.length === 0 ? (
                                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Makayn 7ta achat fih TVA f had chhar.</td></tr>
                            ) : (
                                tvaRecuperableMois.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.date_achat ? a.date_achat.substring(0, 10) : '-'}</td>
                                        <td>{a.numero_facture || `A-${a.id}`}</td>
                                        <td style={{ fontWeight: 'bold' }}>{typeof a.fournisseur === 'object' ? a.fournisseur.nom : getNomTier(a.fournisseur)}</td>
                                        <td style={{ color: '#6c757d', fontWeight: 'bold', textAlign: 'right' }}>{parseFloat(a.montant_tva).toFixed(2)} DH</td>
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

export default SuiviTVA;