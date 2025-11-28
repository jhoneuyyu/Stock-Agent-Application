'use client';

import dynamic from 'next/dynamic';

// Dynamically import Ballpit to avoid SSR issues with Three.js
const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

export default function BallpitDemo() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
            {/* Header */}
            <header className="glass border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold gradient-text">Ballpit Demo</h1>
                        <a
                            href="/"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            ← Back to Stock Agent
                        </a>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Demo 1: Default Ballpit */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Default Ballpit</h2>
                        <p className="text-sm text-muted-foreground">
                            Interactive physics-based ball simulation with cursor following
                        </p>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '500px',
                            maxHeight: '500px',
                            width: '100%',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        }}
                    >
                        <Ballpit
                            count={200}
                            gravity={0.7}
                            friction={0.8}
                            wallBounce={0.95}
                            followCursor={true}
                        />
                    </div>
                </div>

                {/* Demo 2: Colorful Ballpit */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Colorful Ballpit</h2>
                        <p className="text-sm text-muted-foreground">
                            Custom colors and different physics parameters
                        </p>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '500px',
                            maxHeight: '500px',
                            width: '100%',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        }}
                    >
                        <Ballpit
                            count={150}
                            gravity={0.5}
                            friction={0.85}
                            wallBounce={0.9}
                            followCursor={true}
                            colors={[0x3b82f6, 0x8b5cf6, 0xec4899, 0xf59e0b]}
                            minSize={0.3}
                            maxSize={0.8}
                        />
                    </div>
                </div>

                {/* Demo 3: No Gravity */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Zero Gravity</h2>
                        <p className="text-sm text-muted-foreground">
                            Floating balls with no gravity effect
                        </p>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '500px',
                            maxHeight: '500px',
                            width: '100%',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        }}
                    >
                        <Ballpit
                            count={100}
                            gravity={0}
                            friction={0.99}
                            wallBounce={0.95}
                            followCursor={true}
                            colors={[0x06b6d4, 0x14b8a6, 0x10b981]}
                            minSize={0.4}
                            maxSize={0.9}
                        />
                    </div>
                </div>

                {/* Demo 4: High Energy */}
                <div className="glass rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">High Energy</h2>
                        <p className="text-sm text-muted-foreground">
                            More balls, higher bounce, less friction
                        </p>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '500px',
                            maxHeight: '500px',
                            width: '100%',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                        }}
                    >
                        <Ballpit
                            count={300}
                            gravity={0.9}
                            friction={0.95}
                            wallBounce={0.98}
                            followCursor={true}
                            colors={[0xef4444, 0xf97316, 0xfbbf24, 0xeab308]}
                            minSize={0.2}
                            maxSize={0.6}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 py-4 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-sm text-muted-foreground">
                        Interactive Three.js Ballpit Component • Move your cursor to interact
                    </p>
                </div>
            </footer>
        </div>
    );
}
