import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, Monitor, X, ShieldAlert, MonitorCheck, Lock, User, Key } from 'lucide-react';
import Guacamole from '@assistivlabs/guacamole-common-js';

const RDPViewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [status, setStatus] = useState('ready');
    
    // Credential State
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [showLogin, setShowLogin] = useState(true);

    const handleConnect = (e) => {
        if (e) e.preventDefault();
        setShowLogin(false);
        setStatus('connecting');
    };

    useEffect(() => {
        if (showLogin || status !== 'connecting') return;

        // Clean WebSocket URL (no query params to avoid library double-encoding/undefined issues)
        const wsUrl = `ws://${window.location.hostname}:8085/ws/rdp/${id}`;
        
        const tunnel = new Guacamole.WebSocketTunnel(wsUrl);
        const client = new Guacamole.Client(tunnel);

        client.onstatechange = (state) => {
            console.log("Guacamole State:", state);
            if (state === 3) setStatus('connected');
            if (state === 5) setStatus('disconnected');
        };

        client.onerror = (error) => {
            console.error("Guacamole Client Error:", error);
            setStatus('error_rdp');
        };

        // Attach Display
        const display = client.getDisplay();
        const element = display.getElement();
        
        if (canvasRef.current) {
            canvasRef.current.innerHTML = '';
            canvasRef.current.appendChild(element);
            
            // Auto-scale to fit
            const resize = () => {
                const width = canvasRef.current.offsetWidth;
                const height = canvasRef.current.offsetHeight;
                if (width && height && display.getWidth()) {
                    display.scale(Math.min(width / display.getWidth(), height / display.getHeight()));
                }
            };
            window.addEventListener('resize', resize);
            setTimeout(resize, 100);
        }

        // Connect with credentials passed via the protocol handshake
        // Since we refactored the backend to a transparent proxy, 
        // we send the target machine parameters here.
        const connectString = [
            `hostname=127.0.0.1`,
            `port=3389`,
            `username=${encodeURIComponent(credentials.username)}`,
            `password=${encodeURIComponent(credentials.password)}`,
            `ignore-cert=true`,
            `security=rdp`,
            `width=${window.innerWidth}`,
            `height=${window.innerHeight}`,
            `dpi=96`
        ].join('&');

        client.connect(connectString);

        // Handle focus and input
        const keyboard = new Guacamole.Keyboard(document);
        keyboard.onkeydown = (keysym) => client.sendKeyEvent(1, keysym);
        keyboard.onkeyup = (keysym) => client.sendKeyEvent(0, keysym);

        const mouse = new Guacamole.Mouse(element);
        mouse.onmousedown = mouse.onmouseup = mouse.onmousemove = (mouseState) => {
            client.sendMouseState(mouseState);
        };

        return () => {
            client.disconnect();
            keyboard.onkeydown = keyboard.onkeyup = null;
            window.removeEventListener('resize', null);
        };
    }, [id, showLogin, status, credentials]);

    return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col font-sans overflow-hidden">
            {/* Minimal Header */}
            <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Monitor className="w-3 h-3" /> Secure RDP Tunnel | Instance-{id}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {status === 'connected' && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-2 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                            <MonitorCheck className="w-3 h-3" /> Encrypted Stream Active
                        </span>
                    )}
                    <button 
                        onClick={() => window.close()} 
                        className="text-slate-500 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-auto bg-black p-4">
                <div ref={canvasRef} className="shadow-2xl ring-1 ring-slate-800 rounded-sm w-full h-full flex items-center justify-center" />

                {(status !== 'connected' || showLogin) && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
                        <div className="max-w-md w-full text-center space-y-6 p-8">
                            {showLogin ? (
                                <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
                                   <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                       <Lock className="w-6 h-6 text-blue-500" />
                                   </div>
                                   <h3 className="text-xl font-bold text-white mb-2">Windows Credentials</h3>
                                   <p className="text-slate-500 text-xs mb-8">Provide the RDP credentials for the target instance to establish the secure session.</p>
                                   
                                   <form onSubmit={handleConnect} className="space-y-4">
                                       <div className="relative">
                                           <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                           <input 
                                                type="text" 
                                                placeholder="Username (e.g. Administrator)" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500 transition outline-none"
                                                value={credentials.username}
                                                onChange={e => setCredentials({...credentials, username: e.target.value})}
                                                required
                                           />
                                       </div>
                                       <div className="relative">
                                           <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                                           <input 
                                                type="password" 
                                                placeholder="Password" 
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-blue-500 transition outline-none"
                                                value={credentials.password}
                                                onChange={e => setCredentials({...credentials, password: e.target.value})}
                                                required
                                           />
                                       </div>
                                       <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">
                                           Connect to Machine
                                       </button>
                                   </form>
                                </div>
                            ) : status === 'connecting' ? (
                                <>
                                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                    <div className="space-y-2">
                                        <h3 className="text-white font-bold text-lg">Initializing High-Fidelity GUI</h3>
                                        <p className="text-slate-400 text-xs">Negotiating AES-256 encrypted binary stream with the Guacamole proxy...</p>
                                    </div>
                                </>
                            ) : (
                                <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                                    <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <h3 className="text-white font-bold mb-2">Streaming Error</h3>
                                    <p className="text-slate-400 text-xs mb-6">The secure tunnel was interrupted. Ensure the credentials are correct and port 3389 is reachable.</p>
                                    <button onClick={() => setShowLogin(true)} className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-500 transition">Back to Login</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 text-[9px] text-slate-500 uppercase tracking-tighter">
                <div className="flex gap-4">
                    <span>Protocol: RDP (Secure)</span>
                    <span>Bitrate: Variable (Auto-scale)</span>
                </div>
                <div>UniCloudOps Proxy v1.5.2</div>
            </div>
        </div>
    );
};

export default RDPViewer;
