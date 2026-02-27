export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { runProductionCheck } = await import('./lib/config/production-check');
        await runProductionCheck();
    }
}
