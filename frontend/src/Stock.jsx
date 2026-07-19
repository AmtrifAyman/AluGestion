import React, { useState } from 'react';
import axios from 'axios';

function Stock({ produits, fetchProduits }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [produitAEditer, setProduitAEditer] = useState({ id: null, designation: '', prix_vente: 0 });

    // 1. Fonction bax nratbo l'produits (Li fihom 0 yehbto lte7t)
    const produitsTries = [...produits].sort((a, b) => {
        if (a.quantite_stock === 0 && b.quantite_stock > 0) return 1; // 'a' fih 0, yehbet lta7t
        if (a.quantite_stock > 0 && b.quantite_stock === 0) return -1; // 'a' fih sl3a, ytla3 lfo9
        return a.designation.localeCompare(b.designation); // Ila kano bhal bhal, nrtbohom bl 7orouf
    });

    // 2. Fonction dyal Msi7
    const supprimerProduit = async (id, designation) => {
        if (window.confirm(`Wax mt2aked bghiti tmsa7 "${designation}" mn l'stock b mara?`)) {
            try {
                await axios.delete(`https://alugestionapi4-purfloud.b4a.run/api/api/produits/${id}/`);
                fetchProduits(); // N-actualisiw l'jadwal
            } catch (err) {
                alert("Mochkil f msi7 dyal l'produit!");
                console.error(err);
            }
        }
    };

    // 3. Fonctions dyal Modification
    const ouvrirModalEdit = (produit) => {
        setProduitAEditer({ 
            id: produit.id, 
            designation: produit.designation, 
            prix_vente: produit.prix_vente 
        });
        setShowEditModal(true);
    };

    const sauvegarderModification = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`https://alugestionapi4-purfloud.b4a.run/api/api/produits/${produitAEditer.id}/`, {
                designation: produitAEditer.designation,
                prix_vente: produitAEditer.prix_vente
            });
            setShowEditModal(false);
            fetchProduits(); // N-actualisiw l'jadwal
            alert("Sl3a tbedlat b naja7!");
        } catch (err) {
            alert("Mochkil f modification!");
            console.error(err);
        }
    };

    return (
        <div className="form-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2>📦 État de Stock</h2>
                <button onClick={fetchProduits} className="btn btn-primary">
                    🔄 Actualiser Stock
                </button>
            </div>

            <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Désignation</th>
                        <th style={{ textAlign: 'center' }}>Quantité f Stock</th>
                        <th>Prix de Vente</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {produitsTries.map(produit => (
                        <tr key={produit.id} style={{ backgroundColor: produit.quantite_stock === 0 ? '#ffe6e6' : 'white' }}>
                            <td style={{ color: produit.quantite_stock === 0 ? '#999' : 'black', textDecoration: produit.quantite_stock === 0 ? 'line-through' : 'none' }}>
                                {produit.designation}
                            </td>
                            <td style={{ textAlign: 'center', color: produit.quantite_stock === 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                                {produit.quantite_stock}
                            </td>
                            <td>{produit.prix_vente} DH</td>
                            <td style={{ textAlign: 'center' }}>
                                <button 
                                    onClick={() => ouvrirModalEdit(produit)} 
                                    className="badge badge-warning" style={{ cursor: 'pointer', marginRight: '5px', border: 'none' }}
                                >
                                    ✏️ Modifier
                                </button>
                                
                                {/* Bouton Supprimer kayban ghir ila kant l'Qte = 0 */}
                                {produit.quantite_stock === 0 && (
                                    <button 
                                        onClick={() => supprimerProduit(produit.id, produit.designation)} 
                                        className="badge badge-danger" style={{ cursor: 'pointer', border: 'none' }}
                                    >
                                        🗑️ Supprimer
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>

            {/* --- MODAL DYAL MODIFICATION --- */}
            {showEditModal && (
                <>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setShowEditModal(false)}></div>
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000, borderRadius: '8px', width: '350px' }}>
                        <h3>✏️ Modifier Produit</h3>
                        <form onSubmit={sauvegarderModification}>
                            <label>Désignation :</label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Ex: Profilé Aluminium..."
                                value={produitAEditer.designation} 
                                onChange={e => setProduitAEditer({...produitAEditer, designation: e.target.value})} 
                                style={{ width: '90%', marginBottom: '15px', padding: '8px', marginTop: '5px' }} 
                            />
                            
                            <label>Nouveau Prix de Vente (DH) :</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                required 
                                value={produitAEditer.prix_vente} 
                                onChange={e => setProduitAEditer({...produitAEditer, prix_vente: parseFloat(e.target.value)})} 
                                style={{ width: '90%', marginBottom: '20px', padding: '8px', marginTop: '5px' }} 
                            />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">Annuler</button>
                                <button type="submit" className="btn btn-success">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}

export default Stock;