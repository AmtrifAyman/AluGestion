import { useState, useEffect } from 'react';
import axios from 'axios';

function PaiementForm() {
    const [tiers, setTiers] = useState([]);
    const [paiement, setPaiement] = useState({
        tier: '',
        montant: '',
        remarque: ''
    });

    // Fonction bax njibo l'clients w fournisseurs m3a l'crédit dyalhom
    const fetchTiers = () => {
        axios.get('http://127.0.0.1:8000/api/api/tiers/')
            .then(res => setTiers(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    const soumettrePaiement = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/api/paiements/', paiement)
            .then(res => {
                alert('Mzyan! Lkhalas tvalida w l\'crédit nqes.');
                setPaiement({ tier: '', montant: '', remarque: '' });
                fetchTiers(); // N-actualisiw liste bax yban l'solde jdid
            })
            .catch(err => {
                console.error(err);
                alert('Kayn mochkil f tsjil dyal lkhalas.');
            });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ffc107', marginTop: '20px', backgroundColor: '#fff8cc' }}>
            <h2 style={{ color: '#d39e00' }}>💰 Tsjil dyal Lkhalas (Paiements)</h2>
            <form onSubmit={soumettrePaiement}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Client wla Fournisseur: </label>
                    <select required value={paiement.tier} onChange={(e) => setPaiement({...paiement, tier: e.target.value})}>
                        <option value="">-- Khtar --</option>
                        {tiers.map(t => (
                            <option key={t.id} value={t.id}>
                                {t.nom} - ({t.type_tier}) | Crédit: {t.solde} DH
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input 
                        type="number" step="0.01" placeholder="Montant (DH)" required 
                        value={paiement.montant} 
                        onChange={(e) => setPaiement({...paiement, montant: e.target.value})} 
                    />
                    
                    <input 
                        type="text" placeholder="Remarque (ex: Avance)" 
                        value={paiement.remarque} 
                        onChange={(e) => setPaiement({...paiement, remarque: e.target.value})} 
                        style={{ marginLeft: '10px', width: '250px' }} 
                    />
                </div>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Valider Lkhalas
                </button>
            </form>
        </div>
    );
}

export default PaiementForm;