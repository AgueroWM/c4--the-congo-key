import React, { useEffect, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { LogoC4 } from '../../components/ui/Logos';

type AdminTab = 'client_portal' | 'contacts' | 'projects' | 'portfolio';

type PortalDocument = {
  name: string;
  date: string;
  size: string;
  url?: string;
  type?: string;
};

const defaultClientPortalData = {
  project: {
    id: 'PRJ-C4-DEMO',
    name: 'Projet client - Pointe-Noire',
    progress: 65,
    status: 'En cours',
    nextMilestone: 'Etape suivante a definir',
    date: '15 Mai 2026',
  },
  timeline: [
    { date: '10 Mars 2026', title: 'Etape chantier', status: 'completed', desc: 'Avancement a completer avec le client.' },
    { date: '15 Fev 2026', title: 'Preparation', status: 'completed', desc: 'Elements a definir ensemble pour la demo.' },
  ],
  documents: [
    { name: 'Document projet.pdf', date: 'A definir', size: '-', url: '' },
  ],
};

const emptyProject = {
  title: '',
  category: 'Logistique',
  lat: '-4.769',
  long: '11.866',
  video_url: '',
  description: 'A definir ensemble',
};

const emptyPortfolioProject = {
  label: 'A definir ensemble',
  before: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop',
  after: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?q=80&w=1600&auto=format&fit=crop',
  duration: 'A definir ensemble',
  surface: 'A definir ensemble',
};

const defaultMapProjects = [
  {
    id: 'local-map-1',
    title: 'Entrepot industriel',
    category: 'Commercial',
    lat: -4.769,
    long: 11.866,
    video_url: 'https://cdn.coverr.co/videos/coverr-construction-site-of-a-building-2615/1080p.mp4',
    description: 'Plateforme logistique moderne.',
    isLocalDemo: true,
  },
  {
    id: 'local-map-2',
    title: 'Immeuble tertiaire',
    category: 'Commercial',
    lat: -4.785,
    long: 11.875,
    video_url: 'https://cdn.coverr.co/videos/coverr-modern-house-with-a-pool-2618/1080p.mp4',
    description: 'Programme de bureaux et services premium.',
    isLocalDemo: true,
  },
  {
    id: 'local-map-3',
    title: 'Hub logistique CMA CGM',
    category: 'Logistique',
    lat: -4.750,
    long: 11.880,
    video_url: 'https://cdn.coverr.co/videos/coverr-cargo-ship-at-port-2619/1080p.mp4',
    description: 'Entrepot logistique de derniere generation.',
    isLocalDemo: true,
  },
];

const defaultPortfolioProjects = [
  {
    id: 'local-portfolio-1',
    label: 'A definir ensemble',
    before: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?q=80&w=1600&auto=format&fit=crop',
    duration: 'A definir ensemble',
    surface: 'A definir ensemble',
    isLocalDemo: true,
  },
  {
    id: 'local-portfolio-2',
    label: 'A definir ensemble',
    before: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600&auto=format&fit=crop',
    duration: 'A definir ensemble',
    surface: 'A definir ensemble',
    isLocalDemo: true,
  },
];

const normalizeClientPortalData = (value: any) => ({
  ...defaultClientPortalData,
  ...(value || {}),
  project: {
    ...defaultClientPortalData.project,
    ...(value?.project || {}),
  },
  timeline: (value?.timeline || defaultClientPortalData.timeline).map((item: any) => ({
    ...item,
    desc: item.desc || item.description || '',
    status: item.status || 'completed',
  })),
  documents: (value?.documents || defaultClientPortalData.documents).map((doc: any) => ({
    name: doc.name || '',
    date: doc.date || '',
    size: doc.size || '',
    url: doc.url || '',
    type: doc.type || 'pdf',
  })),
});

const sanitizeFileName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
};

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(url);

const isLocalDemoRecord = (record: any) => Boolean(record?.isLocalDemo || String(record?.id || '').startsWith('local-'));

const getSupabaseErrorMessage = (error: any) => {
  if (!error) return 'Erreur inconnue';
  return error.message || error.details || error.hint || String(error);
};

const todayLabel = () => new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date());

