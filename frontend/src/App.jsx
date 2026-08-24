import { useState, useEffect } from 'react';
import axios from 'axios';
import Stock from './Stock'; 
import FactureForm from './FactureForm';
import AchatForm from './AchatForm';
import PaiementForm from './PaiementForm';
import ChargeForm from './ChargeForm';
import Parametres from './Parametres';
import ListeClients from './ListeClients';
import ListeFournisseurs from './ListeFournisseurs';
import FicheClient from './FicheClient';
import ArchiveAchats from './ArchiveAchats'; 
import ArchiveVentes from './ArchiveVentes'; 
import ArchiveTresorerie from './ArchiveTresorerie';
import SuiviTVA from './SuiviTVA';
import FicheFournisseur from './FicheFournisseur';
import Login from './Login';
import Dashboard from './Dashboard';
import DevisForm from './DevisForm';

function App() {
    // 1. State dyal Login
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // 2. State dyal l'navigation
    const [pageActuelle, setPageActuelle] = useState('DASHBOARD');
    
    // State l'ouverture dyal Sidebar f l'mobile
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 3. State dyal l'produits bax nsiftohom l'Stock w AchatForm
    const [produits, setProduits] = useState([]);

    const fetchProduits = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/api/produits/');
            setProduits(res.data);
        } catch (error) {
            console.error("Mochkil f jiban dyal produits:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsLoggedIn(true);
            fetchProduits();
        }

        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    console.log("Ssarout mat wla ghalet, khass t-logina mn jdid.");
                    localStorage.removeItem('access_token');
                    delete axios.defaults.headers.common['Authorization'];
                    setIsLoggedIn(false);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        delete axios.defaults.headers.common['Authorization'];
        setIsLoggedIn(false);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const changerPage = (page) => {
        setPageActuelle(page);
        if (window.innerWidth <= 768) {
            setSidebarOpen(false); // Sdd l'sidebar f mobile mni kaykhtar page
        }
    };

    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => {
            setIsLoggedIn(true);
            fetchProduits(); 
        }} />;
    }

    return (
        <div className="app-container">
            {/* Overlay pour le mobile quand la sidebar est ouverte */}
            {sidebarOpen && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    onClick={toggleSidebar}
                    className="sidebar-overlay"
                />
            )}

            {/* ===================== SIDEBAR ===================== */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>🏢 AluGestion</span>
                    <button className="close-sidebar-btn" onClick={toggleSidebar}>✕</button>
                </div>

                <div className="sidebar-menu">
                    {/* Tableau de bord */}
                    <div className="sidebar-section">Tableau de bord</div>
                    <button 
                        className={pageActuelle === 'DASHBOARD' ? 'active' : ''} 
                        onClick={() => changerPage('DASHBOARD')}>
                        📊 Dashboard
                    </button>

                    {/* Commercial (Caché sur Mobile) */}
                    <div className="sidebar-section hide-on-mobile">Commercial</div>
                    <button 
                        className={`hide-on-mobile ${pageActuelle === 'VENTE' ? 'active' : ''}`} 
                        onClick={() => changerPage('VENTE')}>
                        🛒 Nouvelle Vente
                    </button>
                    <button 
                        className={`hide-on-mobile ${pageActuelle === 'ACHAT' ? 'active' : ''}`} 
                        onClick={() => changerPage('ACHAT')}>
                        📥 Nouvel Achat
                    </button>
                    <button 
                        className={`hide-on-mobile ${pageActuelle === 'DevisForm' ? 'active' : ''}`} 
                        onClick={() => changerPage('DevisForm')}>
                        📝 Devis
                    </button>

                    {/* Stocks & Tiers */}
                    <div className="sidebar-section">Stocks & Tiers</div>
                    <button 
                        className={pageActuelle === 'STOCK' ? 'active' : ''} 
                        onClick={() => changerPage('STOCK')}>
                        📦 Stock
                    </button>
                    <button 
                        className={pageActuelle === 'CLIENTS' ? 'active' : ''} 
                        onClick={() => changerPage('CLIENTS')}>
                        👥 Clients (Kridi)
                    </button>
                    <button 
                        className={pageActuelle === 'FOURNISSEURS' ? 'active' : ''} 
                        onClick={() => changerPage('FOURNISSEURS')}>
                        🏭 Fournisseurs
                    </button>
                    <button 
                        className={pageActuelle === 'FICHE_CLIENT' ? 'active' : ''} 
                        onClick={() => changerPage('FICHE_CLIENT')}>
                        📋 Fiche Client
                    </button>
                    <button 
                        className={pageActuelle === 'FicheFournisseur' ? 'active' : ''} 
                        onClick={() => changerPage('FicheFournisseur')}>
                        📋 Fiche Fournisseur
                    </button>

                    {/* Trésorerie & Archives */}
                    <div className="sidebar-section">Trésorerie & Archives</div>
                    <button 
                        className={`hide-on-mobile ${pageActuelle === 'ChargeForm' ? 'active' : ''}`} 
                        onClick={() => changerPage('ChargeForm')}>
                        💸 Charges
                    </button>
                    <button 
                        className={`hide-on-mobile ${pageActuelle === 'PAIEMENT' ? 'active' : ''}`} 
                        onClick={() => changerPage('PAIEMENT')}>
                        💰 Paiements
                    </button>
                    <button 
                        className={pageActuelle === 'ArchiveVentes' ? 'active' : ''} 
                        onClick={() => changerPage('ArchiveVentes')}>
                        📅 Archive Ventes
                    </button>
                    <button 
                        className={pageActuelle === 'ARCHIVE_ACHAT' ? 'active' : ''} 
                        onClick={() => changerPage('ARCHIVE_ACHAT')}>
                        📅 Archive Achats
                    </button>
                    <button 
                        className={pageActuelle === 'ArchiveTresorerie' ? 'active' : ''} 
                        onClick={() => changerPage('ArchiveTresorerie')}>
                        📅 Archive Trésorerie
                    </button>
                </div>
            </aside>

            {/* ===================== MAIN CONTENT ===================== */}
            <main className="main-content">
                <header className="topbar">
                    <button className="hamburger-btn" onClick={toggleSidebar}>☰</button>
                    <h2 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center' }}>
                        <span className="hide-on-mobile" style={{ marginRight: '10px' }}>Système de Gestion</span>
                        {/* Optionnel: Titre de la page actuelle */}
                    </h2>
                    <button onClick={handleLogout} className="logout-btn">
                        Se Déconnecter 🚪
                    </button>
                </header>

                <div className="page-content">
                    {/* HNA KAN-AFFICHIW L'COMPOSANT 3LA 7SAB L'PAGE LI MKHTARA */}
                    {pageActuelle === 'STOCK' && <Stock produits={produits} fetchProduits={fetchProduits} />}
                    {pageActuelle === 'VENTE' && <FactureForm />}
                    {pageActuelle === 'ACHAT' && <AchatForm onAchatEffectue={fetchProduits} />}
                    {pageActuelle === 'CLIENTS' && <ListeClients />}
                    {pageActuelle === 'FOURNISSEURS' && <ListeFournisseurs />}
                    {pageActuelle === 'PAIEMENT' && <PaiementForm />}
                    {pageActuelle === 'FICHE_CLIENT' && <FicheClient />}
                    {pageActuelle === 'ChargeForm' && <ChargeForm />}
                    {pageActuelle === 'ARCHIVE_ACHAT' && <ArchiveAchats />}
                    {pageActuelle === 'ArchiveVentes' && <ArchiveVentes />}
                    {pageActuelle === 'ArchiveTresorerie' && <ArchiveTresorerie />}
                    {pageActuelle === 'SuiviTVA' && <SuiviTVA />}
                    {pageActuelle === 'Parametres' && <Parametres />}
                    {pageActuelle === 'FicheFournisseur' && <FicheFournisseur />}
                    {pageActuelle === 'DASHBOARD' && <Dashboard />}
                    {pageActuelle === 'DevisForm' && <DevisForm />}
                </div>
            </main>
        </div>
    );
}

export default App;