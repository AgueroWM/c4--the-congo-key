import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Menu, X, ArrowRight, Building2, 
  Briefcase, CheckCircle2, ShieldCheck, 
  MapPin, Play, Globe2, ChevronDown, Check,
  Handshake, Gavel, Users, Loader2, User
} from 'lucide-react';

import { Button } from '../../components/ui/Button';
import { WhatsAppButton } from '../../components/ui/WhatsAppButton';
import { BeforeAfterSlider } from '../../components/BeforeAfterSlider';
import { DestinationOverlay } from '../../components/DestinationOverlay';
import { Preloader } from '../../components/ui/Preloader';
import { CountUp } from '../../components/ui/CountUp';
import { Marquee } from '../../components/ui/Marquee';
import { LogoC4, LogoCMA, LogoCEVA, LogoSIEM } from '../../components/ui/Logos';
import { SectionId } from '../../types';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import heroVideo from '../../images/mixkit-buildings-under-construction-aerial-view-4010-full-hd.mp4';
import destinationResortImage from '../../images/gettyimages-2148813707-612x612.jpg';
import destinationBusinessImage from '../../images/gettyimages-2238045863-612x612.jpg';

const InteractiveMap = lazy(() =>
  import('../../components/InteractiveMap').then((module) => ({ default: module.InteractiveMap }))
);

const MapLoader = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <Suspense fallback={<div className="h-[600px] border border-white/10 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-500">Chargement de la carte...</div>}>
          <InteractiveMap />
        </Suspense>
      ) : (
        <div className="h-[600px] border border-white/10 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-500">
          Carte interactive prête au chargement
        </div>
      )}
    </div>
  );
};

