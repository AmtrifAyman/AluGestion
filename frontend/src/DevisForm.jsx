import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import DevisModal from './DevisModal';

function DevisForm() {
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [parametres, setParametres] = useState(null); 
    
    const [devis, setDevis] = useState({
        client: '', 
        type_remise: 'AUCUNE', 
        valeur_remise: 0, 
        avec_tva: false,
        numero_devis: '', 
        lignes: []
    });
    
    const [showClientModal, setShowClientModal] = useState(false);
    const [nouveauClient, setNouveauClient] = useState({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'CLIENT' });

    const [showModal, setShowModal] = useState(false);
    const [devisValide, setDevisValide] = useState(null);
    const [clientActuel, setClientActuel] = useState(null);

    useEffect(() => {
        chargerClients();
        axios.get('http://127.0.0.1:8000/api/api/produits/').then(res => setProduits(res.data));
        
        axios.get('http://127.0.0.1:8000/api/api/parametres/').then(res => {
            if (res.data.length > 0) {
                const p = res.data[0];
                setParametres(p);
                if (p.tva_vente_mode === 'OUI') {
                    setDevis(prev => ({ ...prev, avec_tva: true }));
                }
            }
        });

        // N-generiw un numéro de devis temporaire (Matalan 3la 7sab l-we9t wla random)
        const numFormatte = `DEV-${Date.now().toString().slice(-4)}`;
        setDevis(prev => ({ ...prev, numero_devis: numFormatte }));
    }, []);

    const chargerClients = () => {
        axios.get('http://127.0.0.1:8000/api/api/tiers/').then(res => setClients(res.data.filter(t => t.type_tier === 'CLIENT')));
    };

    const creerClient = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/api/tiers/', nouveauClient)
            .then(res => {
                setClients([...clients, res.data]); 
                setDevis({ ...devis, client: res.data.id }); 
                setShowClientModal(false);
                setNouveauClient({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'CLIENT' });
            }).catch(err => alert("Mochkil f création dyal l'Client!"));
    };

    const ajouterLigne = () => { setDevis({ ...devis, lignes: [...devis.lignes, { produit: '', quantite: 1, prix_unitaire: 0 }] }); };

    const handleLigneChange = (index, field, value) => {
        const nouvellesLignes = [...devis.lignes];
        nouvellesLignes[index][field] = value;
        if (field === 'produit') {
            const produitChoisi = produits.find(p => p.id === parseInt(value));
            if (produitChoisi) nouvellesLignes[index]['prix_unitaire'] = produitChoisi.prix_vente;
        }
        setDevis({ ...devis, lignes: nouvellesLignes });
    };

    const calculerTotaux = () => {
        let totalBrut = devis.lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
        let totalNetHT = totalBrut;
        
        if (devis.type_remise === 'POURCENTAGE') totalNetHT -= (totalBrut * devis.valeur_remise) / 100;
        else if (devis.type_remise === 'MONTANT') totalNetHT -= devis.valeur_remise;

        let montantTVA = 0;
        if (devis.avec_tva && parametres) {
            montantTVA = (totalNetHT * parametres.taux_tva_vente) / 100;
        }

        let totalTTC = totalNetHT + montantTVA;
        
        return { 
            brut: totalBrut,
            ht: totalNetHT, 
            tva: montantTVA, 
            ttc: totalTTC
        };
    };

    const soumettreDevis = (e) => {
        e.preventDefault();
        if (!devis.client) {
            alert("Khtar client houwa l-aoual!");
            return;
        }
        
        const totauxFinal = calculerTotaux();
        const client_id = devis.client;
        const leClient = clients.find(c => c.id === client_id);
        
        // Hna kancréew l'objet gha f React bla ma nsiftoh l-backend
        const completeDevisData = {
            ...devis,
            id: devis.numero_devis,
            date_devis: new Date().toISOString(),
            montant_tva: totauxFinal.tva,
            montant_ht: totauxFinal.ht,
            montant_ttc: totauxFinal.ttc,
            lignes: devis.lignes.map(l => {
                const prod = produits.find(p => p.id === parseInt(l.produit));
                return {
                    ...l,
                    produit_nom: prod ? prod.designation : `Produit #${l.produit}`
                };
            })
        };

        setDevisValide(completeDevisData); 
        setClientActuel(leClient);
        setShowModal(true);
    };

    const totaux = calculerTotaux();
    const clientOptions = clients.map(c => ({ value: c.id, label: `${c.nom} ${c.ice ? `(ICE: ${c.ice})` : ''}` }));
    const selectedClientOption = clientOptions.find(option => option.value === devis.client) || null;

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📋 Nouveau Devis</h2>
                <h3 style={{ color: '#6f42c1' }}>{devis.numero_devis}</h3>
            </div>

            <form onSubmit={soumettreDevis}>
                
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                    <label style={{ marginRight: '10px' }}>Client: </label>
                    <div style={{ width: '300px' }}>
                        <Select
                            options={clientOptions}
                            value={selectedClientOption}
                            onChange={(selectedOption) => setDevis({...devis, client: selectedOption ? selectedOption.value : ''})}
                            placeholder="Kteb wla khtar client..."
                            isClearable={true}
                            isSearchable={true}
                        />
                    </div>
                    <button type="button" onClick={() => setShowClientModal(true)} style={{ marginLeft: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '9px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        + Client Jdid
                    </button>
                </div>
                
                {parametres && parametres.tva_vente_mode === 'MIXTE' && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', display: 'inline-block' }}>
                        <label style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={devis.avec_tva} 
                                onChange={(e) => setDevis({...devis, avec_tva: e.target.checked})} 
                                style={{ marginRight: '8px' }}
                            />
                            Calculer avec TVA ({parametres.taux_tva_vente}%)
                        </label>
                    </div>
                )}

                <h3>Produits / Articles</h3>
                {devis.lignes.map((ligne, index) => (
                    <div key={index} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                        <select required value={ligne.produit} onChange={(e) => handleLigneChange(index, 'produit', e.target.value)} style={{ padding: '8px' ,color: 'black' }}>
                            <option value="">-- Produit --</option>
                            {produits.map(p => <option key={p.id} value={p.id}>{p.designation}</option>)}
                        </select>
                        <input type="number" placeholder="Quantité" required min="1" value={ligne.quantite} onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value))} style={{ width: '80px', padding: '8px' }} />
                        <input type="number" step="0.01" placeholder="Prix Unitaire" required value={ligne.prix_unitaire} onChange={(e) => handleLigneChange(index, 'prix_unitaire', parseFloat(e.target.value))} style={{ width: '110px', padding: '8px' }} /> DH
                    </div>
                ))}
                <button type="button" onClick={ajouterLigne} style={{ marginBottom: '20px', padding: '8px 15px' }}>+ Zid Produit</button>

                <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '5px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>🎁 Remise (Khasm ikhtiyari)</h4>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div>
                            <label>Type de Remise :</label><br/>
                            <select 
                                value={devis.type_remise} 
                                onChange={(e) => setDevis({...devis, type_remise: e.target.value, valeur_remise: 0})} 
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px', color: 'black' }}
                            >
                                <option value="AUCUNE">Aucune (Makanx Remise)</option>
                                <option value="POURCENTAGE">Pourcentage (%)</option>
                                <option value="MONTANT">Montant Fixe (DH)</option>
                            </select>
                        </div>
                        
                        {devis.type_remise !== 'AUCUNE' && (
                            <div>
                                <label>{devis.type_remise === 'POURCENTAGE' ? 'Valeur de Remise (%) :' : 'Montant de Remise (DH) :'}</label><br/>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    min="0"
                                    value={devis.valeur_remise} 
                                    onChange={(e) => setDevis({...devis, valeur_remise: parseFloat(e.target.value) || 0})} 
                                    style={{ padding: '7px', width: '130px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px' }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Recapitulatif dyal l-calcul baraka */}
                <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#343a40' }}>📊 Total Estimé</h3>
                    
                    <div style={{ fontSize: '16px', color: '#495057' }}>
                        <p>Total Brut : <b>{totaux.brut.toFixed(2)} DH</b></p>
                        {devis.type_remise !== 'AUCUNE' && (
                            <p style={{ color: 'red' }}>- Remise appliquée : <b>{devis.type_remise === 'POURCENTAGE' ? `${devis.valeur_remise} %` : `${devis.valeur_remise.toFixed(2)} DH`}</b></p>
                        )}
                        <p>Total Net HT : <b>{totaux.ht.toFixed(2)} DH</b></p>
                        {devis.avec_tva && (
                            <p style={{ color: '#0056b3' }}>+ Montant TVA : <b>{totaux.tva.toFixed(2)} DH</b></p>
                        )}
                        <hr style={{ borderColor: '#ced4da' }} />
                        <p style={{ fontSize: '20px', color: '#6f42c1' }}>TOTAL TTC ESTIMÉ : <b>{totaux.ttc.toFixed(2)} DH</b></p>
                    </div>
                </div>

                <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#6f42c1', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '5px' }}>
                    Afficher le Devis
                </button>
            </form>

            {/* Modal dyal Client Jdid */}
            {showClientModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
                    <form onSubmit={creerClient} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px' }}>
                        <h3>👤 Nouveau Client</h3>
                        <input type="text" placeholder="Nom complet" required value={nouveauClient.nom} onChange={e => setNouveauClient({...nouveauClient, nom: e.target.value})} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} /><br/>
                        <input type="text" placeholder="Téléphone" value={nouveauClient.telephone} onChange={e => setNouveauClient({...nouveauClient, telephone: e.target.value})} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} /><br/>
                        <input type="text" placeholder="Adresse" value={nouveauClient.adresse} onChange={e => setNouveauClient({...nouveauClient, adresse: e.target.value})} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} /><br/>
                        <input type="text" placeholder="ICE" value={nouveauClient.ice} onChange={e => setNouveauClient({...nouveauClient, ice: e.target.value})} style={{ width: '95%', padding: '8px', marginBottom: '10px' }} /><br/>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                            <button type="button" onClick={() => setShowClientModal(false)} style={{ padding: '8px 15px', backgroundColor: '#ccc', border: 'none', cursor: 'pointer' }}>Annuler</button>
                            <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Enregistrer</button>
                        </div>
                    </form>
                </div>
            )}
            
            {showModal && (
                <DevisModal 
                    devis={devisValide} 
                    client={clientActuel} 
                    onClose={() => {
                        setShowModal(false);
                        // Hna bla ma ndiro reload hit ma t-tsjjel walo f BD
                    }} 
                />
            )}
        </div>
    );
}

export default DevisForm;