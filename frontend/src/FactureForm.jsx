import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import FactureModal from './FactureModal';

function FactureForm() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [parametres, setParametres] = useState(null); 
    
    const [facture, setFacture] = useState({
        client: '', 
        mode_paiement: 'MIXTE', 
        type_remise: 'AUCUNE', 
        valeur_remise: 0, 
        avec_tva: false,
        numero_facture: '', 
        lignes: []
    });
    
    const [paiements, setPaiements] = useState({ espece: 0, cheque: 0, virement: 0 });
    const [showClientModal, setShowClientModal] = useState(false);
    const [nouveauClient, setNouveauClient] = useState({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'CLIENT' });

    const [showModal, setShowModal] = useState(false);
    const [factureValidee, setFactureValidee] = useState(null);
    const [clientActuel, setClientActuel] = useState(null);

    useEffect(() => {
        chargerClients();
        axios.get('http://127.0.0.1:8000/api/api/produits/').then(res => setProduits(res.data));
        
        axios.get('http://127.0.0.1:8000/api/api/parametres/').then(res => {
            if (res.data.length > 0) {
                const p = res.data[0];
                setParametres(p);
                if (p.tva_vente_mode === 'OUI') {
                    setFacture(prev => ({ ...prev, avec_tva: true }));
                }
            }
        });

        axios.get('http://127.0.0.1:8000/api/api/factures/').then(res => {
            const factures = res.data;
            let prochainNum = 1;
            if (factures.length > 0) {
                const maxId = Math.max(...factures.map(f => f.id));
                prochainNum = maxId + 1;
            }
            const numFormatte = `FAC-${String(prochainNum).padStart(4, '0')}`;
            setFacture(prev => ({ ...prev, numero_facture: numFormatte }));
        });
    }, []);

    const chargerClients = () => {
        axios.get('http://127.0.0.1:8000/api/api/tiers/').then(res => setClients(res.data.filter(t => t.type_tier === 'CLIENT')));
    };

    const creerClient = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/api/tiers/', nouveauClient)
            .then(res => {
                setClients([...clients, res.data]); 
                setFacture({ ...facture, client: res.data.id }); 
                setShowClientModal(false);
                setNouveauClient({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'CLIENT' });
            }).catch(err => alert("Mochkil f création dyal l'Client!"));
    };

    const ajouterLigne = () => { setFacture({ ...facture, lignes: [...facture.lignes, { produit: '', quantite: 1, prix_unitaire: 0 }] }); };

    const handleLigneChange = (index, field, value) => {
        const nouvellesLignes = [...facture.lignes];
        nouvellesLignes[index][field] = value;
        if (field === 'produit') {
            const produitChoisi = produits.find(p => p.id === parseInt(value));
            if (produitChoisi) nouvellesLignes[index]['prix_unitaire'] = produitChoisi.prix_vente;
        }
        setFacture({ ...facture, lignes: nouvellesLignes });
    };

    const calculerTotaux = () => {
        let totalBrut = facture.lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
        let totalNetHT = totalBrut;
        
        if (facture.type_remise === 'POURCENTAGE') totalNetHT -= (totalBrut * facture.valeur_remise) / 100;
        else if (facture.type_remise === 'MONTANT') totalNetHT -= facture.valeur_remise;

        let montantTVA = 0;
        if (facture.avec_tva && parametres) {
            montantTVA = (totalNetHT * parametres.taux_tva_vente) / 100;
        }

        let totalTTC = totalNetHT + montantTVA;
        let totalPaye = parseFloat(paiements.espece || 0) + parseFloat(paiements.cheque || 0) + parseFloat(paiements.virement || 0);
        
        return { 
            brut: totalBrut,
            ht: totalNetHT, 
            tva: montantTVA, 
            ttc: totalTTC, 
            paye: totalPaye, 
            reste: totalTTC - totalPaye 
        };
    };

    const soumettreFacture = async (e) => {
        e.preventDefault();
        try {
            const totauxFinal = calculerTotaux();
            const dataFacture = {
                client: facture.client,
                numero_facture: facture.numero_facture, 
                type_remise: facture.type_remise,
                valeur_remise: facture.valeur_remise,
                avec_tva: facture.avec_tva,
                montant_ht: totauxFinal.ht,
                montant_tva: totauxFinal.tva,
                montant_ttc: totauxFinal.ttc
            };

            const resFacture = await axios.post('http://127.0.0.1:8000/api/api/factures/', dataFacture);
            const client_id = facture.client;
            const facture_id = resFacture.data.id; 

            for (let i = 0; i < facture.lignes.length; i++) {
                const line = facture.lignes[i];
                await axios.post('http://127.0.0.1:8000/api/api/lignes-facture/', {
                    facture: facture_id,
                    produit: parseInt(line.produit),
                    quantite: parseInt(line.quantite),
                    prix_unitaire: parseFloat(line.prix_unitaire)
                });
            }

            if (paiements.espece > 0) await axios.post('http://127.0.0.1:8000/api/api/paiements/', { tier: client_id, montant: paiements.espece, mode: 'ESPECE', remarque: `Avance Espèce - Facture N°${facture_id}`, facture: facture_id });
            if (paiements.cheque > 0) await axios.post('http://127.0.0.1:8000/api/api/paiements/', { tier: client_id, montant: paiements.cheque, mode: 'CHEQUE', remarque: `Avance Chèque - Facture N°${facture_id}`, facture: facture_id });
            if (paiements.virement > 0) await axios.post('http://127.0.0.1:8000/api/api/paiements/', { tier: client_id, montant: paiements.virement, mode: 'VIREMENT', remarque: `Avance Virement - Facture N°${facture_id}`, facture: facture_id });
            
            const leClient = clients.find(c => c.id === client_id);
            const completeFactureData = {
                ...facture,
                id: facture_id,
                date_facture: resFacture.data.date_facture || new Date().toISOString(),
                montant_tva: totauxFinal.tva,
                montant_ht: totauxFinal.ht,
                montant_ttc: totauxFinal.ttc,
                montant_paye: totauxFinal.paye,
                lignes: facture.lignes.map(l => {
                    const prod = produits.find(p => p.id === parseInt(l.produit));
                    return { ...l, produit_nom: prod ? prod.designation : `Produit #${l.produit}` };
                })
            };

            setFactureValidee(completeFactureData); 
            setClientActuel(leClient);
            setShowModal(true);

        } catch (err) {
            console.error("Mochkil f tsjal l'Vente:", err.response?.data || err);
            alert('Kayn mochkil f tsjal! Chof l\'console developer (F12) bach t3ref l\'err exact.');
        }
    };

    const totaux = calculerTotaux();
    const clientOptions = clients.map(c => ({ value: c.id, label: `${c.nom} ${c.ice ? `(ICE: ${c.ice})` : ''}` }));
    const selectedClientOption = clientOptions.find(option => option.value === facture.client) || null;
    
    const clientComplet = clients.find(c => c.id === facture.client) || null;
    const ancienCreance = clientComplet ? parseFloat(clientComplet.solde || 0) : 0;
    const nouveauCreance = totaux.reste;
    const totalCreance = ancienCreance + nouveauCreance;

    return (
        <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>🛒 Nouvelle Vente</h2>
                <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--muted)', marginRight: '8px' }}>N°:</span>
                    <strong>{facture.numero_facture}</strong>
                </div>
            </div>

            <form onSubmit={soumettreFacture}>
                
                {/* Section 1: Client w TVA */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div className="form-group">
                            <label>Client *</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <Select
                                        options={clientOptions}
                                        value={selectedClientOption}
                                        onChange={(opt) => setFacture({...facture, client: opt ? opt.value : ''})}
                                        placeholder="Kteb wla khtar client..."
                                        isClearable={true}
                                        isSearchable={true}
                                    />
                                </div>
                                <button type="button" onClick={() => setShowClientModal(true)} className="btn btn-primary">
                                    + Nouveau
                                </button>
                            </div>
                            {clientComplet && (
                                <div style={{ marginTop: '10px', fontSize: '14px', padding: '10px', backgroundColor: ancienCreance > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '6px' }}>
                                    <span>Solde actuel : </span>
                                    <strong className={ancienCreance > 0 ? 'text-danger' : 'text-success'}>{ancienCreance.toFixed(2)} DH</strong>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {parametres && parametres.tva_vente_mode === 'MIXTE' && (
                        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', paddingTop: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 15px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                                <input type="checkbox" checked={facture.avec_tva} onChange={(e) => setFacture({...facture, avec_tva: e.target.checked})} />
                                <span>TVA ({parametres.taux_tva_vente}%)</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Section 2: Lignes de Facture */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>Produits Finis</h3>
                    
                    {facture.lignes.map((ligne, index) => (
                        <div key={index} style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                                <select required className="form-control" value={ligne.produit} onChange={(e) => handleLigneChange(index, 'produit', e.target.value)}>
                                    <option value="">-- Choisir un produit --</option>
                                    {produits.map(p => <option key={p.id} value={p.id}>{p.designation}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                                <input type="number" required min="1" className="form-control" value={ligne.quantite} onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value))} />
                            </div>
                            <div className="form-group" style={{ width: '150px', marginBottom: 0 }}>
                                <input type="number" step="0.01" required className="form-control" value={ligne.prix_unitaire} onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value))} />
                            </div>
                        </div>
                    ))}
                    
                    <button type="button" onClick={ajouterLigne} className="btn btn-outline" style={{ marginTop: '10px' }}>
                        ➕ Zid Produit
                    </button>
                </div>

                {/* Section 3: Remise */}
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <h4 style={{ color: 'var(--warning)', marginBottom: '15px' }}>🎁 Remise (Khasm)</h4>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Type de Remise</label>
                            <select className="form-control" value={facture.type_remise} onChange={(e) => setFacture({...facture, type_remise: e.target.value, valeur_remise: 0})}>
                                <option value="AUCUNE">Aucune (Makanx Remise)</option>
                                <option value="POURCENTAGE">Pourcentage (%)</option>
                                <option value="MONTANT">Montant Fixe (DH)</option>
                            </select>
                        </div>
                        {facture.type_remise !== 'AUCUNE' && (
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>{facture.type_remise === 'POURCENTAGE' ? 'Valeur (%)' : 'Montant (DH)'}</label>
                                <input type="number" step="0.01" min="0" className="form-control" value={facture.valeur_remise} onChange={(e) => setFacture({...facture, valeur_remise: parseFloat(e.target.value) || 0})} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 4: Paiements & Totaux */}
                <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px', backgroundColor: 'var(--bg-app)', padding: '20px', borderRadius: '8px' }}>
                        <h3 style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>💸 Lkhalas (Avance)</h3>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <label style={{ margin: 0 }}>Espèce (DH)</label>
                            <input type="number" step="0.01" min="0" className="form-control" style={{ width: '150px' }} value={paiements.espece} onChange={(e) => setPaiements({...paiements, espece: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <label style={{ margin: 0 }}>Chèque (DH)</label>
                            <input type="number" step="0.01" min="0" className="form-control" style={{ width: '150px' }} value={paiements.cheque} onChange={(e) => setPaiements({...paiements, cheque: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ margin: 0 }}>Virement (DH)</label>
                            <input type="number" step="0.01" min="0" className="form-control" style={{ width: '150px' }} value={paiements.virement} onChange={(e) => setPaiements({...paiements, virement: e.target.value})} />
                        </div>
                    </div>

                    <div style={{ flex: '1 1 300px', backgroundColor: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Total Brut :</span> <span>{totaux.brut.toFixed(2)} DH</span></div>
                            {facture.type_remise !== 'AUCUNE' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--warning)', marginBottom: '10px' }}><span>Remise :</span> <span>- {facture.type_remise === 'POURCENTAGE' ? `${facture.valeur_remise} %` : `${facture.valeur_remise.toFixed(2)} DH`}</span></div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Net HT :</span> <span>{totaux.ht.toFixed(2)} DH</span></div>
                            {facture.avec_tva && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', marginBottom: '10px' }}><span>TVA :</span> <span>+ {totaux.tva.toFixed(2)} DH</span></div>
                            )}
                        </div>
                        
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
                                <span style={{ color: 'var(--muted)' }}>Total TTC à payer</span>
                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>{totaux.ttc.toFixed(2)} DH</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '15px' }}>
                                <span>Khlesna fih :</span>
                                <span>{totaux.paye.toFixed(2)} DH</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', padding: '10px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                                <span className={totalCreance > 0 ? 'text-danger' : 'text-success'}>Reste à payer (Créance Total) :</span>
                                <span className={totalCreance > 0 ? 'text-danger' : 'text-success'}>{totalCreance.toFixed(2)} DH</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
                    <button type="submit" className="btn btn-success" style={{ padding: '12px 30px', fontSize: '16px' }}>
                        ✅ Valider la Facture
                    </button>
                </div>
            </form>

            {/* Modal Nouveau Client */}
            {showClientModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <form onSubmit={creerClient} style={{ backgroundColor: 'white', borderRadius: '8px', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '15px 20px' }}>
                            <h3 style={{ margin: 0 }}>👤 Nouveau Client</h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className="form-group"><label>Nom Complet *</label><input type="text" required className="form-control" value={nouveauClient.nom} onChange={e => setNouveauClient({...nouveauClient, nom: e.target.value})} /></div>
                            <div className="form-group"><label>Téléphone</label><input type="text" className="form-control" value={nouveauClient.telephone} onChange={e => setNouveauClient({...nouveauClient, telephone: e.target.value})} /></div>
                            <div className="form-group"><label>Adresse</label><input type="text" className="form-control" value={nouveauClient.adresse} onChange={e => setNouveauClient({...nouveauClient, adresse: e.target.value})} /></div>
                            <div className="form-group"><label>ICE</label><input type="text" className="form-control" value={nouveauClient.ice} onChange={e => setNouveauClient({...nouveauClient, ice: e.target.value})} /></div>
                        </div>
                        <div style={{ padding: '15px 20px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={() => setShowClientModal(false)} className="btn btn-outline">Annuler</button>
                            <button type="submit" className="btn btn-primary">Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}
            
            {showModal && (
                <FactureModal 
                    facture={factureValidee} 
                    client={clientActuel} 
                    onClose={() => { setShowModal(false); window.location.reload(); }} 
                />
            )}
        </div>
    );
}

export default FactureForm;