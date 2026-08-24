import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChargeForm() {
    // 1. 7yedna categorie, b9at ghir designation w montant
    const [charge, setCharge] = useState({
        designation: '',
        montant: ''
    });

    // 2. State bax nkhb3o fih les désignations li kano 9bel
    const [designationsExistantes, setDesignationsExistantes] = useState([]);

    // 3. Fonction bax njibo l'charges mn l'API w njbdo mnhom ghir les désignations
    const fetchCharges = () => {
        axios.get('http://127.0.0.1:8000/api/api/charges/')
            .then(res => {
                // Kan-récupériw ga3 les désignations (wakha m3awdin)
                const toutesDesignations = res.data.map(c => c.designation);
                // Kan-filtrerw bax tb9a kol we7da mktouba marra we7da (Unique)
                const designationsUniques = [...new Set(toutesDesignations)];
                setDesignationsExistantes(designationsUniques);
            })
            .catch(err => console.error("Mochkil f chargement dyal les charges:", err));
    };

    useEffect(() => {
        fetchCharges();
    }, []);

    const soumettreCharge = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/api/charges/', charge)
            .then(res => {
                alert('Mzyan! Lmasrouf tsjel f systéme.');
                setCharge({ designation: '', montant: '' });
                // N-actualisiw liste bax tzad l'designation jdida ila knti ktabtiha
                fetchCharges(); 
            })
            .catch(err => {
                console.error(err);
                alert('Kayn mochkil f tsjil dyal lmasrouf.');
            });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #dc3545', marginTop: '20px', borderRadius: '5px' }}>
            <form onSubmit={soumettreCharge} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <h3 style={{ margin: 0, color: '#dc3545' }}>💸 Enregistrer une Charge (Masrouf)</h3>

                <div>
                    {/* L'Astuce hya list="liste-designations" */}
                    <input 
                        type="text" 
                        list="liste-designations"
                        placeholder="Désignation (ex: L'kra, Daw...)" 
                        required 
                        value={charge.designation} 
                        onChange={(e) => setCharge({...charge, designation: e.target.value})} 
                        style={{ width: '250px', padding: '8px' }}
                    />
                    
                    {/* Hada howa l'composant li kay-générer dropdown */}
                    <datalist id="liste-designations">
                        {designationsExistantes.map((desig, index) => (
                            <option key={index} value={desig} />
                        ))}
                    </datalist>
                    
                    <input 
                        type="number" 
                        step="0.01" 
                        placeholder="Montant (DH)" 
                        required 
                        value={charge.montant} 
                        onChange={(e) => setCharge({...charge, montant: e.target.value})} 
                        style={{ marginLeft: '10px', width: '150px', padding: '8px' }} 
                    />
                </div>

                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: 'fit-content', borderRadius: '4px' }}>
                    Valider Lmasrouf
                </button>
            </form>
        </div>
    );
}

export default ChargeForm;