export default function Admin() {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('client_portal');
  const [contacts, setContacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState(emptyProject);

  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolioProject, setEditingPortfolioProject] = useState<any>(null);
  const [newPortfolioProject, setNewPortfolioProject] = useState(emptyPortfolioProject);
  const [clientPortals, setClientPortals] = useState<any[]>([]);
  const [selectedClientPortalId, setSelectedClientPortalId] = useState('');
  const [clientPortalPassword, setClientPortalPassword] = useState(import.meta.env.VITE_CLIENT_PORTAL_PASSWORD || 'client-demo-2026');

  const [clientPortalData, setClientPortalData] = useState(() => {
    const saved = localStorage.getItem('c4_client_portal_data');
    return normalizeClientPortalData(saved ? JSON.parse(saved) : null);
  });

  const mapPosition = useMemo(() => ({
    latitude: Number(newProject.lat) || -4.769,
    longitude: Number(newProject.long) || 11.866,
  }), [newProject.lat, newProject.long]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
      if (error) {
        toast.error('Identifiants admin incorrects');
        setAuthLoading(false);
        return;
      }
      setIsAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    if (!adminPassword) {
      toast.error('Acces admin desactive : configurez VITE_ADMIN_PASSWORD.');
      setAuthLoading(false);
      return;
    }

    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAuthLoading(false);
      return;
    }

    toast.error('Mot de passe incorrect');
    setAuthLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      toast.error('Supabase doit etre configure pour creer un compte admin.');
      return;
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setAuthLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      },
    });
    setAuthLoading(false);

    if (error) {
      toast.error(error.message || 'Impossible de creer le compte admin.');
      return;
    }

    if (data.session) {
      setIsAuthenticated(true);
      toast.success('Compte admin cree et connecte.');
      return;
    }

    setIsCreatingAccount(false);
    setPassword('');
    setConfirmPassword('');
    toast.success('Compte cree. Validez l email si Supabase le demande, puis connectez-vous.');
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setIsAuthenticated(false);
    setPassword('');
    setConfirmPassword('');
  };

  const uploadFile = async (file: File | undefined, bucket: 'site-assets' | 'client-documents', fieldKey: string) => {
    if (!file) return '';
    if (!isSupabaseConfigured) {
      toast.error('Supabase doit etre configure pour uploader des fichiers.');
      return '';
    }

    try {
      setUploadingField(fieldKey);
      const path = `${Date.now()}-${sanitizeFileName(file.name)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      toast.success('Fichier publie');
      return data.publicUrl;
    } catch (error) {
      console.error(error);
      toast.error("Upload impossible. Verifiez le bucket Supabase et les policies.");
      return '';
    } finally {
      setUploadingField('');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    if (!isSupabaseConfigured) {
      setLoading(false);
      toast.error('Supabase non configure : seuls les reglages locaux de demo sont disponibles.');
      return;
    }

    try {
      const { data: portalSettings } = await supabase
        .from('client_portal_settings')
        .select('data')
        .eq('id', 'default')
        .maybeSingle();

      const { data: portalRows, error: portalRowsError } = await supabase
        .from('client_portals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!portalRowsError && portalRows?.length) {
        setClientPortals(portalRows);
        setSelectedClientPortalId(portalRows[0].id);
        setClientPortalPassword(portalRows[0].access_password || '');
        const normalized = normalizeClientPortalData(portalRows[0].data);
        setClientPortalData(normalized);
        localStorage.setItem('c4_client_portal_data', JSON.stringify(normalized));
      } else if (portalSettings?.data) {
        const normalized = normalizeClientPortalData(portalSettings.data);
        setClientPortalData(normalized);
        localStorage.setItem('c4_client_portal_data', JSON.stringify(normalized));
      }

      const [
        { data: contactsData, error: contactsError },
        { data: projectsData, error: projectsError },
        { data: portfolioData, error: portfolioError },
      ] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('map_projects').select('*').order('created_at', { ascending: false }),
        supabase.from('portfolio_projects').select('*').order('created_at', { ascending: false }),
      ]);

      if (contactsError) toast.error(`Contacts non charges : ${getSupabaseErrorMessage(contactsError)}`);
      if (projectsError) toast.error(`Carte non chargee : ${getSupabaseErrorMessage(projectsError)}`);
      if (portfolioError) toast.error(`Showroom non charge : ${getSupabaseErrorMessage(portfolioError)}`);

      setContacts(contactsData || []);
      setProjects(projectsData?.length ? projectsData : defaultMapProjects);
      setPortfolioProjects(portfolioData?.length ? portfolioData : defaultPortfolioProjects);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setProjects(defaultMapProjects);
      setPortfolioProjects(defaultPortfolioProjects);
      toast.error(`Erreur lors du chargement des donnees : ${getSupabaseErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();

    if (!isSupabaseConfigured) return;
    const contactsSubscription = supabase
      .channel('public:contacts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, payload => {
        setContacts(prev => [payload.new, ...prev]);
        toast.success(`Nouveau lead : ${payload.new.company || payload.new.name}`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contactsSubscription);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setIsAuthenticated(true);
    });
  }, []);

  const saveClientPortalData = async () => {
    const normalized = normalizeClientPortalData(clientPortalData);
    localStorage.setItem('c4_client_portal_data', JSON.stringify(normalized));
    setClientPortalData(normalized);

    if (!isSupabaseConfigured) {
      toast.success("Espace client sauvegarde localement");
      return;
    }

    try {
      const payload = {
        project_id: normalized.project.id,
        access_password: clientPortalPassword,
        data: normalized,
        updated_at: new Date().toISOString(),
      };

      if (selectedClientPortalId) {
        const { data, error } = await supabase
          .from('client_portals')
          .update(payload)
          .eq('id', selectedClientPortalId)
          .select()
          .single();
        if (error) throw error;
        setClientPortals(clientPortals.map(portal => portal.id === selectedClientPortalId ? data : portal));
      } else {
        const { data, error } = await supabase
          .from('client_portals')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setClientPortals([data, ...clientPortals]);
        setSelectedClientPortalId(data.id);
      }

      await supabase.from('client_portal_settings').upsert({
        id: 'default',
        data: normalized,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      toast.success("Espace client publie");
    } catch (error) {
      console.error(error);
      toast.error("Sauvegarde distante impossible");
    }
  };

  const saveMapProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase non configure : ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local puis redemarrez Vite.');
      return;
    }
    if (!newProject.lat || !newProject.long) {
      toast.error('Cliquez sur la carte pour placer le point.');
      return;
    }

    const payload = {
      title: newProject.title,
      category: newProject.category,
      lat: Number(newProject.lat),
      long: Number(newProject.long),
      video_url: newProject.video_url,
      description: newProject.description,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editingProject && !isLocalDemoRecord(editingProject)) {
        const { data, error } = await supabase.from('map_projects').update(payload).eq('id', editingProject.id).select();
        if (error) throw error;
        setProjects(projects.map(project => project.id === editingProject.id ? data?.[0] : project));
        toast.success('Point carte modifie');
      } else {
        const { data, error } = await supabase.from('map_projects').insert([payload]).select();
        if (error) throw error;
        const nextProjects = editingProject
          ? projects.map(project => project.id === editingProject.id ? data?.[0] : project)
          : [data?.[0], ...projects];
        setProjects(nextProjects.filter(Boolean));
        toast.success(editingProject ? 'Point carte publie' : 'Point carte ajoute');
      }
      closeProjectModal();
    } catch (error) {
      console.error(error);
      toast.error(`Impossible d'enregistrer le point carte : ${getSupabaseErrorMessage(error)}`);
    }
  };

  const savePortfolioProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('Supabase non configure : ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local puis redemarrez Vite.');
      return;
    }

    try {
      const payload = {
        ...newPortfolioProject,
        updated_at: new Date().toISOString(),
      };

      if (editingPortfolioProject && !isLocalDemoRecord(editingPortfolioProject)) {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .update(payload)
          .eq('id', editingPortfolioProject.id)
          .select();
        if (error) throw error;
        setPortfolioProjects(portfolioProjects.map(project => project.id === editingPortfolioProject.id ? data?.[0] : project));
        toast.success('Showroom modifie');
      } else {
        const { data, error } = await supabase.from('portfolio_projects').insert([payload]).select();
        if (error) throw error;
        const nextProjects = editingPortfolioProject
          ? portfolioProjects.map(project => project.id === editingPortfolioProject.id ? data?.[0] : project)
          : [data?.[0], ...portfolioProjects];
        setPortfolioProjects(nextProjects.filter(Boolean));
        toast.success(editingPortfolioProject ? 'Showroom publie' : 'Showroom ajoute');
      }
      closePortfolioModal();
    } catch (error) {
      console.error(error);
      toast.error(`Impossible d'enregistrer le showroom : ${getSupabaseErrorMessage(error)}`);
    }
  };

  const deleteRecord = async (table: 'map_projects' | 'portfolio_projects', id: string) => {
    if (!window.confirm('Supprimer cet element ?')) return;
    if (String(id).startsWith('local-')) {
      if (table === 'map_projects') setProjects(projects.filter(project => project.id !== id));
      if (table === 'portfolio_projects') setPortfolioProjects(portfolioProjects.filter(project => project.id !== id));
      toast.success('Element de demonstration retire de cette session');
      return;
    }

    if (!isSupabaseConfigured) {
      toast.error('Supabase non configure : ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local puis redemarrez Vite.');
      return;
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      toast.error(`Suppression impossible : ${getSupabaseErrorMessage(error)}`);
      return;
    }

    if (table === 'map_projects') setProjects(projects.filter(project => project.id !== id));
    if (table === 'portfolio_projects') setPortfolioProjects(portfolioProjects.filter(project => project.id !== id));
    toast.success('Element supprime');
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
    setNewProject(emptyProject);
  };

  const closePortfolioModal = () => {
    setIsPortfolioModalOpen(false);
    setEditingPortfolioProject(null);
    setNewPortfolioProject(emptyPortfolioProject);
  };

  const openEditProjectModal = (project: any) => {
    setEditingProject(project);
    setNewProject({
      title: project.title || '',
      category: project.category || 'Logistique',
      lat: String(project.lat || ''),
      long: String(project.long || ''),
      video_url: project.video_url || '',
      description: project.description || '',
    });
    setIsProjectModalOpen(true);
  };

  const openEditPortfolioProjectModal = (project: any) => {
    setEditingPortfolioProject(project);
    setNewPortfolioProject({
      label: project.label || 'A definir ensemble',
      before: project.before || '',
      after: project.after || '',
      duration: project.duration || 'A definir ensemble',
      surface: project.surface || 'A definir ensemble',
    });
    setIsPortfolioModalOpen(true);
  };

  const updateDocument = (index: number, patch: Partial<PortalDocument>) => {
    const documents = [...clientPortalData.documents];
    documents[index] = { ...documents[index], ...patch };
    setClientPortalData({ ...clientPortalData, documents });
  };

  const selectClientPortal = (portalId: string) => {
    const portal = clientPortals.find(item => item.id === portalId);
    if (!portal) return;
    const normalized = normalizeClientPortalData(portal.data);
    setSelectedClientPortalId(portal.id);
    setClientPortalPassword(portal.access_password || '');
    setClientPortalData(normalized);
    localStorage.setItem('c4_client_portal_data', JSON.stringify(normalized));
  };

  const createClientPortal = () => {
    const nextData = normalizeClientPortalData({
      project: {
        ...defaultClientPortalData.project,
        id: `PRJ-C4-${Date.now().toString().slice(-4)}`,
        name: 'Nouveau projet client',
      },
      timeline: [],
      documents: [],
    });
    setSelectedClientPortalId('');
    setClientPortalPassword('');
    setClientPortalData(nextData);
  };

  const deleteClientPortal = async () => {
    if (!selectedClientPortalId) {
      createClientPortal();
      return;
    }
    if (!window.confirm('Supprimer cet espace client ?')) return;
    if (!isSupabaseConfigured) {
      toast.error('Supabase non configure : ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local puis redemarrez Vite.');
      return;
    }

    const { error } = await supabase.from('client_portals').delete().eq('id', selectedClientPortalId);
    if (error) {
      toast.error('Suppression impossible');
      return;
    }

    const remaining = clientPortals.filter(portal => portal.id !== selectedClientPortalId);
    setClientPortals(remaining);
    if (remaining[0]) {
      selectClientPortal(remaining[0].id);
    } else {
      createClientPortal();
    }
    toast.success('Espace client supprime');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 flex justify-center">
            <LogoC4 className="h-20 w-auto" />
          </div>
          <h1 className="mb-2 text-center text-2xl font-display font-bold text-white">
            {isCreatingAccount ? 'Creer un compte admin' : 'Admin C4'}
          </h1>
          {isSupabaseConfigured && (
            <p className="mb-6 text-center text-sm text-slate-400">
              {isCreatingAccount ? 'Creez le premier acces Supabase Auth.' : 'Connexion avec un utilisateur Supabase Auth.'}
            </p>
          )}
          {!isSupabaseConfigured && !adminPassword && (
            <div className="mb-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-100">
              Interface desactivee tant que le mot de passe admin n'est pas configure.
            </div>
          )}
          <form onSubmit={isCreatingAccount ? handleCreateAccount : handleLogin} className="space-y-4">
            {isSupabaseConfigured && (
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Email admin Supabase"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                required
              />
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
              required
            />
            {isCreatingAccount && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-500"
                required
              />
            )}
            <button
              type="submit"
              disabled={authLoading || (!isSupabaseConfigured && !adminPassword)}
              className="w-full rounded-lg bg-yellow-500 py-3 font-bold text-slate-950 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {authLoading ? 'Traitement...' : isCreatingAccount ? 'Creer le compte' : 'Connexion'}
            </button>
          </form>
          {isSupabaseConfigured && (
            <button
              type="button"
              onClick={() => {
                setIsCreatingAccount(prev => !prev);
                setPassword('');
                setConfirmPassword('');
              }}
              className="mt-5 w-full text-center text-sm font-semibold text-yellow-400 transition-colors hover:text-yellow-300"
            >
              {isCreatingAccount ? 'J ai deja un compte admin' : 'Creer le premier compte admin'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="flex w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 p-6">
          <LogoC4 className="h-14 w-auto" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {[
            { id: 'client_portal', label: 'Espace Client', icon: LayoutDashboard },
            { id: 'contacts', label: 'Contacts', icon: Users },
            { id: 'projects', label: 'Carte', icon: MapPin },
            { id: 'portfolio', label: 'Showroom', icon: ImageIcon },
          ].map((item) => {
            const Icon = item.icon;
            const selected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${selected ? 'bg-yellow-500/10 text-yellow-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-400 transition-colors hover:text-red-400">
            <LogOut className="h-5 w-5" />
            Deconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-500">Administration</p>
            <h2 className="mt-2 text-3xl font-display font-bold">
              {activeTab === 'client_portal' && 'Espace client'}
              {activeTab === 'contacts' && 'Contacts'}
              {activeTab === 'projects' && 'Carte des projets'}
              {activeTab === 'portfolio' && 'Showroom'}
            </h2>
          </div>
          <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-400">
            {isSupabaseConfigured ? 'Supabase connecte' : 'Mode local demo'}
          </span>
        </header>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-yellow-500" />
          </div>
        ) : (
          <>
            {activeTab === 'client_portal' && (
              <section className="space-y-8">
                <div className="rounded-xl border border-white/10 bg-slate-900 p-6">
                  <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    {isSupabaseConfigured ? (
                      <>
                        Espace client actif : identifiant <strong>{clientPortalData.project.id}</strong>. Les documents uploades ici sont publies dans Supabase Storage et visibles dans /portal.
                      </>
                    ) : (
                      <>
                        Supabase n'est pas configure cote site. Ajouter <strong>VITE_SUPABASE_URL</strong> et <strong>VITE_SUPABASE_ANON_KEY</strong> dans <strong>.env.local</strong>, puis redemarrer le serveur Vite.
                      </>
                    )}
                  </div>

                  <div className="mb-8 rounded-xl border border-white/10 bg-slate-950 p-4">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div className="min-w-0 flex-1">
                        <label className="mb-2 block text-sm text-slate-400">Espace client a modifier</label>
                        <select
                          value={selectedClientPortalId}
                          onChange={(e) => selectClientPortal(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-yellow-500"
                          disabled={!clientPortals.length}
                        >
                          {!clientPortals.length && <option value="">Aucun espace encore publie</option>}
                          {clientPortals.map((portal) => (
                            <option key={portal.id} value={portal.id}>
                              {portal.project_id} - {portal.data?.project?.name || 'Projet client'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={createClientPortal} className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm font-bold text-yellow-500 hover:bg-yellow-500 hover:text-slate-950">
                          <Plus className="h-4 w-4" /> Nouvel espace
                        </button>
                        <button onClick={deleteClientPortal} className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-400 hover:text-slate-950">
                          <Trash2 className="h-4 w-4" /> Supprimer
                        </button>
                      </div>
                    </div>
                    <label className="block space-y-2 text-sm text-slate-400">
                      Mot de passe client
                      <input
                        value={clientPortalPassword}
                        onChange={(e) => setClientPortalPassword(e.target.value)}
                        placeholder="Mot de passe de cet espace client"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white outline-none focus:border-yellow-500"
                      />
                    </label>
                  </div>

                  <h3 className="mb-4 text-xl font-bold">Projet client</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      ['Identifiant projet', 'id'],
                      ['Nom du projet', 'name'],
                      ['Statut', 'status'],
                      ['Prochaine etape', 'nextMilestone'],
                      ['Date prevue', 'date'],
                    ].map(([label, key]) => (
                      <label key={key} className="space-y-2 text-sm text-slate-400">
                        {label}
                        <input
                          value={(clientPortalData.project as any)[key]}
                          onChange={(e) => setClientPortalData({
                            ...clientPortalData,
                            project: { ...clientPortalData.project, [key]: e.target.value },
                          })}
                          className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500"
                        />
                      </label>
                    ))}
                    <label className="space-y-2 text-sm text-slate-400">
                      Progression (%)
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={clientPortalData.project.progress}
                        onChange={(e) => setClientPortalData({
                          ...clientPortalData,
                          project: { ...clientPortalData.project, progress: Number(e.target.value) },
                        })}
                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500"
                      />
                    </label>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h4 className="mb-4 text-lg font-bold">Historique chantier</h4>
                    <div className="space-y-4">
                      {clientPortalData.timeline.map((item: any, index: number) => (
                        <div key={index} className="flex gap-4 rounded-lg border border-white/5 bg-slate-950 p-4">
                          <div className="flex-1 space-y-2">
                            <input
                              value={item.date}
                              onChange={(e) => {
                                const timeline = [...clientPortalData.timeline];
                                timeline[index].date = e.target.value;
                                setClientPortalData({ ...clientPortalData, timeline });
                              }}
                              placeholder="Date"
                              className="w-full rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <input
                              value={item.title}
                              onChange={(e) => {
                                const timeline = [...clientPortalData.timeline];
                                timeline[index].title = e.target.value;
                                setClientPortalData({ ...clientPortalData, timeline });
                              }}
                              placeholder="Titre"
                              className="w-full rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <textarea
                              value={item.desc}
                              onChange={(e) => {
                                const timeline = [...clientPortalData.timeline];
                                timeline[index].desc = e.target.value;
                                setClientPortalData({ ...clientPortalData, timeline });
                              }}
                              placeholder="Description"
                              className="h-20 w-full resize-none rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                          </div>
                          <button
                            onClick={() => setClientPortalData({
                              ...clientPortalData,
                              timeline: clientPortalData.timeline.filter((_: any, i: number) => i !== index),
                            })}
                            className="h-10 rounded p-2 text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setClientPortalData({
                        ...clientPortalData,
                        timeline: [...clientPortalData.timeline, { date: '', title: '', desc: '', status: 'completed' }],
                      })}
                      className="mt-4 flex items-center gap-2 text-sm font-bold text-yellow-500"
                    >
                      <Plus className="h-4 w-4" /> Ajouter une etape
                    </button>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-8">
                    <h4 className="mb-4 text-lg font-bold">Documents</h4>
                    <div className="space-y-4">
                      {clientPortalData.documents.map((doc: PortalDocument, index: number) => (
                        <div key={index} className="rounded-lg border border-white/5 bg-slate-950 p-4">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_160px_140px_auto]">
                            <input
                              value={doc.name}
                              onChange={(e) => updateDocument(index, { name: e.target.value })}
                              placeholder="Nom du document"
                              className="rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <input
                              value={doc.date}
                              onChange={(e) => updateDocument(index, { date: e.target.value })}
                              placeholder="Date"
                              className="rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <input
                              value={doc.size}
                              onChange={(e) => updateDocument(index, { size: e.target.value })}
                              placeholder="Taille"
                              className="rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <button
                              onClick={() => setClientPortalData({
                                ...clientPortalData,
                                documents: clientPortalData.documents.filter((_: any, i: number) => i !== index),
                              })}
                              className="rounded p-2 text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <input
                              value={doc.url || ''}
                              onChange={(e) => updateDocument(index, { url: e.target.value })}
                              placeholder="URL du document"
                              className="min-w-72 flex-1 rounded border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm font-bold text-yellow-500 hover:bg-yellow-500 hover:text-slate-950">
                              <Upload className="h-4 w-4" />
                              {uploadingField === `doc-${index}` ? 'Upload...' : 'Uploader'}
                              <input
                                type="file"
                                className="hidden"
                                onChange={async (event) => {
                                  const file = event.target.files?.[0];
                                  const url = await uploadFile(file, 'client-documents', `doc-${index}`);
                                  if (url && file) updateDocument(index, {
                                    url,
                                    name: doc.name || file.name,
                                    size: formatFileSize(file.size),
                                    date: doc.date || todayLabel(),
                                  });
                                  event.currentTarget.value = '';
                                }}
                              />
                            </label>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                                <ExternalLink className="h-4 w-4" /> Tester
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setClientPortalData({
                        ...clientPortalData,
                        documents: [...clientPortalData.documents, { name: '', date: '', size: '', url: '', type: 'pdf' }],
                      })}
                      className="mt-4 flex items-center gap-2 text-sm font-bold text-yellow-500"
                    >
                      <Plus className="h-4 w-4" /> Ajouter un document
                    </button>
                  </div>

                  <button onClick={saveClientPortalData} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 font-bold text-slate-950 hover:bg-yellow-400">
                    <Save className="h-4 w-4" /> Sauvegarder et publier
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'contacts' && (
              <section className="overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Nom</th>
                      <th className="p-4 font-medium">Societe</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Message</th>
                      <th className="p-4 font-medium">Piece jointe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">Aucun contact pour le moment.</td>
                      </tr>
                    ) : contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/5">
                        <td className="p-4 text-sm text-slate-400">{contact.created_at ? format(new Date(contact.created_at), 'dd MMM yyyy', { locale: fr }) : '-'}</td>
                        <td className="p-4 font-medium">{contact.name}</td>
                        <td className="p-4 text-slate-300">{contact.company || '-'}</td>
                        <td className="p-4 text-yellow-500">{contact.email}</td>
                        <td className="max-w-xs truncate p-4 text-sm text-slate-400" title={contact.message}>{contact.message}</td>
                        <td className="p-4">
                          {contact.attachment_url ? (
                            <a href={contact.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline">
                              <Download className="h-4 w-4" /> Telecharger
                            </a>
                          ) : <span className="text-sm text-slate-600">Aucun</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {activeTab === 'projects' && (
              <section>
                <div className="mb-6 flex justify-end">
                  <button onClick={() => setIsProjectModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-slate-950 hover:bg-yellow-400">
                    <Plus className="h-5 w-5" /> Ajouter un point
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {projects.map((project) => (
                    <article key={project.id} className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                      <div className="relative h-48 bg-slate-800">
                        {project.video_url ? (
                          isImageUrl(project.video_url) ? (
                            <img src={project.video_url} alt={project.title} className="h-full w-full object-cover" />
                          ) : (
                            <video src={project.video_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center"><ImageIcon className="h-12 w-12 text-slate-600" /></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEditProjectModal(project)} className="rounded-full bg-blue-500/80 p-2 text-white hover:bg-blue-500"><Pencil className="h-5 w-5" /></button>
                          <button onClick={() => deleteRecord('map_projects', project.id)} className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="font-bold">{project.title}</h3>
                          <div className="flex flex-col items-end gap-1">
                            <span className="rounded bg-yellow-500/20 px-2 py-1 text-[10px] uppercase tracking-wider text-yellow-500">{project.category}</span>
                            {isLocalDemoRecord(project) && <span className="rounded bg-blue-500/15 px-2 py-1 text-[10px] uppercase tracking-wider text-blue-300">Demo</span>}
                          </div>
                        </div>
                        <p className="mb-2 flex items-center gap-1 text-sm text-slate-400"><MapPin className="h-3 w-3" /> {project.lat}, {project.long}</p>
                        <p className="line-clamp-2 text-xs text-slate-500">{project.description}</p>
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => openEditProjectModal(project)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-400/30 px-3 py-2 text-sm font-bold text-blue-300 hover:bg-blue-400 hover:text-slate-950">
                            <Pencil className="h-4 w-4" /> Modifier
                          </button>
                          <button onClick={() => deleteRecord('map_projects', project.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-400 hover:text-slate-950">
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'portfolio' && (
              <section>
                <div className="mb-6 flex justify-end">
                  <button onClick={() => setIsPortfolioModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-bold text-slate-950 hover:bg-yellow-400">
                    <Plus className="h-5 w-5" /> Ajouter au showroom
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {portfolioProjects.map((project) => (
                    <article key={project.id} className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                      <div className="relative flex h-52 bg-slate-800">
                        <div className="relative h-full w-1/2 border-r border-white/10">
                          {project.before ? <img src={project.before} alt="Avant" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">Avant</div>}
                          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px]">Avant</span>
                        </div>
                        <div className="relative h-full w-1/2">
                          {project.after ? <img src={project.after} alt="Apres" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">Apres</div>}
                          <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px]">Apres</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEditPortfolioProjectModal(project)} className="rounded-full bg-blue-500/80 p-2 text-white hover:bg-blue-500"><Pencil className="h-5 w-5" /></button>
                          <button onClick={() => deleteRecord('portfolio_projects', project.id)} className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold">{project.label}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                          <span>{project.duration || 'A definir ensemble'}</span>
                          <span className="text-slate-600">/</span>
                          <span>{project.surface || 'A definir ensemble'}</span>
                          {isLocalDemoRecord(project) && <span className="rounded bg-blue-500/15 px-2 py-0.5 uppercase tracking-wider text-blue-300">Demo</span>}
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button onClick={() => openEditPortfolioProjectModal(project)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-400/30 px-3 py-2 text-sm font-bold text-blue-300 hover:bg-blue-400 hover:text-slate-950">
                            <Pencil className="h-4 w-4" /> Modifier
                          </button>
                          <button onClick={() => deleteRecord('portfolio_projects', project.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-bold text-red-300 hover:bg-red-400 hover:text-slate-950">
                            <Trash2 className="h-4 w-4" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-2xl font-display font-bold">{editingProject ? 'Modifier le point carte' : 'Nouveau point carte'}</h3>
              <button onClick={closeProjectModal} className="text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            <form id="map-project-form" onSubmit={saveMapProject} className="space-y-4 overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Titre
                  <input required value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="Ex: Hub logistique" />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Categorie
                  <select value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500">
                    <option value="Logistique">Logistique</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Showroom">Showroom</option>
                  </select>
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Placement sur la carte</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setNewProject({ ...newProject, lat: '-4.769000', long: '11.866000' })}
                      className="text-xs font-bold text-yellow-400 hover:text-yellow-300"
                    >
                      Recentrer Pointe-Noire
                    </button>
                    <span className="text-xs text-slate-500">{newProject.lat && newProject.long ? `${newProject.lat}, ${newProject.long}` : 'Cliquez directement sur la carte'}</span>
                  </div>
                </div>
                <div className="h-80 overflow-hidden rounded-xl border border-white/10">
                  <Map
                    initialViewState={{ longitude: mapPosition.longitude, latitude: mapPosition.latitude, zoom: 12 }}
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                    onClick={(event: any) => setNewProject({
                      ...newProject,
                      lat: event.lngLat.lat.toFixed(6),
                      long: event.lngLat.lng.toFixed(6),
                    })}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <NavigationControl position="bottom-right" />
                    {newProject.lat && newProject.long && (
                      <Marker longitude={Number(newProject.long)} latitude={Number(newProject.lat)} anchor="bottom">
                        <div className="h-5 w-5 rounded-full border-2 border-slate-950 bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.75)]" />
                      </Marker>
                    )}
                    {projects
                      .filter(project => project.lat && project.long && String(project.id) !== String(editingProject?.id))
                      .map(project => (
                        <Marker key={project.id} longitude={Number(project.long)} latitude={Number(project.lat)} anchor="bottom">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setNewProject({
                                ...newProject,
                                lat: Number(project.lat).toFixed(6),
                                long: Number(project.long).toFixed(6),
                              });
                            }}
                            title={project.title}
                            className="h-3.5 w-3.5 rounded-full border border-slate-950 bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.55)] transition-transform hover:scale-150"
                          />
                        </Marker>
                      ))}
                  </Map>
                </div>
                <p className="text-xs text-slate-500">
                  Point en cours en jaune. Les points existants sont affiches en gris et peuvent servir de repere.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-300">Media popup (image ou video)</label>
                <div className="flex gap-3">
                  <input value={newProject.video_url} onChange={(e) => setNewProject({ ...newProject, video_url: e.target.value })} className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="URL image/video" />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm font-bold text-yellow-500 hover:bg-yellow-500 hover:text-slate-950">
                    <Upload className="h-4 w-4" /> {uploadingField === 'map-media' ? 'Upload...' : 'Uploader'}
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={async (event) => {
                      const url = await uploadFile(event.target.files?.[0], 'site-assets', 'map-media');
                      if (url) setNewProject({ ...newProject, video_url: url });
                      event.currentTarget.value = '';
                    }} />
                  </label>
                </div>
              </div>

              <label className="block space-y-2 text-sm text-slate-300">
                Description
                <textarea required rows={3} value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="Description du projet" />
              </label>
            </form>
            <div className="flex justify-end gap-4 border-t border-white/10 p-6">
              <button onClick={closeProjectModal} className="px-6 py-2 text-slate-300 hover:text-white">Annuler</button>
              <button type="submit" form="map-project-form" className="rounded-lg bg-yellow-500 px-6 py-2 font-bold text-slate-950 hover:bg-yellow-400">{editingProject ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}

      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-2xl font-display font-bold">{editingPortfolioProject ? 'Modifier le showroom' : 'Nouveau showroom'}</h3>
              <button onClick={closePortfolioModal} className="text-slate-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            <form id="portfolio-form" onSubmit={savePortfolioProject} className="space-y-4 overflow-y-auto p-6">
              <label className="block space-y-2 text-sm text-slate-300">
                Titre
                <input required value={newPortfolioProject.label} onChange={(e) => setNewPortfolioProject({ ...newPortfolioProject, label: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="A definir ensemble" />
              </label>

              {(['before', 'after'] as const).map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-sm text-slate-300">{field === 'before' ? 'Image avant' : 'Image apres'}</label>
                  <div className="flex gap-3">
                    <input required value={newPortfolioProject[field]} onChange={(e) => setNewPortfolioProject({ ...newPortfolioProject, [field]: e.target.value })} className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="URL image" />
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-yellow-500/30 px-4 py-2 text-sm font-bold text-yellow-500 hover:bg-yellow-500 hover:text-slate-950">
                      <Upload className="h-4 w-4" /> {uploadingField === `portfolio-${field}` ? 'Upload...' : 'Uploader'}
                      <input type="file" accept="image/*" className="hidden" onChange={async (event) => {
                        const url = await uploadFile(event.target.files?.[0], 'site-assets', `portfolio-${field}`);
                        if (url) setNewPortfolioProject({ ...newPortfolioProject, [field]: url });
                        event.currentTarget.value = '';
                      }} />
                    </label>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-300">
                  Duree
                  <input value={newPortfolioProject.duration} onChange={(e) => setNewPortfolioProject({ ...newPortfolioProject, duration: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="A definir ensemble" />
                </label>
                <label className="block space-y-2 text-sm text-slate-300">
                  Surface
                  <input value={newPortfolioProject.surface} onChange={(e) => setNewPortfolioProject({ ...newPortfolioProject, surface: e.target.value })} className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-2 text-white outline-none focus:border-yellow-500" placeholder="A definir ensemble" />
                </label>
              </div>
            </form>
            <div className="flex justify-end gap-4 border-t border-white/10 p-6">
              <button onClick={closePortfolioModal} className="px-6 py-2 text-slate-300 hover:text-white">Annuler</button>
              <button type="submit" form="portfolio-form" className="rounded-lg bg-yellow-500 px-6 py-2 font-bold text-slate-950 hover:bg-yellow-400">{editingPortfolioProject ? 'Enregistrer' : 'Ajouter'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
