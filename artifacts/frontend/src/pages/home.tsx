import { useApiHealth, getApiHealthQueryKey } from '@workspace/api-client-react';
import { Terminal, WifiOff, Loader2, Database, ShieldCheck, Server } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { data, isLoading } = useApiHealth({
    query: {
      queryKey: getApiHealthQueryKey(),
      retry: 2,
      refetchInterval: 5000,
    }
  });

  const isUp = data?.status === 'UP';

  const [dots, setDots] = useState('');
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
        style={{ 
          backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      <div className="absolute top-8 left-8 hidden md:flex items-center gap-3 text-muted-foreground/50 font-mono text-xs">
        <Database className="w-4 h-4" />
        <span>v0.1.0-alpha</span>
      </div>

      <div className="z-10 flex flex-col items-center max-w-lg w-full px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-background flex items-center justify-center mb-10 border border-border shadow-2xl relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl group-hover:bg-primary/30 transition-colors duration-700" />
          <Terminal className="w-10 h-10 text-primary relative z-10" />
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4">
          DevLeap
        </h1>
        <p className="text-muted-foreground font-mono text-sm tracking-widest mb-16 uppercase">
          &gt; practice_your_craft
        </p>

        <div className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-border to-transparent rounded-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-card rounded-lg p-6 flex flex-col gap-6 border border-border/50 shadow-2xl">
            
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  System Core
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                {isLoading ? (
                  <span className="text-muted-foreground">CONNECTING...</span>
                ) : isUp ? (
                  <span className="text-emerald-500">ONLINE</span>
                ) : (
                  <span className="text-destructive">ERR_CONN_REFUSED</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : isUp ? (
                  <>
                    <ShieldCheck className="w-6 h-6 text-emerald-500 relative z-10" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
                  </>
                ) : (
                  <WifiOff className="w-6 h-6 text-destructive" />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium mb-1">
                  {isLoading ? 'Establishing secure connection' : isUp ? 'API Services Connected' : 'Backend Unreachable'}
                </span>
                <span className="text-xs text-muted-foreground font-mono h-4">
                  {isLoading ? `Awaiting response${dots}` : isUp ? 'Latency: < 20ms' : 'Connection refused by peer'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-muted-foreground/40 font-mono">
          [System Ready for Input]
        </div>
      </div>
    </div>
  );
}
