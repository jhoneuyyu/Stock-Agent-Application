'use client';

import dynamic from 'next/dynamic';

// Dynamically import Ballpit to avoid SSR issues
const Ballpit = dynamic(() => import('./Ballpit'), { ssr: false });

interface BallpitBackgroundProps {
    className?: string;
}

/**
 * A background wrapper for the Ballpit component
 * Can be used as a decorative background element
 */
export default function BallpitBackground({ className = '' }: BallpitBackgroundProps) {
    return (
        <div
            className={`fixed inset-0 pointer-events-none opacity-30 ${className}`}
            style={{ zIndex: 0 }}
        >
            <Ballpit
                count={60}
                gravity={0.1}
                friction={0.95}
                wallBounce={0.9}
                followCursor={true}
                colors={[0x3b82f6, 0x8b5cf6, 0x6366f1, 0x1e293b]}
                minSize={0.5}
                maxSize={1.2}
            />
        </div>
    );
}
