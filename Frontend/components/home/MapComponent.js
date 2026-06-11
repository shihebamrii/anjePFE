'use client';

'use client';

// Import React-Leaflet components to render interactive maps
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// Import required Leaflet styles
import 'leaflet/dist/leaflet.css';
// Import Leaflet core library to customize markers and icons
import L from 'leaflet';
import { useEffect } from 'react';

// Fix: resolve default Leaflet marker assets path matching issue in Next.js bundlers
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom blue marker icon configuration for department locations
const DeptIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom gold marker icon configuration for the main university direction office
const IsetGafsaIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Assign the fixed default icon to Leaflet's marker prototype options
L.Marker.prototype.options.icon = DefaultIcon;

// List of coordinates and metadata details representing campus locations
const locations = [
  {
    id: 1,
    name: "ISET Gafsa (Direction)",
    position: [34.4253163, 8.7753177],
    description: "L'Institut Supérieur des Études Technologiques de Gafsa.",
    icon: IsetGafsaIcon
  },
  {
    id: 2,
    name: "Département Technologies de l'Informatique", // IT Dept
    position: [34.429574, 8.761795],
    description: "Formation en développement, réseaux et systèmes.",
    icon: DeptIcon
  },
  {
    id: 3,
    name: "Département Génie Électrique", // Electrical Dept
    position: [34.42896114950402, 8.762583183900409],
    description: "Électronique, automatique et électricité industrielle.",
    icon: DeptIcon
  },
  {
    id: 4,
    name: "Département Génie Mécanique", // Mechanical Dept
    position: [34.429085041604296, 8.762341785111971],
    description: "Conception et maintenance mécanique.",
    icon: DeptIcon
  },
  {
    id: 5,
    name: "Département Génie Civil", // Civil Dept
    position: [34.42899875962529, 8.762894320116619],
    description: "Construction, routes et infrastructures.",
    icon: DeptIcon
  },
  {
    id: 6,
    name: "Département Sciences Éco. et Gestion", // Economics and Management Dept
    position: [34.42952529955062, 8.761598813247167],
    description: "Management, comptabilité et économie.",
    icon: DeptIcon
  }
];

// Interactive map component displaying the university campus layout
export default function MapComponent() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative group">
      {/* MapContainer: sets default coordinates center and initial zoom scale */}
      <MapContainer 
        center={[34.42952972423748, 8.762344467397835]} 
        zoom={17} 
        scrollWheelZoom={false} // Disable scroll wheel zoom so page scroll works normally
        className="w-full h-full"
      >
        {/* Load Google Maps satellite road/terrain tiles */}
        <TileLayer
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          attribution='&copy; Google Maps'
        />

        {/* Map through location records to place markers on the grid */}
        {locations.map((loc) => (
          <Marker key={loc.id} position={loc.position} icon={loc.icon}>
            {/* Popups overlay appearing on clicking marker pins */}
            <Popup className="custom-popup">
              <div className="p-3 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${loc.id === 1 ? 'bg-gold' : 'bg-blue-500'}`} />
                  <h3 className="font-bold text-brand text-[14px] leading-tight">{loc.name}</h3>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed">{loc.description}</p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Gafsa</span>
                  <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase">Itinéraire</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Visual floating badge title overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm pointer-events-none">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Interactif du Campus</p>
      </div>
    </div>
  );
}
