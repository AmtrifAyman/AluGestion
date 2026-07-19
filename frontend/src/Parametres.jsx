import { useState, useEffect } from 'react';
import axios from 'axios';

function Parametres() {
    const [parametres, setParametres] = useState({
        tva_achat_mode: 'NON',
        taux_tva_achat: 20.00,
        tva_vente_mode: 'NON',
        taux_tva_vente: 20.00
    });
    const [idParam, setIdParam] = useState(null);
    const [message, setMessage] = useState('');

    // Mli kat-tchargi l'page, kanjibo l'Paramètres mn l'API
    useEffect(() => {
        axios.get('https://alugestionapi4-purfloud.b4a.run/api/api/parametres/')
            .then(res => {
                if (res.data.length > 0) {
                    // Kanjibo l'Paramètre lowel (7it charika we7da li kayna)
                    setParametres(res.data[0]);
                    setIdParam(res.data[0].id);
                }
            })
            .catch(err => console.error("Mochkil f jiban d l'Paramètres", err));
    }, []);

    // Fonction bax nsajlo les modifications
    const sauvegarderParametres = async (e) => {
        e.preventDefault();
        try {
            if (idParam) {
                // Ila kano deja msajlin, kandiro UPDATE (PUT)
                await axios.put(`https://alugestionapi4-purfloud.b4a.run/api/api/parametres/${idParam}/`, parametres);
            } else {
                // Ila kant awel mera, kandiro CREATE (POST)
                const res = await axios.post('https://alugestionapi4-purfloud.b4a.run/api/api/parametres/', parametres);
                setIdParam(res.data.id);
            }
            setMessage('✅ Paramètres msajlin b naja7!');
            setTimeout(() => setMessage(''), 3000); // Ytms7 l'message b3d 3 thawanin
        } catch (err) {
            setMessage('❌ Kayn mochkil f tsjal.');
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>⚙️ Paramètres de la Société</h2>
            
            {message && <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e2efd9', color: '#385623', border: '1px solid #c5e0b4', borderRadius: '5px' }}>{message}</div>}

            <form onSubmit={sauvegarderParametres} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                
                {/* --- PARAMÈTRES DYAL L'ACHAT --- */}
                <h3 style={{ color: '#0056b3', borderBottom: '2px solid #0056b3', paddingBottom: '5px' }}>📦 Paramètres d'Achat</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mode TVA (Achats) :</label>
                    <select 
                        value={parametres.tva_achat_mode} 
                        onChange={(e) => setParametres({...parametres, tva_achat_mode: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="OUI">Toujours avec TVA (Dima)</option>
                        <option value="NON">Jamais de TVA (Makanhsbouhax)</option>
                        <option value="MIXTE">Au Choix (Kan3zel f l'Formulaire)</option>
                    </select>
                </div>
                
                {(parametres.tva_achat_mode === 'OUI' || parametres.tva_achat_mode === 'MIXTE') && (
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Taux TVA d'Achat (%) :</label>
                        <input 
                            type="number" step="0.01" 
                            value={parametres.taux_tva_achat} 
                            onChange={(e) => setParametres({...parametres, taux_tva_achat: parseFloat(e.target.value)})}
                            style={{ width: '100px', padding: '8px' }} 
                        /> %
                    </div>
                )}

                {/* --- PARAMÈTRES DYAL L'VENTE --- */}
                <h3 style={{ color: '#28a745', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>🛒 Paramètres de Vente</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Mode TVA (Ventes / Factures) :</label>
                    <select 
                        value={parametres.tva_vente_mode} 
                        onChange={(e) => setParametres({...parametres, tva_vente_mode: e.target.value})}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="OUI">Toujours avec TVA (Dima)</option>
                        <option value="NON">Jamais de TVA (Makanhsbouhax)</option>
                        <option value="MIXTE">Au Choix (Kan3zel f l'Formulaire)</option>
                    </select>
                </div>

                {(parametres.tva_vente_mode === 'OUI' || parametres.tva_vente_mode === 'MIXTE') && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Taux TVA de Vente (%) :</label>
                        <input 
                            type="number" step="0.01" 
                            value={parametres.taux_tva_vente} 
                            onChange={(e) => setParametres({...parametres, taux_tva_vente: parseFloat(e.target.value)})}
                            style={{ width: '100px', padding: '8px' }} 
                        /> %
                    </div>
                )}

                <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

                <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}>
                    💾 Enregistrer les Paramètres
                </button>
            </form>
        </div>
    );
}

export default Parametres;