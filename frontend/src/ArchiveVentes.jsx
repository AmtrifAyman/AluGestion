import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ArchiveVentes() {
    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    
    // N7eddo chhar w l'3am dyal lyouma f l'bedya
    const dateActuelle = new Date();
    const [moisSelectionne, setMoisSelectionne] = useState(dateActuelle.getMonth() + 1); // getMonth() kayabda mn 0
    const [anneeSelectionnee, setAnneeSelectionnee] = useState(dateActuelle.getFullYear());

    const MOIS = [
        { id: 1, nom: 'Janvier' }, { id: 2, nom: 'Février' }, { id: 3, nom: 'Mars' },
        { id: 4, nom: 'Avril' }, { id: 5, nom: 'Mai' }, { id: 6, nom: 'Juin' },
        { id: 7, nom: 'Juillet' }, { id: 8, nom: 'Août' }, { id: 9, nom: 'Septembre' },
        { id: 10, nom: 'Octobre' }, { id: 11, nom: 'Novembre' }, { id: 12, nom: 'Décembre' }
    ];

    // Liste dyal l'a3wam (mn 2024 l'3am lhali + 1)
    const ANNEES = Array.from(new Array(5), (val, index) => 2024 + index);

    useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Njibo Factures, Clients, w Paiements
            const [resFactures, resClients, resPaiements] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/api/factures/'),
                axios.get('http://127.0.0.1:8000/api/api/tiers/'),
                axios.get('http://127.0.0.1:8000/api/api/paiements/')
            ]);

            setClients(resClients.data.filter(t => t.type_tier === 'CLIENT'));

            let facturesData = resFactures.data;
            let paiementsData = resPaiements.data;

            // 2. Njm3o l'flouss li dkhlat mn 3nd kol client
            let paiementsParClient = {};
            paiementsData.forEach(p => {
                let tierId = typeof p.tier === 'object' ? p.tier.id : p.tier;
                paiementsParClient[tierId] = (paiementsParClient[tierId] || 0) + parseFloat(p.montant);
            });

            // 3. FIFO: Nstfo l'factures mn l'9dima
            facturesData.sort((a, b) => new Date(a.date_facture) - new Date(b.date_facture));

            // 4. L'Logique
            let facturesAvecFifo = facturesData.map(fac => {
                let clientId = typeof fac.client === 'object' ? fac.client.id : fac.client;
                
                // Total dyal l'facture TTC
                let totalFac = 0;
                if (fac.lignes) {
                    totalFac = fac.lignes.reduce((sum, l) => sum + (parseFloat(l.quantite) * parseFloat(l.prix_unitaire)), 0);
                }

                let reliquat = paiementsParClient[clientId] || 0;
                let montantPaye = 0;

                if (reliquat >= totalFac) {
                    montantPaye = totalFac;
                    paiementsParClient[clientId] -= totalFac; // L'client khels hadi kamla
                } else if (reliquat > 0) {
                    montantPaye = reliquat;
                    paiementsParClient[clientId] = 0; // L'client khels ghir nss awla chwiya
                }

                return { ...fac, montant_paye_calcule: montantPaye };
            });

            // 5. Nstfohom mn Jdid l'9dim bax ybano f tableau
            facturesAvecFifo.sort((a, b) => new Date(b.date_facture) - new Date(a.date_facture));
            
            setFactures(facturesAvecFifo);

        } catch (error) {
            console.error("Mochkil f jilane dyal data:", error);
        }
    };

    fetchData();
}, []);

    // Fonction bax n3rfo smiyat l'client b l'ID dyalo
    const getNomClient = (id) => {
        const clt = clients.find(c => c.id === parseInt(id));
        return clt ? clt.nom : 'Inconnu';
    };

    // Fonction bax njibo designation dyal prod ila makanch f ligne_facture direct
    const getNomProduit = (id) => {
        const prod = produits.find(p => p.id === parseInt(id));
        return prod ? prod.designation : `Produit #${id}`;
    };

    // Fonction bax n7sbo Total TTC dyal Facture wa7da (m3a Remise w TVA)
    const calculerTotalTTC = (fac) => {
        if (!fac.lignes) return 0;
        
        let totalBrut = fac.lignes.reduce((sum, ligne) => sum + (ligne.quantite * (parseFloat(ligne.prix_unitaire) || 0)), 0);
        let totalNetHT = totalBrut;
        
        // Appliqué Remise
        if (fac.type_remise === 'POURCENTAGE') {
            totalNetHT -= (totalBrut * (parseFloat(fac.valeur_remise) || 0)) / 100;
        } else if (fac.type_remise === 'MONTANT') {
            totalNetHT -= (parseFloat(fac.valeur_remise) || 0);
        }

        // Zid TVA
        let montantTVA = parseFloat(fac.montant_tva || 0);
        return totalNetHT + montantTVA;
    };

    // 1. NFILTRIW L'FACTURES 3LA 7SAB CHHAR W L'3AM
    const facturesDuMois = factures.filter(facture => {
        const dateFacture = new Date(facture.date_facture || facture.created_at);
        return (dateFacture.getMonth() + 1) === parseInt(moisSelectionne) && 
               dateFacture.getFullYear() === parseInt(anneeSelectionnee);
    });

    // 2. N7SBO L'TOTAL DYAL CHHAR KAMEL (Ventes totales)
    const totalMoisTTC = facturesDuMois.reduce((acc, fac) => acc + calculerTotalTTC(fac), 0);

    return (
        <div className="form-card">
            <h2>📅 Archive des Ventes (Mensuel)</h2>

            {/* --- FILTRAGE B CHHAR W L'3AM --- */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Mois :</label>
                    <select 
                        value={moisSelectionne} 
                        onChange={(e) => setMoisSelectionne(e.target.value)}
                        className="form-control"
                    >
                        {MOIS.map(m => (
                            <option key={m.id} value={m.id}>{m.nom}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Année :</label>
                    <select 
                        value={anneeSelectionnee} 
                        onChange={(e) => setAnneeSelectionnee(e.target.value)}
                        className="form-control"
                    >
                        {ANNEES.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
                
                {/* L'TOTAL DYAL L'MBI3AT KAYBAN LFO9 MEZIAN */}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Total Ventes (TTC) du Mois :</span>
                    <h3 className="text-success" style={{ margin: '0', fontSize: '24px' }}>{totalMoisTTC.toFixed(2)} DH</h3>
                </div>
            </div>

            {/* --- JADWAL DYAL L'ARCHIVE --- */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Détails Sl3a (Quantité x Produit)</th>
                            <th>Total TTC (DH)</th>
                            <th>Ch7al Khles (DH)</th>
                            <th>Reste (Crédit Client)</th>
                        </tr>
                    </thead>
                    <tbody>
                    {facturesDuMois.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Makayn 7ta vente msejla f had chhar.</td></tr>
                    ) : (
                        facturesDuMois.map(fac => {
                            const totalTTC = calculerTotalTTC(fac);
                            // N.B: L'flous li tkhlsat
                            const montantPaye = fac.montant_paye_calcule || 0;
                            const reste = totalTTC - montantPaye;

                            return (
                                <tr key={fac.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {fac.date_facture ? fac.date_facture.substring(0, 10) : '-'}
                                    </td>
                                    <td>
                                        {typeof fac.client === 'object' ? fac.client.nom : getNomClient(fac.client)}
                                    </td>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                                            {fac.lignes && fac.lignes.map((l, index) => (
                                                <li key={index}>
                                                    <b>{l.quantite}x</b> {l.produit_nom || getNomProduit(l.produit)}
                                                    <span style={{ color: '#666' }}> ({parseFloat(l.prix_unitaire).toFixed(2)} DH)</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{totalTTC.toFixed(2)}</td>
                                    
                                    {/* L'khalas w ch7al ba9i nsaloh */}
                                    <td style={{ color: '#28a745', fontWeight: 'bold' }}>{montantPaye.toFixed(2)}</td>
                                    <td style={{ color: reste > 0.05 ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                        {reste > 0.05 ? `${reste.toFixed(2)} DH` : 'Safi (Msalos)'}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default ArchiveVentes;