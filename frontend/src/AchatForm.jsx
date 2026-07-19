import { useState, useEffect } from 'react';
import axios from 'axios';

function AchatForm() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [produits, setProduits] = useState([]);
    const [paiements, setPaiements] = useState({ espece: 0, cheque: 0, virement: 0 });
    
    // ZEDNA LES STATES DYAL L'MODAL FOURNISSEUR
    const [showFournisseurModal, setShowFournisseurModal] = useState(false);
    const [nouveauFournisseur, setNouveauFournisseur] = useState({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'FOURNISSEUR' });

    // Hiyedna montant_paye w mode_paiement mn hna 7it mab9awx f l'backend
    const [achat, setAchat] = useState({
        fournisseur: '', 
        numero_facture: '', 
        lignes: []
    });

    useEffect(() => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/').then(res => setFournisseurs(res.data.filter(t => t.type_tier === 'FOURNISSEUR')));
        chargerProduits();
    }, []);

    const chargerProduits = () => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/produits/').then(res => setProduits(res.data));
    };

    // FONCTION BAX NKRYIW FOURNISSEUR JDID
    const creerFournisseur = (e) => {
        e.preventDefault();
        axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/tiers/', nouveauFournisseur)
            .then(res => {
                setFournisseurs([...fournisseurs, res.data]); 
                setAchat({ ...achat, fournisseur: res.data.id }); 
                setShowFournisseurModal(false);
                setNouveauFournisseur({ nom: '', telephone: '', adresse: '', ice: '', type_tier: 'FOURNISSEUR' });
            }).catch(err => alert("Mochkil f création dyal l'Fournisseur!"));
    };

    const calculerTotaux = () => {
        let totalBrut = achat.lignes.reduce((sum, ligne) => sum + (ligne.quantite * (parseFloat(ligne.prix_achat) || 0)), 0);
        let totalPaye = parseFloat(paiements.espece || 0) + parseFloat(paiements.cheque || 0) + parseFloat(paiements.virement || 0);
        
        return { 
            brut: totalBrut,
            paye: totalPaye, 
            reste: totalBrut - totalPaye 
        };
    };

    const ajouterLigne = () => { 
        setAchat({ 
            ...achat, 
            lignes: [...achat.lignes, { produit_id: '', nom_produit: '', is_new: false, quantite: 1, prix_achat: 0, prix_vente: 0 }] 
        }); 
    };

    const handleLigneChange = (index, field, value) => {
        const nouvellesLignes = [...achat.lignes];
        
        if (field === 'produit_id') {
            if (value === 'NEW') {
                nouvellesLignes[index].is_new = true;
                nouvellesLignes[index].produit_id = '';
                nouvellesLignes[index].prix_vente = 0;
            } else {
                nouvellesLignes[index].is_new = false;
                nouvellesLignes[index].produit_id = value;
                const prodExistant = produits.find(p => p.id === parseInt(value));
                if (prodExistant) {
                    nouvellesLignes[index].prix_vente = prodExistant.prix_vente || 0;
                }
            }
        } else {
            nouvellesLignes[index][field] = value;
        }
        setAchat({ ...achat, lignes: nouvellesLignes });
    };

    const soumettreAchat = async (e) => {
        e.preventDefault();
        try {
            const lignesAEnvoyer = [];

            // 1. Kankryiw les nouveaux produits wla n'mttewhom à jour
            for (let i = 0; i < achat.lignes.length; i++) {
                let ligne = achat.lignes[i];
                let idProduitFinal = ligne.produit_id;

                if (ligne.is_new) {
                    const resProd = await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/produits/', {
                        designation: ligne.nom_produit,
                        prix_achat: ligne.prix_achat,
                       prix_vente: ligne.prix_vente,
                       quantite_stock: 0 
                    });
                    idProduitFinal = resProd.data.id;
                } else if (idProduitFinal) {
                    await axios.patch(`https://alugestionapi4-purfloud.b4a.run/api/api/produits/${idProduitFinal}/`, {
                        prix_vente: ligne.prix_vente
                    });
                }

                lignesAEnvoyer.push({
                    produit: idProduitFinal,
                    quantite: ligne.quantite,
                    prix_unitaire: ligne.prix_achat 
                });
            }
        
            // 2. Nsifto l'Achat BO7DO f lewel (bla les lignes)
            const dataAchat = {
                fournisseur: achat.fournisseur,
                numero_facture: achat.numero_facture === '' ? null : achat.numero_facture,
            };

            const resAchat = await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/achats/', dataAchat);
            const achat_id = resAchat.data.id; // Chadna l'ID dyal l'achat jdida!
            const fournisseur_id = achat.fournisseur;

            // 3. Db nsifto l'koll ligne d'achat bo7dha ne l'api dyalha
            for (let i = 0; i < lignesAEnvoyer.length; i++) {
               await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/lignes-achat/', {
                    achat: achat_id, // Kankbtroha m3a l'achat dyalna
                    produit: lignesAEnvoyer[i].produit,
                    quantite: lignesAEnvoyer[i].quantite,
                    prix_unitaire: lignesAEnvoyer[i].prix_unitaire // T2aked mn smiya f backend (prix_unitaire wla prix_achat)
                });
            }

            // 4. Db knsifto l'khalas (Paiements)
            if (paiements.espece > 0) await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/', { tier: fournisseur_id, montant: paiements.espece, mode: 'ESPECE', remarque: `Paiement Espèce - Achat N°${achat_id}` });
            if (paiements.cheque > 0) await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/', { tier: fournisseur_id, montant: paiements.cheque, mode: 'CHEQUE', remarque: `Paiement Chèque - Achat N°${achat_id}` });
            if (paiements.virement > 0) await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/paiements/', { tier: fournisseur_id, montant: paiements.virement, mode: 'VIREMENT', remarque: `Paiement Virement - Achat N°${achat_id}` });

            alert("Achat w l'khalas tsjjlo b naja7, w l'produits t'mettew à jour!");
            window.location.reload();

        } catch (error) {
            console.error("Mochkil f tsjal:", error.response?.data || error);
            alert("Kayn mochkil f tsjal. T2aked mn les informations.");
        }
    };

    const totaux = calculerTotaux();
    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
            <h2>🛒 Nouvel Achat</h2>
            <form onSubmit={soumettreAchat}>
                
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                        <div>
                            <label>Fournisseur :</label><br/>
                            <select required value={achat.fournisseur} onChange={e => setAchat({...achat, fournisseur: e.target.value})} style={{ padding: '8px', minWidth: '200px', height: '35px' }}>
                                <option value="">-- Choisir --</option>
                                {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={() => setShowFournisseurModal(true)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>
                            + Fournisseur Jdid
                        </button>
                    </div>
                    
                    <div>
                        <label>N° Facture (Optionnel) :</label><br/>
                        <input 
                            type="text" 
                            placeholder="Ex: FAC-2026-089" 
                            value={achat.numero_facture} 
                            onChange={e => setAchat({...achat, numero_facture: e.target.value})} 
                            style={{ padding: '8px', minWidth: '200px', height: '35px', boxSizing: 'border-box' }} 
                        />
                    </div>
                </div>

                <h3>Lignes d'Achat</h3>
                {achat.lignes.map((ligne, index) => (
                    <div key={index} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <select 
                                required 
                                value={ligne.is_new ? 'NEW' : ligne.produit_id} 
                                onChange={(e) => handleLigneChange(index, 'produit_id', e.target.value)} 
                                style={{ padding: '8px', width: '250px' }}
                            >
                                <option value="">-- Choisir un produit --</option>
                                <option value="NEW" style={{ fontWeight: 'bold', color: 'blue' }}>➕ Nouveau Produit</option>
                                {produits.map(p => <option key={p.id} value={p.id}>{p.designation}</option>)}
                            </select>

                            {ligne.is_new && (
                                <input 
                                    type="text" 
                                    placeholder="Nom du nouveau produit" 
                                    required 
                                    value={ligne.nom_produit} 
                                    onChange={(e) => handleLigneChange(index, 'nom_produit', e.target.value)} 
                                    style={{ marginTop: '5px', padding: '8px', border: '1px solid #007bff' }} 
                                />
                            )}
                        </div>
                        
                        <input type="number" placeholder="Qté" required min="1" value={ligne.quantite} onChange={(e) => handleLigneChange(index, 'quantite', parseInt(e.target.value))} style={{ width: '80px', padding: '8px' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <small style={{ color: '#666' }}>Prix Achat (DH)</small>
                            <input type="number" step="0.01" required value={ligne.prix_achat} onChange={(e) => handleLigneChange(index, 'prix_achat', parseFloat(e.target.value))} style={{ width: '120px', padding: '8px' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <small style={{ color: '#28a745', fontWeight: 'bold' }}>Nouveau Prix Vente (DH)</small>
                            <input type="number" step="0.01" required value={ligne.prix_vente} onChange={(e) => handleLigneChange(index, 'prix_vente', parseFloat(e.target.value))} style={{ width: '150px', padding: '8px', border: '1px solid #28a745' }} />
                        </div>
                    </div>
                ))}
                
                <button type="button" onClick={ajouterLigne} style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>+ Ajouter Ligne</button>
                <br/>

                <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#343a40' }}>💸 Lkhalas w Total</h3>
                    
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label>Espèce (DH): </label><br/>
                            <input type="number" step="0.01" min="0" value={paiements.espece} onChange={(e) => setPaiements({...paiements, espece: e.target.value})} style={{ width: '120px', padding: '5px' }} />
                        </div>
                        <div>
                            <label>Chèque (DH): </label><br/>
                            <input type="number" step="0.01" min="0" value={paiements.cheque} onChange={(e) => setPaiements({...paiements, cheque: e.target.value})} style={{ width: '120px', padding: '5px' }} />
                        </div>
                        <div>
                            <label>Virement (DH): </label><br/>
                            <input type="number" step="0.01" min="0" value={paiements.virement} onChange={(e) => setPaiements({...paiements, virement: e.target.value})} style={{ width: '120px', padding: '5px' }} />
                        </div>
                    </div>
                    
                    <hr style={{ borderColor: '#ced4da' }} />
                    
                    <div style={{ fontSize: '16px', color: '#495057' }}>
                        <p style={{ fontSize: '20px', color: '#007bff' }}>TOTAL ACHAT : <b>{totaux.brut.toFixed(2)} DH</b></p>
                        <hr style={{ borderColor: '#ced4da' }} />
                        <p>Khlesna Fih : <b>{totaux.paye.toFixed(2)} DH</b></p>
                        <p>Kridi li 3lina : <b style={{ color: totaux.reste > 0 ? 'red' : 'green' }}>{totaux.reste.toFixed(2)} DH</b></p>
                    </div>
                </div>

                <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>Valider l'Achat</button>
            </form>

            {showFournisseurModal && (
                <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowFournisseurModal(false)}></div>
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000, borderRadius: '8px', width: '300px' }}>
                        <h3>Nouveau Fournisseur</h3>
                        <form onSubmit={creerFournisseur}>
                            <input type="text" placeholder="Nom du fournisseur" required style={{ width: '90%', marginBottom: '10px', padding: '8px' }} value={nouveauFournisseur.nom} onChange={e => setNouveauFournisseur({...nouveauFournisseur, nom: e.target.value})} />
                            <input type="text" placeholder="Téléphone" style={{ width: '90%', marginBottom: '10px', padding: '8px' }} value={nouveauFournisseur.telephone} onChange={e => setNouveauFournisseur({...nouveauFournisseur, telephone: e.target.value})} />
                            <input type="text" placeholder="ICE (Optionnel)" style={{ width: '90%', marginBottom: '10px', padding: '8px' }} value={nouveauFournisseur.ice} onChange={e => setNouveauFournisseur({...nouveauFournisseur, ice: e.target.value})} />
                            <textarea placeholder="Adresse" style={{ width: '90%', marginBottom: '10px', padding: '8px' }} value={nouveauFournisseur.adresse} onChange={e => setNouveauFournisseur({...nouveauFournisseur, adresse: e.target.value})} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowFournisseurModal(false)} style={{ padding: '8px', backgroundColor: 'gray', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Annuler</button>
                                <button type="submit" style={{ padding: '8px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

export default AchatForm;