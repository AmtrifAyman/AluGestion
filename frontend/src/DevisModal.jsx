import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

const DevisModal = ({ devis, client, onClose }) => {
    const componentRef = useRef();

    const telechargerPDF = () => {
        const element = componentRef.current;
        const options = {
            margin:       10,
            filename:     `Devis_${devis.id}_${client?.nom || 'Client'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(options).from(element).save();
    };

    if (!devis) return null;

    // Calculs dyal l-modal direct
    const totalBrut = devis.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const valeurRemiseNum = parseFloat(devis.valeur_remise || 0);
    
    const remise = devis.type_remise === 'POURCENTAGE' ? (totalBrut * valeurRemiseNum) / 100 : 
                   devis.type_remise === 'MONTANT' ? valeurRemiseNum : 0;
                   
    const totalHT = totalBrut - remise;
    const mntTVA = parseFloat(devis.montant_tva || 0);
    const totalTTC = totalHT + mntTVA;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
            
            <div style={{
                backgroundColor: '#fff', padding: '20px', borderRadius: '8px', 
                width: '850px', maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                
                {/* BOUTONS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        ❌ Fermer
                    </button>
                    <button onClick={telechargerPDF} style={{ padding: '10px 20px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                        📥 Télécharger le Devis (PDF)
                    </button>
                </div>

                {/* ZONE PDF */}
                <div ref={componentRef} style={{ padding: '30px', color: '#2c3e50', fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif' }}>
                    
                    {/* En-tête */}
                    <div style={{ borderBottom: '3px solid #2c3e50', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>MON ENTREPRISE S.A.R.L</h1>
                            <p style={{ margin: '8px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Travaux de Menuiserie Aluminium & Vitrage</p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#34495e' }}>ICE: 12345678900000 | Tél: 06 00 00 00 00</p>
                        </div>
                        <div style={{ textAlign: 'right', backgroundColor: '#f8f9fa', padding: '15px 25px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                            <h2 style={{ margin: 0, color: '#6f42c1', letterSpacing: '2px' }}>DEVIS</h2>
                            <p style={{ margin: '8px 0 4px 0', fontSize: '15px' }}><strong>N° :</strong> {devis.id}</p>
                            <p style={{ margin: 0, fontSize: '14px' }}><strong>Date :</strong> {new Date(devis.date_devis).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Info d l'Client */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
                        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '350px', borderLeft: '5px solid #6f42c1', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                            <h4 style={{ margin: '0 0 12px 0', color: '#7f8c8d', textTransform: 'uppercase', fontSize: '12px' }}>Devis pour :</h4>
                            <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#2c3e50' }}><strong>{client?.nom}</strong></p>
                            <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>📞 {client?.telephone || 'N/A'}</p>
                            <p style={{ margin: 0, fontSize: '14px' }}>🏢 ICE : {client?.ice || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Tableau dyal Sla3 */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2c3e50', color: 'white', fontSize: '14px' }}>
                                <th style={{ padding: '12px', border: '1px solid #2c3e50', textAlign: 'left' }}>Désignation</th>
                                <th style={{ padding: '12px', border: '1px solid #2c3e50', textAlign: 'center', width: '80px' }}>Qté</th>
                                <th style={{ padding: '12px', border: '1px solid #2c3e50', textAlign: 'right', width: '120px' }}>Prix Unitaire</th>
                                <th style={{ padding: '12px', border: '1px solid #2c3e50', textAlign: 'right', width: '140px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devis.lignes && devis.lignes.map((ligne, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                    <td style={{ padding: '12px', border: '1px solid #e0e0e0' }}>{ligne.produit_nom || `Produit #${ligne.produit}`}</td>
                                    <td style={{ padding: '12px', border: '1px solid #e0e0e0', textAlign: 'center' }}>{ligne.quantite}</td>
                                    <td style={{ padding: '12px', border: '1px solid #e0e0e0', textAlign: 'right' }}>{parseFloat(ligne.prix_unitaire).toFixed(2)} DH</td>
                                    <td style={{ padding: '12px', border: '1px solid #e0e0e0', textAlign: 'right', fontWeight: '500' }}>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DH</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totaux m7boussin 7ad TTC */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '400px' }}>
                            
                            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px 8px 0 0', border: '1px solid #dee2e6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px' }}>
                                    <span style={{ color: '#7f8c8d' }}>Total Brut :</span>
                                    <span>{totalBrut.toFixed(2)} DH</span>
                                </div>
                                
                                {remise > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#e74c3c', fontSize: '14px' }}>
                                        <span>Remise ({devis.type_remise === 'POURCENTAGE' ? `${valeurRemiseNum}%` : 'Fixe'}) :</span>
                                        <span>- {remise.toFixed(2)} DH</span>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: 'bold', fontSize: '15px' }}>
                                    <span>Total Net HT :</span>
                                    <span>{totalHT.toFixed(2)} DH</span>
                                </div>

                                {(devis.avec_tva || mntTVA > 0) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#0056b3', fontSize: '14px' }}>
                                        <span>TVA Estimée :</span>
                                        <span>+ {mntTVA.toFixed(2)} DH</span>
                                    </div>
                                )}
                            </div>

                            {/* TOTAL TTC HNA KAYSALI L-DEVIS */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#6f42c1', color: 'white', fontWeight: 'bold', fontSize: '18px', borderRadius: '0 0 8px 8px' }}>
                                <span>TOTAL TTC ESTIMÉ :</span>
                                <span>{totalTTC.toFixed(2)} DH</span>
                            </div>

                        </div>
                    </div>
                    
                    <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '13px', color: '#95a5a6', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <p style={{ margin: '0 0 5px 0' }}>Ce document est un devis estimatif valable pour une durée de 30 jours.</p>
                        <p style={{ margin: 0, fontStyle: 'italic' }}>Merci pour votre consultation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DevisModal;