import React from 'react';

const HolographicGlobe = ({ nodes = [] }) => {
  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* 🔮 Outer Energy Ring 🔮 */}
      <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping duration-[4s]" />
      <div className="absolute inset-4 rounded-full border-2 border-dashed border-indigo-500/10 animate-spin-slow" />
      
      {/* 🌍 The Holographic Sphere 🌍 */}
      <div className="relative w-80 h-80 rounded-full bg-indigo-950/20 backdrop-blur-3xl border border-indigo-500/30 shadow-[0_0_100px_rgba(99,102,241,0.1)] overflow-hidden">
        {/* Scanning Light Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent animate-scan" />
        
        {/* SVG Grid Overlay */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <radialGradient id="sphereGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="50%" r="48" fill="url(#sphereGradient)" />
          
          {/* Latitudes */}
          {[10, 25, 40, 55, 70, 85].map(y => (
            <ellipse key={`lat-${y}`} cx="50%" cy={y} rx={48 * Math.sin(Math.acos((y-50)/48))} ry={3} fill="none" stroke="#6366f1" strokeWidth="0.2" />
          ))}
          
          {/* Longitudes (Rotating Effect) */}
          <g className="animate-spin-slow origin-center">
            {[0, 30, 60, 90, 120, 150].map(angle => (
              <ellipse key={`long-${angle}`} cx="50%" cy="50%" rx={48} ry={48} fill="none" stroke="#6366f1" strokeWidth="0.1" transform={`rotate(${angle} 50 50)`} />
            ))}
          </g>
        </svg>

        {/* Region Pings (Holographic Dots) */}
        {nodes.map((node, i) => {
            // Distribute dots around the sphere surface procedurally
            const angle = (i / nodes.length) * Math.PI * 2;
            const x = 50 + 35 * Math.cos(angle);
            const y = 50 + 20 * Math.sin(angle);
            return (
                <div 
                    key={node.id}
                    className="absolute w-3 h-3 rounded-full shadow-[0_0_15px_#6366f1] animate-pulse"
                    style={{ 
                        left: `${x}%`, 
                        top: `${y}%`, 
                        backgroundColor: node.color || '#6366f1',
                        boxShadow: `0 0 20px ${node.color || '#6366f1'}`
                    }}
                >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-white/10 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity">
                        {node.label}
                    </div>
                </div>
            );
        })}
      </div>

      {/* ☄️ Data Arcs ☄️ */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {nodes.length > 1 && nodes.map((node, i) => {
            if (i === 0) return null;
            return (
                <path 
                    key={`arc-${i}`}
                    d={`M 150 250 Q 250 50 350 250`}
                    fill="none"
                    stroke="url(#arcGradient)"
                    strokeWidth="1"
                    strokeDasharray="10 10"
                    className="opacity-40"
                >
                    <animate attributeName="stroke-dashoffset" from="100" to="0" dur="2s" repeatCount="indefinite" />
                </path>
            );
        })}
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* 🛸 Satellite Orbit 🛸 */}
      <div className="absolute w-[450px] h-[450px] rounded-full border border-white/5 animate-spin-slow">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HolographicGlobe;