// --- TRANSLATIONS / TRADUCTIONS ---
const content = {
  FR: {
    nav: {
      expertise: "Expertise",
      projects: "Projets",
      destination: "Destination",
      invest: "Investir"
    },
    hero: {
      title1: "BÂTIR",
      title2: "L'AMBITION",
      subtitle: "SÉCURISER L'AVENIR",
      desc: "100% Congolais. 100% Conforme. Votre partenaire BTP et Logistique aux standards internationaux.",
      cta_start: "Démarrer Votre Projet",
      cta_showroom: "Voir le Showroom"
    },
    partners: {
      title_mini: "La Force d'un Réseau Mondial",
      main_title_1: "L'Excellence",
      main_title_2: "Locale & Éthique.",
      desc: "C4 incarne la nouvelle ère de l'entreprenariat congolais. En tant que société 100% locale, nous alignons expertise terrain et rigueur internationale.",
      card1_title: "Éthique & Transparence",
      card1_desc: "Une culture d'entreprise axée sur l'intégrité et la transparence dans la gestion de nos projets.",
      card2_title: "100% Contenu Local",
      card2_desc: "Société de droit congolais. Valorisation des talents locaux et transfert de compétences.",
      card3_title: "Rigueur Juridique",
      card3_desc: "Engagement vers le respect des normes juridiques et environnementales applicables.",
      stat_capital: "Capital Congolais",
      stat_compliance: "Compliance Validée",
      stat_partner: "Partenaire Stratégique",
      stat_partner_sub: "Pour les multinationales"
    },
    expertise: {
      title: "L'Expertise",
      subtitle: "Le système d'exploitation pour votre implantation au Congo.",
      step1_title: "1. Facilitation & Admin",
      step1_desc: "Atterrissage en douceur. Nous gérons l'État, les permis, la conformité douanière et foncière. Vous arrivez, tout est prêt.",
      step1_list1: "Permis de construire accélérés",
      step1_list2: "Conformité légale & Fiscale",
      step2_title: "2. Ingénierie & Design",
      step2_desc: "Architecture tropicale moderne. Nous concevons des structures qui résistent au climat tout en imposant un standard international.",
      step2_list1: "Plans BIM / 3D",
      step2_list2: "Études de sol approfondies",
      step3_title: "3. Construction",
      step3_desc: "Exécution rigoureuse. Bâtiments industriels, infrastructures complexes, sièges sociaux. Livré clé en main.",
      step3_list1: "Gros œuvre & Génie Civil",
      step3_list2: "Finitions Premium & Luxe"
    },
    portfolio: {
      title: "Showroom",
      subtitle: "Réel",
      desc: "De la vision à la réalité. Glissez pour comparer.",
      duration: "Durée",
      surface: "Surface",
      btn_details: "Voir les détails"
    },
    destination: {
      tag: "Pointe-Noire, Congo",
      title_1: "Le Futur Hub",
      title_2: "de l'Afrique Centrale.",
      desc: "Ce n'est pas juste une ville portuaire. C'est un terrain de jeu pour les visionnaires. Plages de sable fin, opportunités pétrolières, stabilité et croissance.",
      cta: "Découvrir la Destination",
      stat_temp: "Température Moyenne",
      stat_gdp: "Croissance PIB"
    },
    contact: {
      title: "Prêt à Bâtir votre",
      title_highlight: "Projet",
      title_end: "?",
      desc: "Discutons de votre projet. Nos ingénieurs et consultants sont prêts à transformer vos capitaux en infrastructures tangibles.",
      success_title: "Message Reçu",
      success_desc: "Votre vision est entre de bonnes mains. Notre équipe de direction vous recontactera sous 24h.",
      err_msg: "Une erreur est survenue. Veuillez réessayer.",
      label_name: "Nom Complet",
      label_company: "Société",
      label_subject: "Sujet de votre demande",
      label_message: "Décrivez votre vision...",
      opt_partner: "Partenariat Stratégique",
      opt_invest: "Opportunité d'Investissement",
      opt_project: "Projet de Construction",
      opt_logistics: "Besoin Logistique",
      opt_press: "Presse & Médias",
      btn_sending: "Enregistrement en cours",
      btn_send: "Envoyer la Demande"
    },
    footer: {
      rights: "Tous droits réservés.",
      legal: "Mentions Légales",
      privacy: "Confidentialité"
    }
  },
  EN: {
    nav: {
      expertise: "Expertise",
      projects: "Projects",
      destination: "Destination",
      invest: "Invest"
    },
    hero: {
      title1: "BUILDING",
      title2: "AMBITION",
      subtitle: "SECURING THE FUTURE",
      desc: "100% Congolese. 100% Compliant. Your Construction & Logistics partner with international standards.",
      cta_start: "Start Your Project",
      cta_showroom: "View Showroom"
    },
    partners: {
      title_mini: "The Power of a Global Network",
      main_title_1: "Excellence",
      main_title_2: "Local & Ethical.",
      desc: "C4 embodies the new era of Congolese entrepreneurship. As a 100% local company, we align field expertise with international rigor.",
      card1_title: "Ethics & Transparency",
      card1_desc: "A corporate culture focused on integrity and transparency in project management.",
      card2_title: "100% Local Content",
      card2_desc: "Congolese law company. Valorization of local talents and skills transfer.",
      card3_title: "Legal Rigor",
      card3_desc: "Commitment to compliance with applicable legal and environmental standards.",
      stat_capital: "Congolese Capital",
      stat_compliance: "Compliance Validated",
      stat_partner: "Strategic Partner",
      stat_partner_sub: "For multinationals"
    },
    expertise: {
      title: "Expertise",
      subtitle: "The operating system for your setup in Congo.",
      step1_title: "1. Facilitation & Admin",
      step1_desc: "Soft landing. We handle the State, permits, customs, and land compliance. You arrive, everything is ready.",
      step1_list1: "Accelerated building permits",
      step1_list2: "Legal & Fiscal Compliance",
      step2_title: "2. Engineering & Design",
      step2_desc: "Modern tropical architecture. We design structures that withstand the climate while imposing an international standard.",
      step2_list1: "BIM / 3D Plans",
      step2_list2: "Deep soil studies",
      step3_title: "3. Construction",
      step3_desc: "Rigorous execution. Industrial buildings, complex infrastructures, headquarters. Delivered turnkey.",
      step3_list1: "Structural & Civil Engineering",
      step3_list2: "Premium finishes"
    },
    portfolio: {
      title: "Showroom",
      subtitle: "Real",
      desc: "From vision to reality. Swipe to compare.",
      duration: "Duration",
      surface: "Area",
      btn_details: "View Details"
    },
    destination: {
      tag: "Pointe-Noire, Congo",
      title_1: "The Future Hub",
      title_2: "of Central Africa.",
      desc: "It's not just a port city. It's a playground for visionaries. Sandy beaches, oil opportunities, stability, and growth.",
      cta: "Discover the Destination",
      stat_temp: "Avg Temperature",
      stat_gdp: "GDP Growth"
    },
    contact: {
      title: "Ready to Build your",
      title_highlight: "Project",
      title_end: "?",
      desc: "Let's discuss your project. Our engineers and consultants are ready to turn your capital into tangible infrastructure.",
      success_title: "Message Received",
      success_desc: "Your vision is in good hands. Our leadership team will contact you within 24h.",
      err_msg: "An error occurred. Please try again.",
      label_name: "Full Name",
      label_company: "Company",
      label_subject: "Subject",
      label_message: "Describe your vision...",
      opt_partner: "Strategic Partnership",
      opt_invest: "Investment Opportunity",
      opt_project: "Construction Project",
      opt_logistics: "Logistics Need",
      opt_press: "Press & Media",
      btn_sending: "Saving in progress",
      btn_send: "Send Request"
    },
    footer: {
      rights: "All rights reserved.",
      legal: "Legal Notice",
      privacy: "Privacy Policy"
    }
  }
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  
  // Raccourci pour accéder aux textes
  const t = content[lang];
  
  // Form State
  const [formState, setFormState] = useState({ name: '', email: '', company: '', subject: 'partenariat', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const heroTextY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const [projects, setProjects] = useState<any[]>([
    {
      id: 1,
      label: "A definir ensemble",
      before: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1600&auto=format&fit=crop", 
      after: "https://images.unsplash.com/photo-1586528116311-ad8ed7c508b0?q=80&w=1600&auto=format&fit=crop",
      duration: "A definir ensemble",
      surface: "A definir ensemble"
    },
    {
      id: 2,
      label: "A definir ensemble",
      before: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop", 
      after: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1600&auto=format&fit=crop",
      duration: "A definir ensemble",
      surface: "A definir ensemble"
    }
  ]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('portfolio_projects')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (!error && data && data.length > 0) {
          setProjects(data);
        }
      } catch (err) {
        console.error("Error fetching portfolio projects:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const partners = [
    { name: "CMA CGM", component: LogoCMA, className: "max-h-14 max-w-52" }, 
    { name: "CEVA Logistics", component: LogoCEVA, className: "max-h-12 max-w-52" },
    { name: "SIEM Joint", component: LogoSIEM, className: "max-h-14 max-w-52" },
  ];

  const scrollTo = (id: SectionId) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    if (isSupabaseConfigured) {
        try {
            const { error } = await supabase
                .from('contacts')
                .insert([{ 
                    name: formState.name, 
                    email: formState.email,
                    company: formState.company, 
                    subject: formState.subject, 
                    message: formState.message 
                }]);
            if (error) throw error;
            setFormStatus('success');
            resetForm();
        } catch (error) {
            console.error('Erreur Supabase:', error);
            setFormStatus('error');
            setTimeout(() => setFormStatus('idle'), 3000);
        }
    } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const resetForm = () => {
    setTimeout(() => {
        setFormStatus('idle');
        setFormState({ name: '', email: '', company: '', subject: 'partenariat', message: '' });
    }, 5000);
  }

  // Fonction utilitaire pour gérer les labels flottants
  const getLabelClass = (hasValue: boolean) => {
      return `absolute left-0 transition-all duration-200 pointer-events-none ${
          hasValue 
          ? "-top-5 text-xs text-yellow-500" // Remonté plus haut
          : "top-2 text-slate-500 text-sm"
      }`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-yellow-500 selection:text-slate-900">
      
      {/* Preloader */}
      <Preloader onComplete={() => setLoading(false)} />

      {!loading && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
          {/* Global Widgets */}
          <WhatsAppButton />
          <DestinationOverlay isOpen={isDestinationOpen} onClose={() => setIsDestinationOpen(false)} />

          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <motion.div 
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md border-b border-white/5"
              style={{ opacity: headerOpacity }}
            />
            <div className="container mx-auto px-6 h-24 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
                {/* LOGO HEADER */}
                <div className="h-16 w-20 flex items-center justify-center overflow-visible">
                   <LogoC4 className="h-full w-auto drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="font-display font-bold text-xl tracking-wider text-white leading-none">CONGO<span className="text-yellow-500">KEY</span></span>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">Facilitateur d'implantation</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8">
                {[
                  { label: t.nav.expertise, id: SectionId.PROCESS },
                  { label: t.nav.projects, id: SectionId.PORTFOLIO },
                  { label: t.nav.destination, id: SectionId.DESTINATION },
                ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => scrollTo(item.id)}
                    className="text-xs uppercase tracking-[0.2em] font-bold text-slate-300 hover:text-yellow-500 transition-colors relative group"
                  >
                    {item.label}
                    <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-yellow-500 transition-all duration-300 group-hover:w-full box-shadow-[0_0_10px_#eab308]"></span>
                  </button>
                ))}
                
                {/* Language Switcher */}
                <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest cursor-pointer">
                    <span onClick={() => setLang('FR')} className={lang === 'FR' ? 'text-white' : 'text-slate-600 hover:text-white transition-colors'}>FR</span>
                    <span className="text-slate-700">/</span>
                    <span onClick={() => setLang('EN')} className={lang === 'EN' ? 'text-white' : 'text-slate-600 hover:text-white transition-colors'}>EN</span>
                </div>

                <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
                <a 
                  href="/portal" 
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold text-yellow-500 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Espace Client
                </a>

                <Button variant="outline" onClick={() => scrollTo(SectionId.CONTACT)}>{t.nav.invest}</Button>
              </div>

              <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 z-40 bg-slate-950 pt-24 px-6 md:hidden flex flex-col items-center"
              >
                 <div className="flex flex-col gap-8 text-center w-full">
                    {[
                      { label: t.nav.expertise, id: SectionId.PROCESS },
                      { label: t.nav.projects, id: SectionId.PORTFOLIO },
                      { label: t.nav.destination, id: SectionId.DESTINATION },
                      { label: t.nav.invest, id: SectionId.CONTACT },
                    ].map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => scrollTo(item.id)}
                        className="text-3xl font-display text-white hover:text-yellow-500 border-b border-white/5 pb-4 w-full"
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="flex justify-center gap-4 mt-4">
                        <span onClick={() => setLang('FR')} className={`text-xl ${lang === 'FR' ? 'text-yellow-500' : 'text-slate-500'}`}>FR</span>
                        <span onClick={() => setLang('EN')} className={`text-xl ${lang === 'EN' ? 'text-yellow-500' : 'text-slate-500'}`}>EN</span>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HERO SECTION */}
          <section id={SectionId.HERO} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-0">
              <motion.video 
                src={heroVideo}
                className="w-full h-full object-cover origin-center"
                autoPlay
                loop
                muted
                playsInline
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
              />
              <div className="absolute inset-0 bg-slate-950/70" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
              <motion.div 
                className="absolute inset-0 bg-grid opacity-20"
                animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              />
            </div>

            <motion.div 
              className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center justify-center h-full pt-20"
              style={{ y: heroTextY, opacity: heroOpacity }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

              <h1 className="flex flex-col items-center leading-none mb-10 md:mb-12 w-full">
                <motion.span 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-display font-extrabold text-white drop-shadow-2xl break-words text-center max-w-full"
                >
                  {t.hero.title1}
                </motion.span>
                
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-display font-extrabold gold-gradient z-10 relative py-2 break-words text-center max-w-full"
                >
                  {t.hero.title2}
                </motion.span>

                <motion.span 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-bold text-outline mt-2 break-words text-center max-w-full"
                >
                  {t.hero.subtitle}
                </motion.span>
              </h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-light leading-relaxed tracking-wide md:text-center"
              >
                {t.hero.desc}
              </motion.p>

              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1 }}
                 className="flex flex-col md:flex-row items-center justify-center gap-6 w-full md:w-auto"
              >
                <Button variant="primary" onClick={() => scrollTo(SectionId.PROCESS)} className="w-full md:w-auto shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                  {t.hero.cta_start}
                </Button>
                <Button variant="glass" icon={Play} onClick={() => scrollTo(SectionId.PORTFOLIO)} className="w-full md:w-auto">
                  {t.hero.cta_showroom}
                </Button>
              </motion.div>
            </motion.div>
          </section>

          {/* AUTHORITY & PARTNERS SECTION */}
          <section id={SectionId.AUTHORITY} className="py-24 bg-slate-900 border-b border-white/5 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
              
              <div className="mb-24 text-center">
                 <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-8">{t.partners.title_mini}</p>
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-10 rounded-lg border border-white/10 bg-white/[0.03] px-8 py-8 shadow-2xl md:gap-16"
                 >
                    {partners.map((partner, i) => {
                       const PartnerComponent = partner.component;
                       return (
                           <motion.div 
                              key={i} 
                              className="group relative flex min-h-20 min-w-44 items-center justify-center"
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              transition={{ delay: i * 0.2 }}
                              viewport={{ once: true }}
                           >
                              <PartnerComponent className={`${partner.className} object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.28)] transition-transform duration-300 group-hover:scale-[1.03]`} />
                           </motion.div>
                       );
                    })}
                 </motion.div>
              </div>

              <div className="flex flex-col md:flex-row items-start justify-between gap-16">
                <div className="md:w-1/2">
                  <h2 className="text-3xl md:text-5xl font-display mb-8 leading-tight">
                    {t.partners.main_title_1} <br/><span className="gold-gradient">{t.partners.main_title_2}</span>
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8 border-l border-white/10 pl-6">
                    {t.partners.desc}
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                       <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-green-500/20">
                          <ShieldCheck className="w-6 h-6 text-green-500" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg mb-1">{t.partners.card1_title}</h4>
                          <p className="text-sm text-slate-500">{t.partners.card1_desc}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-blue-500/20">
                          <Users className="w-6 h-6 text-blue-500" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg mb-1">{t.partners.card2_title}</h4>
                          <p className="text-sm text-slate-500">{t.partners.card2_desc}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                       <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-yellow-500/20">
                          <Gavel className="w-6 h-6 text-yellow-500" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg mb-1">{t.partners.card3_title}</h4>
                          <p className="text-sm text-slate-500">{t.partners.card3_desc}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="md:w-1/2 w-full">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="glass-panel p-8 rounded-lg flex flex-col justify-center items-center text-center border-t-4 border-yellow-500 shadow-2xl hover:scale-105 transition-transform duration-500">
                          <CountUp to={100} suffix="%" className="text-5xl font-display text-white block mb-2" />
                          <span className="text-xs uppercase tracking-widest text-slate-400">{t.partners.stat_capital}</span>
                      </div>
                      <div className="glass-panel p-8 rounded-lg flex flex-col justify-center items-center text-center border-t-4 border-blue-500 shadow-2xl hover:scale-105 transition-transform duration-500 delay-100">
                          <CheckCircle2 className="w-12 h-12 text-blue-500 mb-4" />
                          <span className="text-xs uppercase tracking-widest text-slate-400">{t.partners.stat_compliance}</span>
                      </div>
                      <div className="col-span-2 glass-panel p-8 rounded-lg flex items-center justify-between border-l-4 border-green-500 shadow-2xl hover:bg-white/5 transition-colors">
                          <div className="text-left">
                             <span className="block text-2xl font-display text-white">{t.partners.stat_partner}</span>
                             <span className="text-sm text-slate-400">{t.partners.stat_partner_sub}</span>
                          </div>
                          <Handshake className="w-12 h-12 text-green-500" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROCESS SECTION */}
          <section id={SectionId.PROCESS} className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="container mx-auto px-6">
              <div className="text-center mb-20">
                <h2 className="text-4xl md:text-5xl font-display mb-4">{t.expertise.title} <span className="text-outline text-white/20">360°</span></h2>
                <p className="text-slate-400 max-w-xl mx-auto">{t.expertise.subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <motion.div whileHover={{ y: -10 }} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative glass-panel p-8 h-full border-t border-white/10 group-hover:border-yellow-500/50 transition-colors duration-500">
                    <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-none flex items-center justify-center mb-8 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-900 transition-all duration-500 shadow-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display mb-4 text-white group-hover:text-yellow-500 transition-colors">{t.expertise.step1_title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">{t.expertise.step1_desc}</p>
                    <ul className="text-sm text-slate-500 space-y-3">
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> {t.expertise.step1_list1}</li>
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-yellow-500 rounded-full"></div> {t.expertise.step1_list2}</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Step 2 */}
                <motion.div whileHover={{ y: -10 }} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative glass-panel p-8 h-full border-t border-white/10 group-hover:border-blue-500/50 transition-colors duration-500">
                    <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-none flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-lg">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display mb-4 text-white group-hover:text-blue-400 transition-colors">{t.expertise.step2_title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">{t.expertise.step2_desc}</p>
                    <ul className="text-sm text-slate-500 space-y-3">
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-blue-400 rounded-full"></div> {t.expertise.step2_list1}</li>
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-blue-400 rounded-full"></div> {t.expertise.step2_list2}</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Step 3 */}
                <motion.div whileHover={{ y: -10 }} className="group relative">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative glass-panel p-8 h-full border-t border-white/10 group-hover:border-white/50 transition-colors duration-500">
                    <div className="w-16 h-16 bg-slate-900 border border-white/10 rounded-none flex items-center justify-center mb-8 text-white group-hover:bg-white group-hover:text-slate-900 transition-all duration-500 shadow-lg">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-display mb-4 text-white group-hover:text-yellow-100 transition-colors">{t.expertise.step3_title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">{t.expertise.step3_desc}</p>
                    <ul className="text-sm text-slate-500 space-y-3">
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-white rounded-full"></div> {t.expertise.step3_list1}</li>
                      <li className="flex items-center gap-3"><div className="w-1 h-1 bg-white rounded-full"></div> {t.expertise.step3_list2}</li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          <Marquee />

          {/* PORTFOLIO SECTION */}
          <section id={SectionId.PORTFOLIO} className="py-24 bg-slate-900 overflow-hidden">
            <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-display mb-2">{t.portfolio.title} <span className="gold-gradient">{t.portfolio.subtitle}</span></h2>
                <p className="text-slate-400">{t.portfolio.desc}</p>
              </div>
              <div className="hidden md:block">
                <div className="flex gap-2">
                    <div className="w-12 h-1 bg-yellow-500"></div>
                    <div className="w-4 h-1 bg-slate-700"></div>
                    <div className="w-4 h-1 bg-slate-700"></div>
                </div>
              </div>
            </div>

            <div className="w-full max-w-[1920px] mx-auto px-0 md:px-6 grid grid-cols-1 xl:grid-cols-2 gap-12">
              {projects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="w-full"
                >
                  <BeforeAfterSlider 
                    beforeImage={project.before}
                    afterImage={project.after}
                    label={project.label}
                  />
                  <div className="flex justify-between items-center mt-6 px-6 md:px-0">
                     <div className="flex gap-8 text-sm">
                        <div>
                            <span className="block text-slate-500 uppercase text-xs tracking-wider mb-1">{t.portfolio.duration}</span>
                            <span className="text-white font-mono">{project.duration || 'A definir ensemble'}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 uppercase text-xs tracking-wider mb-1">{t.portfolio.surface}</span>
                            <span className="text-white font-mono">{project.surface || 'A definir ensemble'}</span>
                        </div>
                     </div>
                     <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-yellow-300">
                      Dossier sur demande
                     </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="container mx-auto px-6 mt-32">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-display mb-4">Empreinte <span className="gold-gradient">Nationale</span></h3>
                <p className="text-slate-400 max-w-2xl mx-auto">Une lecture claire de nos zones d'intervention et de nos références. Survolez les points pour découvrir les réalisations.</p>
              </div>
              <MapLoader />
            </div>
          </section>

          {/* DESTINATION SECTION */}
          <section id={SectionId.DESTINATION} className="py-32 relative bg-slate-950 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-40">
                <img src="https://images.unsplash.com/photo-1517457210348-703079e57d4b?q=80&w=2669&auto=format&fit=crop" className="w-full h-full object-cover" alt="Lifestyle" />
                <div className="absolute inset-0 bg-slate-950/80"></div>
            </div>
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row gap-16 items-center">
                 <div className="md:w-1/2">
                    <div className="flex items-center gap-2 text-yellow-500 mb-6">
                       <MapPin className="w-5 h-5 animate-bounce" />
                       <span className="tracking-widest uppercase text-sm font-bold">{t.destination.tag}</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-display mb-8 text-white leading-tight">
                      {t.destination.title_1} <br/> <span className="text-outline text-white">{t.destination.title_2}</span>
                    </h2>
                    <p className="text-xl text-slate-300 mb-8 font-light">
                      {t.destination.desc}
                    </p>
                    <Button 
                      variant="primary" 
                      icon={Globe2} 
                      onClick={() => setIsDestinationOpen(true)}
                    >
                      {t.destination.cta}
                    </Button>
                 </div>
                 <div className="md:w-1/2">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-4 mt-8">
                          <div className="overflow-hidden rounded-lg shadow-2xl">
                              <img src={destinationResortImage} className="hover:scale-110 transition-transform duration-700 object-cover w-full h-48" alt="Pointe-Noire resort" />
                          </div>
                          <div className="glass-panel p-6 rounded-lg text-center border-l-4 border-yellow-500">
                              <span className="block text-3xl font-display text-yellow-500">27°C</span>
                              <span className="text-xs uppercase text-slate-400">{t.destination.stat_temp}</span>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="glass-panel p-6 rounded-lg text-center border-l-4 border-white">
                              <span className="block text-3xl font-display text-white">+5.8%</span>
                              <span className="text-xs uppercase text-slate-400">{t.destination.stat_gdp}</span>
                          </div>
                          <div className="overflow-hidden rounded-lg shadow-2xl">
                             <img src={destinationBusinessImage} className="hover:scale-110 transition-transform duration-700 object-cover w-full h-48" alt="Pointe-Noire business district" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          {/* CTA / CONTACT */}
          <section id={SectionId.CONTACT} className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-display mb-6">{t.contact.title} <span className="gold-gradient">{t.contact.title_highlight}</span> {t.contact.title_end}</h2>
              <p className="text-slate-400 text-lg mb-12">
                {t.contact.desc}
              </p>
              
              <AnimatePresence mode="wait">
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-panel p-12 rounded-none border border-green-500/30 max-w-2xl mx-auto shadow-[0_0_50px_rgba(34,197,94,0.1)]"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
                    >
                      <Check className="w-12 h-12 text-slate-900" />
                    </motion.div>
                    <h3 className="text-3xl font-display text-white mb-4">{t.contact.success_title}</h3>
                    <p className="text-slate-300 text-lg">{t.contact.success_desc}</p>
                  </motion.div>
                ) : (
                   <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleFormSubmit}
                    className="glass-panel p-8 md:p-12 rounded-none text-left max-w-2xl mx-auto border border-yellow-500/10 shadow-2xl bg-slate-950/50"
                  >
                    {formStatus === 'error' && (
                       <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 text-sm rounded text-center">
                          {t.contact.err_msg}
                       </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Ajout de pt-4 pour l'espacement initial et ajustement du label */}
                      <div className="relative group pt-4 mt-2">
                        <input 
                            type="text" 
                            required
                            value={formState.name}
                            onChange={(e) => setFormState({...formState, name: e.target.value})}
                            className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors" 
                        />
                        <label className={getLabelClass(!!formState.name)}>
                            {t.contact.label_name}
                        </label>
                      </div>
                      <div className="relative group pt-4 mt-2">
                        <input 
                            type="email" 
                            required
                            value={formState.email}
                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                            className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors" 
                        />
                        <label className={getLabelClass(!!formState.email)}>
                            Email
                        </label>
                      </div>
                      <div className="relative group pt-4 mt-2">
                        <input 
                            type="text" 
                            required
                            value={formState.company}
                            onChange={(e) => setFormState({...formState, company: e.target.value})}
                            className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors" 
                        />
                        <label className={getLabelClass(!!formState.company)}>
                            {t.contact.label_company}
                        </label>
                      </div>
                    </div>

                    <div className="mb-8 relative group">
                        <label className="block text-slate-500 text-xs uppercase tracking-widest mb-2">{t.contact.label_subject}</label>
                        <div className="relative">
                            <select 
                                value={formState.subject}
                                onChange={(e) => setFormState({...formState, subject: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700 py-3 px-4 text-white appearance-none focus:border-yellow-500 focus:outline-none transition-colors cursor-pointer"
                            >
                                <option value="partenariat">{t.contact.opt_partner}</option>
                                <option value="investissement">{t.contact.opt_invest}</option>
                                <option value="projet">{t.contact.opt_project}</option>
                                <option value="logistique">{t.contact.opt_logistics}</option>
                                <option value="presse">{t.contact.opt_press}</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* MODIFICATION ICI : Style "Boite" pour le message et label fixe au-dessus */}
                    <div className="mb-12 relative group">
                       <label className={`block text-xs uppercase tracking-widest mb-2 transition-colors duration-300 ${formState.message ? 'text-yellow-500' : 'text-slate-500'}`}>
                        {t.contact.label_message}
                      </label>
                      <textarea 
                        required
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full bg-slate-900/30 border-b border-slate-700 rounded-sm p-4 text-white min-h-[80px] h-24 focus:border-yellow-500 focus:outline-none transition-all resize-y" 
                      ></textarea>
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="w-full"
                      disabled={formStatus === 'submitting'}
                    >
                      {formStatus === 'submitting' ? (
                        <>{t.contact.btn_sending} <Loader2 className="w-4 h-4 animate-spin" /></>
                      ) : (
                        <>{t.contact.btn_send} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="bg-slate-950 py-12 border-t border-white/5 text-slate-500 text-sm relative z-10">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-3 mb-6 md:mb-0">
                 <div className="h-8 w-auto">
                    {/* Footer Logo Utilise le composant LogoC4 */}
                    <LogoC4 className="h-full w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
                 </div>
                 <span>&copy; {new Date().getFullYear()} C4 Congo. {t.footer.rights}</span>
              </div>
              <div className="flex gap-8">
                <Link to="/mentions-legales" className="hover:text-yellow-500 transition-colors uppercase tracking-wider text-xs font-bold">{t.footer.legal}</Link>
                <Link to="/confidentialite" className="hover:text-yellow-500 transition-colors uppercase tracking-wider text-xs font-bold">{t.footer.privacy}</Link>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </div>
  );
}
