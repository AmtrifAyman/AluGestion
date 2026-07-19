import React, { useState, useEffect } from 'react';

const Layout = ({ children, pageTitle = "Tableau de Bord" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // --- SYSTEME DE DETECTION HORS-LIGNE (PWA) ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
            
            {/* Banner kat-tla3 l-fo9 gha ila t9t3at l-connexion */}
            {!isOnline && (
                <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs md:text-sm font-semibold sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md transition-all duration-300">
                    <span>⚠️ Mode hors ligne actif. L-khedma ghat-tsjel localement w ghat-tsyncra mni trje3 l-connexion.</span>
                </div>
            )}

            <div className="flex flex-1 relative overflow-hidden">
                
                {/* --- 1. SIDEBAR (RESPONSIVE) --- */}
                {/* f l-PC: tabta f j-jnb | f l-Mobile: Drawer ki-t7l b Hamburger */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
                    md:translate-x-0 md:static md:h-auto
                    ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
                `}>
                    {/* Logo d l-Meqwla */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
                        <span className="text-lg font-bold tracking-wider text-white flex items-center gap-2">
                            🛠️ AluGestion
                        </span>
                        {/* Bouton d l-sadd gha f Mobile */}
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white focus:outline-none text-xl">
                            ✕
                        </button>
                    </div>

                    {/* Liens de Navigation */}
                    <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-slate-800 text-white font-medium transition">
                            <span>📊 Dashboard</span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
                            <span>🛒 Ventes (Factures)</span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
                            <span>📋 Devis</span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
                            <span>📦 Stock / Matériaux</span>
                        </a>
                        <a href="#" className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-white transition">
                            <span>👥 Clients & Créances</span>
                        </a>
                    </nav>

                    {/* Bottom Sidebar info */}
                    <div className="p-4 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 text-center">
                        v1.0.0 • Atelier Offline-First
                    </div>
                </aside>

                {/* Background b-gris f mobile mni kat-t7l l-sidebar */}
                {sidebarOpen && (
                    <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden transition-opacity" />
                )}

                {/* --- 2. MAIN CONTENT CONTAINER --- */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                    
                    {/* --- HEADER --- */}
                    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 shadow-sm">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Button gha f mobile */}
                            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 focus:outline-none text-xl">
                                ☰
                            </button>
                            <h1 className="text-lg md:text-xl font-bold text-slate-800">{pageTitle}</h1>
                        </div>

                        {/* Status d l-Connexion (Online/Offline Indicator) */}
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-inner ${
                                isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                                <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                <span className="hidden sm:inline">{isOnline ? 'Connecté' : 'Hors ligne'}</span>
                                <span className="sm:hidden">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                        </div>
                    </header>

                    {/* --- ZONE DYAL L-KHEDMA (PAGES) --- */}
                    <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto transition-all duration-300">
                        {children}
                    </main>

                </div>
            </div>
        </div>
    );
};

export default Layout;