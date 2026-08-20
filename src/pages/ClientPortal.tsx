import React, { useState } from 'react';
import { toast } from 'sonner';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { LogoC4 } from '../../components/ui/Logos';
import { 
  Lock, User, FileText, Download, Calendar, 
  Clock, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const defaultClientPortalData = {
  project: {
    id: "PRJ-C4-DEMO",
    name: "Villa Océane - Pointe-Noire",
    progress: 65,
    status: "En cours",
    nextMilestone: "Pose de la charpente",
    date: "15 Mai 2026"
  },
  timeline: [
    { date: "10 Mars 2026", title: "Gros œuvre terminé", status: "completed", desc: "Les murs porteurs et la dalle supérieure sont achevés." },
    { date: "15 Fév 2026", title: "Fondations", status: "completed", desc: "Coulage des fondations et terrassement terminés." },
    { date: "10 Jan 2026", title: "Démarrage Chantier", status: "completed", desc: "Installation de la base vie et préparation du terrain." },
  ],
  documents: [
    { name: "Permis de Construire.pdf", date: "12 Déc 2025", size: "2.4 MB" },
    { name: "Facture Acompte 30%.pdf", date: "05 Jan 2026", size: "150 KB" },
    { name: "Plans Architecte Définitifs.pdf", date: "20 Nov 2025", size: "15 MB" },
  ]
};

const normalizePortalData = (value: any) => ({
  ...defaultClientPortalData,
  ...(value || {}),
  project: {
    ...defaultClientPortalData.project,
    ...(value?.project || {}),
  },
  timeline: (value?.timeline || defaultClientPortalData.timeline).map((item: any) => ({
    ...item,
    desc: item.desc || item.description || '',
  })),
  documents: value?.documents || defaultClientPortalData.documents,
});

const readLocalPortalData = () => {
  const savedData = localStorage.getItem('c4_client_portal_data');
  return normalizePortalData(savedData ? JSON.parse(savedData) : null);
};

export default function ClientPortal() {
  const portalPassword = import.meta.env.VITE_CLIENT_PORTAL_PASSWORD;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [portalData, setPortalData] = useState(() => readLocalPortalData());

  const loadPortalData = async (projectId: string, accessPassword: string) => {
    if (!isSupabaseConfigured) {
      return readLocalPortalData();
    }

    const { data, error } = await supabase.rpc('get_client_portal_by_credentials', {
      input_project_id: projectId.trim(),
      input_password: accessPassword,
    });

    if (error) throw error;
    const payload = Array.isArray(data) ? data[0]?.data : (data as any)?.data || data;
    if (!payload) throw new Error('INVALID_CLIENT_ACCESS');

    const normalized = normalizePortalData(payload);
    localStorage.setItem('c4_client_portal_data', JSON.stringify(normalized));
    return normalized;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isSupabaseConfigured && !portalPassword) {
      toast.error('Espace client désactivé : configurez VITE_CLIENT_PORTAL_PASSWORD.');
      setLoading(false);
      return;
    }

    try {
      const nextPortalData = await loadPortalData(email, password);
      const expectedProjectId = nextPortalData.project.id;
      const validProject = email.trim().toUpperCase() === expectedProjectId.toUpperCase();
      const validLocalAccess = !isSupabaseConfigured && password === portalPassword;

      if (validProject && (isSupabaseConfigured || validLocalAccess)) {
        setPortalData(nextPortalData);
        setIsAuthenticated(true);
        toast.success('Connexion réussie');
      } else {
        toast.error('Identifiant projet ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Erreur chargement espace client:', error);
      if (error instanceof Error && error.message === 'INVALID_CLIENT_ACCESS') {
        toast.error('Identifiant projet ou mot de passe incorrect');
      } else {
        toast.error("Impossible de charger l'espace client.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Déconnecté');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 w-full max-w-md relative z-10 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <LogoC4 className="h-20 w-auto" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Espace Client</h1>
            <p className="text-slate-400 text-sm">Accédez au suivi de votre chantier en temps réel.</p>
          </div>

          {!isSupabaseConfigured && !portalPassword && (
            <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
              Accès désactivé tant que l'espace client n'est pas configuré.
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Identifiant Projet</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition-all"
                  placeholder="Ex: PRJ-2026-089"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-lg text-white focus:border-yellow-500 outline-none transition-all"
                  placeholder="Mot de passe"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!isSupabaseConfigured && !portalPassword)}
              className="w-full py-3 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <span className="animate-spin">⌛</span> : 'Accéder à mon espace'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-white transition-colors">Retour au site principal</a>
          </div>
        </motion.div>
      </div>
    );
  }

  const project = portalData.project;
  const timeline = portalData.timeline;
  const documents = portalData.documents;

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoC4 className="h-12 w-auto" />
            <h1 className="text-xl font-display font-bold hidden md:block">Espace Client</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden md:inline">{email || 'Client'}</span>
            <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Progress Card */}
          <div className="md:col-span-2 bg-slate-900 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <h2 className="text-2xl font-display font-bold mb-2">{project.name}</h2>
            <div className="flex items-center gap-2 mb-8">
              <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-2">
                <Clock className="w-3 h-3" /> {project.status}
              </span>
              <span className="text-slate-400 text-sm">Prochaine étape : {project.nextMilestone} ({project.date})</span>
            </div>

            <div className="relative pt-4">
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Avancement Global</span>
                <span className="text-yellow-500">{project.progress}%</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Client Support */}
          <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 flex flex-col justify-center gap-5">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <FileText className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <h3 className="font-bold text-white">Documents centralisés</h3>
                <p className="text-sm text-slate-400">Les devis, factures et plans validés sont listés dans la section documents.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
              <div>
                <h3 className="font-bold text-white">Assistance projet</h3>
                <p className="text-sm text-slate-400">Pour une demande urgente, utilisez le contact direct indiqué par l'équipe C4.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Timeline */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-500" />
              Historique Chantier
            </h3>
            <div className="space-y-8 relative pl-8 border-l border-white/10">
              {timeline.map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-[39px] w-5 h-5 rounded-full bg-slate-950 border-2 border-yellow-500 z-10"></div>
                  <div className="bg-slate-900 p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <span className="text-xs text-slate-500">{item.date}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-yellow-500" />
              Documents Officiels
            </h3>
            <div className="space-y-4">
              {documents.map((doc: any, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{doc.name}</div>
                      <div className="text-xs text-slate-500">
                        {doc.date} - {doc.size} - {doc.url ? 'Disponible' : 'Disponible sur demande'}
                      </div>
                    </div>
                  </div>
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-bold uppercase tracking-wider text-yellow-500 hover:bg-yellow-500 hover:text-slate-950">
                      Ouvrir
                    </a>
                  ) : (
                    <Download className="w-5 h-5 text-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
