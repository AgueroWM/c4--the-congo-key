import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/maplibre';
import { motion, AnimatePresence } from 'framer-motion';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Filter } from 'lucide-react';

interface ProjectLocation {
  id: string;
  title: string;
  category: string;
  lat: number;
  long: number;
  video_url: string;
  description: string;
}

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif|avif|svg)(\?|#|$)/i.test(url);

export const InteractiveMap = () => {
  const [projects, setProjects] = useState<ProjectLocation[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [hoverInfo, setHoverInfo] = useState<ProjectLocation | null>(null);

  // Mock data for fallback if Supabase is not configured or empty
  const mockProjects: ProjectLocation[] = [
    {
      id: '1',
      title: 'Entrepôt Industriel',
      category: 'Commercial',
      lat: -4.769,
      long: 11.866,
      video_url: 'https://cdn.coverr.co/videos/coverr-construction-site-of-a-building-2615/1080p.mp4',
      description: 'Plateforme logistique moderne.'
    },
    {
      id: '2',
      title: 'Immeuble tertiaire',
      category: 'Commercial',
      lat: -4.785,
      long: 11.875,
      video_url: 'https://cdn.coverr.co/videos/coverr-modern-house-with-a-pool-2618/1080p.mp4',
      description: 'Programme de bureaux et services premium.'
    },
    {
      id: '3',
      title: 'Hub Logistique CMA CGM',
      category: 'Logistique',
      lat: -4.750,
      long: 11.880,
      video_url: 'https://cdn.coverr.co/videos/coverr-cargo-ship-at-port-2619/1080p.mp4',
      description: 'Entrepôt logistique de dernière génération.'
    }
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isSupabaseConfigured) {
        setProjects(mockProjects);
        return;
      }

      try {
        const { data, error } = await supabase.from('map_projects').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(mockProjects);
        }
      } catch (err) {
        console.error('Error fetching map projects:', err);
        setProjects(mockProjects);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (filter === 'all') return projects;
    return projects.filter(p => p.category === filter);
  }, [projects, filter]);

  const categories = ['all', ...Array.from(new Set(projects.map(p => p.category)))];

  const pointeNoireBounds = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [11.75, -4.88],
              [11.95, -4.88],
              [11.95, -4.70],
              [11.75, -4.70],
              [11.75, -4.88]
            ]
          ]
        }
      }
    ]
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      <Map
        initialViewState={{
          longitude: 11.866,
          latitude: -4.769,
          zoom: 12,
          pitch: 45,
          bearing: -17.6
        }}
        scrollZoom={false}
        maxBounds={[
          [11.6, -5.0], // Southwest
          [12.1, -4.5]  // Northeast
        ]}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      >
        <Source id="pointe-noire-boundary" type="geojson" data={pointeNoireBounds as any}>
          <Layer
            id="boundary-fill"
            type="fill"
            paint={{
              'fill-color': '#eab308',
              'fill-opacity': 0.05
            }}
          />
          <Layer
            id="boundary-line"
            type="line"
            paint={{
              'line-color': '#eab308',
              'line-width': 2,
              'line-dasharray': [2, 4],
              'line-opacity': 0.8
            }}
          />
        </Source>

        <NavigationControl position="bottom-right" />

        {filteredProjects.map((project) => (
          <Marker
            key={project.id}
            longitude={project.long}
            latitude={project.lat}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setHoverInfo(project);
            }}
          >
            <div 
              className="relative cursor-pointer group"
              onMouseEnter={() => setHoverInfo(project)}
              onMouseLeave={() => setHoverInfo(null)}
            >
              <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] border-2 border-slate-900 group-hover:scale-150 transition-transform duration-300"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-500/30 rounded-full animate-ping pointer-events-none"></div>
            </div>
          </Marker>
        ))}

        <AnimatePresence>
          {hoverInfo && (
            <Popup
              longitude={hoverInfo.long}
              latitude={hoverInfo.lat}
              anchor="bottom"
              offset={20}
              closeButton={false}
              closeOnClick={false}
              className="z-50"
              maxWidth="300px"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
              >
                <div className="relative h-32 w-full bg-slate-800">
                  {hoverInfo.video_url ? (
                    isImageUrl(hoverInfo.video_url) ? (
                      <img src={hoverInfo.video_url} alt={hoverInfo.title} className="w-full h-full object-cover" />
                    ) : (
                      <video 
                        src={hoverInfo.video_url} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="h-full w-full bg-slate-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute bottom-2 left-3">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-[10px] uppercase tracking-widest rounded backdrop-blur-sm border border-yellow-500/30">
                      {hoverInfo.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-display font-bold text-lg mb-1">{hoverInfo.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{hoverInfo.description}</p>
                </div>
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* Filters Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/10 p-2 rounded-lg flex flex-col gap-2 shadow-xl">
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">
            <Filter className="w-3 h-3" /> Filtres
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-left px-4 py-2 rounded-md text-sm transition-colors ${
                filter === cat 
                  ? 'bg-yellow-500 text-slate-900 font-bold' 
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat === 'all' ? 'Tous les projets' : cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
