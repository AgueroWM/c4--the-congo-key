import React from 'react';
import { Link } from 'react-router-dom';

interface LegalProps {
  type: 'legal' | 'privacy';
}

export default function Legal({ type }: LegalProps) {
  const isPrivacy = type === 'privacy';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-sm uppercase tracking-widest text-yellow-500 hover:text-white transition-colors">
          Retour au site
        </Link>
        <h1 className="font-display text-4xl md:text-5xl text-white mt-8 mb-6">
          {isPrivacy ? 'Politique de confidentialité' : 'Mentions légales'}
        </h1>

        {isPrivacy ? (
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>
              Les informations transmises via les formulaires Congo Key sont utilisées uniquement pour répondre aux demandes commerciales,
              aux candidatures et au suivi client.
            </p>
            <p>
              Les données peuvent être hébergées par Supabase lorsque l'intégration est activée. Elles ne sont pas revendues à des tiers.
              Pour toute demande de rectification ou suppression, contactez l'équipe Congo Key par le canal de contact principal.
            </p>
            <p>
              Les cookies strictement nécessaires au fonctionnement du site peuvent être utilisés. Les services externes d'images, de cartes
              et de polices peuvent traiter des données techniques conformément à leurs propres politiques.
            </p>
          </div>
        ) : (
          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>
              Ce site présente les services de Congo Key dans la construction, la facilitation administrative, la conformité et la logistique
              au Congo. Les visuels de projets sont des visuels de présentation en attente des photographies définitives.
            </p>
            <p>
              Les informations commerciales, indicateurs et exemples de projets sont fournis à titre de présentation et doivent être confirmés
              dans le cadre d'un échange contractuel.
            </p>
            <p>
              Éditeur du site : Congo Key. Responsable de publication : direction Congo Key. Les demandes juridiques et commerciales
              peuvent être adressées via le formulaire de contact du site.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
