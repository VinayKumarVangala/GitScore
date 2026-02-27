import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Dynamic data from query params
        const username = searchParams.get('username') || 'Explorer';
        const score = searchParams.get('score') || '0';
        const grade = searchParams.get('grade') || 'F';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#050505',
                        backgroundImage: 'radial-gradient(circle at top right, #00ffff10, transparent), radial-gradient(circle at bottom left, #9333ea10, transparent)',
                    }}
                >
                    {/* Mystical Border */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: '40px',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '40px',
                        }}
                    />

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            zIndex: 10,
                        }}
                    >
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ffff60', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            GitScore Coordinates
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
                            <div style={{ fontSize: '80px', fontWeight: '900', color: 'white', letterSpacing: '-0.05em' }}>
                                {username}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '60px', marginTop: '40px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ fontSize: '120px', fontWeight: '900', color: '#00ffff' }}>
                                    {score}
                                </div>
                                <div style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Mystical Score
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    fontSize: '120px',
                                    fontWeight: '900',
                                    color: grade === 'S' ? '#fbbf24' : '#9333ea',
                                    textShadow: '0 0 30px rgba(0,255,255,0.3)'
                                }}>
                                    {grade}
                                </div>
                                <div style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Rank
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: '60px',
                                padding: '10px 30px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '100px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                        >
                            git-score-v1.vercel.app
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
