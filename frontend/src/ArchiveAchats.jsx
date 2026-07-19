import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ArchiveAchats() {
    const [achats, setAchats] = useState([]);
    const [fournisseurs, setFournisseurs] = useState([]);
    
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

    // N9addo liste dyal l'a3wam (mn 2024 l'3am lhali + 1)
    const ANNEES = Array.from(new Array(5), (val, index) => 2024 + index);

    useEffect(() => {
    const fetchData = async () => {
        try {
            // 1. Njibo ga3 les données (Achats, Fournisseurs, w Paiements)
            const [resAchats, resFournisseurs, resPaiements] = await Promise.all([
                axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/achats/'),
                axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/'),
                axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/')
            ]);

            setFournisseurs(resFournisseurs.data.filter(t => t.type_tier === 'FOURNISSEUR'));

            let achatsData = resAchats.data;
            let paiementsData = resPaiements.data;

            // 2. Njm3o ch7al khellesna kol fournisseur f total (Grouping)
            let paiementsParFrs = {};
            paiementsData.forEach(p => {
                let tierId = typeof p.tier === 'object' ? p.tier.id : p.tier;
                paiementsParFrs[tierId] = (paiementsParFrs[tierId] || 0) + parseFloat(p.montant);
            });

            // 3. Nstfo les achats mn L9DIMA l'JDIDA bax nطبقo FIFO
            achatsData.sort((a, b) => new Date(a.date_achat) - new Date(b.date_achat));

            // 4. L'Logique dyal FIFO
            let achatsAvecFifo = achatsData.map(achat => {
                let frsId = typeof achat.fournisseur === 'object' ? achat.fournisseur.id : achat.fournisseur;
                
                // N7sbo Total dyal had l'achat
                let totalAchat = 0;
                if (achat.lignes) {
                    totalAchat = achat.lignes.reduce((sum, l) => sum + (parseFloat(l.quantite) * parseFloat(l.prix_unitaire)), 0);
                }

                // Ch7al ba9i 3nd had l'fournisseur dyal l'flouss li dfa3na lih
                let reliquat = paiementsParFrs[frsId] || 0;
                let montantPaye = 0;

                if (reliquat >= totalAchat) {
                    montantPaye = totalAchat;
                    paiementsParFrs[frsId] -= totalAchat; // N9so mn l'flouss li 3tinah
                } else if (reliquat > 0) {
                    montantPaye = reliquat;
                    paiementsParFrs[frsId] = 0; // Tqadaw l'flouss li dfa3na
                }

                // Nraj3o l'achat w nziydo fih wa7d champ jdid: montant_paye_calcule
                return { ...achat, montant_paye_calcule: montantPaye };
            });

            // 5. N3awdo nstfohom mn l'JDIDA l'9DIMA bax ybano f l'affichage mzyan
            achatsAvecFifo.sort((a, b) => new Date(b.date_achat) - new Date(a.date_achat));
            
            setAchats(achatsAvecFifo);

        } catch (error) {
            console.error("Mochkil f jilane dyal data:", error);
        }
    };

    fetchData();
}, []);

    // Fonction bax n3rfo smiyat l'fournisseur b l'ID dyalo
    const getNomFournisseur = (id) => {
        const frs = fournisseurs.find(f => f.id === parseInt(id));
        return frs ? frs.nom : 'Inconnu';
    };

    // Fonction bax n7sbo Total dyal facture wa7da
    const calculerTotalAchat = (lignes) => {
        if (!lignes) return 0;
        return lignes.reduce((acc, ligne) => acc + (ligne.quantite * (ligne.prix_unitaire || ligne.prix_achat || 0)), 0);
    };

    // 1. NFILTRIW L'ACHATS 3LA 7SAB CHHAR W L'3AM
    const achatsDuMois = achats.filter(achat => {
        // L'backend ghadi ysifet lik date_facture wla date_achat
        const dateAchat = new Date(achat.date_achat || achat.created_at);
        return (dateAchat.getMonth() + 1) === parseInt(moisSelectionne) && 
               dateAchat.getFullYear() === parseInt(anneeSelectionnee);
    });

    // 2. N7SBO L'TOTAL DYAL CHHAR KAMEL
    const totalMoisHT = achatsDuMois.reduce((acc, achat) => acc + calculerTotalAchat(achat.lignes), 0);

    return (
        <div className="form-card">
            <h2>📅 Archive des Achats (Mensuel)</h2>

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
                
                {/* L'TOTAL KAYBAN LFO9 KBEER */}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Total Achats du Mois :</span>
                    <h3 className="text-danger" style={{ margin: '0', fontSize: '24px' }}>{totalMoisHT.toFixed(2)} DH</h3>
                </div>
            </div>

            {/* --- JADWAL DYAL L'ARCHIVE --- */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Fournisseur</th>
                            <th>Détails (Sl3a)</th>
                            <th>Total Achat (DH)</th>
                            <th>Payé (DH)</th>
                            <th>Reste (Crédit)</th>
                        </tr>
                    </thead>
                    <tbody>
                    {achatsDuMois.length === 0 ? (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Makayn 7ta achat f had chhar.</td></tr>
                    ) : (
                        achatsDuMois.map(achat => {
                            const totalAchat = calculerTotalAchat(achat.lignes);
                            // N.B: Ila kant 'montant_paye' makatjix mn l'backend, gha n3tiwha 0 par defaut bax maytplantax
                            const montantPaye = achat.montant_paye_calcule || 0; 
                            const reste = totalAchat - montantPaye;

                            return (
                                <tr key={achat.id}>
                                    <td style={{ fontWeight: 'bold' }}>{achat.date_achat || '-'}</td>
                                    <td>
                                        {/* Kanjibo smiya dyal l'fournisseur mli kaykon 3ndna gha l'ID dyalo */}
                                        {typeof achat.fournisseur === 'object' ? achat.fournisseur.nom : getNomFournisseur(achat.fournisseur)}
                                    </td>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                                            {achat.lignes && achat.lignes.map((l, index) => (
                                                <li key={index}>
                                                    {l.quantite}x {l.nom_produit || `Produit N°${l.produit}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>{totalAchat.toFixed(2)}</td>
                                    
                                    {/* L'khalas w ch7al ba9i */}
                                    <td style={{ color: '#28a745', fontWeight: 'bold' }}>{montantPaye.toFixed(2)}</td>
                                    <td style={{ color: reste > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                        {reste.toFixed(2)}
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

export default ArchiveAchats;