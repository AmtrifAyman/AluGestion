import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState({
        kridiClients: 0,
        dettesFournisseurs: 0,
        totalCharges: 0
    });

    useEffect(() => {
        // Fonction bax njibo l'm3lomat w n-7esbohom
        const fetchDashboardData = async () => {
            try {
                // 1. Njibo l'Tiers (Klyan w Fournisseurs)
                const resTiers = await axios.get('http://127.0.0.1:8000/api/api/tiers/');
                const tiers = resTiers.data;
                
                let totalClients = 0;
                let totalFournisseurs = 0;

                tiers.forEach(tier => {
                    // Mola7ada: T2ked mn smyat l'champs 3ndek f Django (type_tier w solde)
                    if (tier.type_tier === 'CLIENT' || tier.type_tier === 'Client') {
                        totalClients += parseFloat(tier.solde || 0);
                    } else if (tier.type_tier === 'FOURNISSEUR' || tier.type_tier === 'Fournisseur') {
                        totalFournisseurs += parseFloat(tier.solde || 0);
                    }
                });

                // 2. Njibo l'Masarif (Charges)
                const resCharges = await axios.get('http://127.0.0.1:8000/api/api/charges/');
                const charges = resCharges.data;
                
                let totalC = 0;
                charges.forEach(charge => {
                    totalC += parseFloat(charge.montant || 0);
                });

                // N-sajlo l'7sab f state
                setStats({
                    kridiClients: totalClients,
                    dettesFournisseurs: totalFournisseurs,
                    totalCharges: totalC
                });

            } catch (error) {
                console.error("Mochkil f chargement dyal l'i7sa2iyat:", error);
            }
        };

        fetchDashboardData();
    }, []);

    // Style dyal les cartes (Cards)
    const cardStyle = {
        flex: 1,
        padding: '20px',
        borderRadius: '10px',
        color: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        minWidth: '250px',
        textAlign: 'center'
    };

    return (
        <div>
            <h2 style={{ marginBottom: '20px' }}>📈 Tableau de Bord (Résumé)</h2>
            
            <div className="card-group">
                
                {/* Carte dyal l'kridi li katsal l'klyan */}
                <div className="stat-card success">
                    <h3>Flousi 3nd L'klyan</h3>
                    <p className="value">
                        {stats.kridiClients.toFixed(2)} DH
                    </p>
                    <small style={{ color: 'var(--muted)' }}>Total dyal l'kridi li makhlsokch fih</small>
                </div>

                {/* Carte dyal kridi d sl3a li kaysalouk */}
                <div className="stat-card danger">
                    <h3>Dettes Fournisseurs</h3>
                    <p className="value">
                        {stats.dettesFournisseurs.toFixed(2)} DH
                    </p>
                    <small style={{ color: 'var(--muted)' }}>Total li khassk t-kheles l'mwalin sl3a</small>
                </div>

                {/* Carte dyal l'masarif (Charges) */}
                <div className="stat-card warning">
                    <h3>Total dyal l'Masarif</h3>
                    <p className="value">
                        {stats.totalCharges.toFixed(2)} DH
                    </p>
                    <small style={{ color: 'var(--muted)' }}>L'kra, daw, transport, etc...</small>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;