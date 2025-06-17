import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Crown, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PremiumCodeInput from './PremiumCodeInput';

type ScriptFunction = {
  name: string;
  status: string;
};

type Script = {
  id: string;
  game_name: string;
  description: string | null;
  functions: ScriptFunction[] | null;
  script_body: string;
  status: string;
  is_premium: boolean;
};

const Scripts = () => {
  const { toast } = useToast();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [freeScripts, setFreeScripts] = useState<Script[]>([]);
  const [premiumScripts, setPremiumScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        try {
          const { data, error } = await supabase.functions.invoke('check-premium-status', {
            body: { userId }
          });

          if (!error && data?.isPremium) {
            setIsPremium(true);
          }
        } catch (error) {
          console.error('Error checking premium status:', error);
        }
      }
    };

    checkPremiumStatus();
  }, []);

  useEffect(() => {
    const fetchScripts = async () => {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error loading scripts",
          description: error.message,
          variant: "destructive",
        });
        setFreeScripts([]);
        setPremiumScripts([]);
      } else {
        const scripts = data as unknown as Script[];
        setFreeScripts(scripts.filter(script => !script.is_premium));
        setPremiumScripts(scripts.filter(script => script.is_premium));
      }
      setLoading(false);
    };

    fetchScripts();

    const channel = supabase
      .channel('realtime-scripts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scripts',
        },
        () => {
          fetchScripts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const copyToClipboard = async (script: string, gameName: string, isScriptPremium: boolean) => {
    if (isScriptPremium && !isPremium) {
      toast({
        title: "Premium Required",
        description: "You need to activate premium to access this script",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(script);
      setCopiedScript(script);
      toast({
        title: "Script Copied!",
        description: `${gameName} script copied to clipboard`,
      });
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy script to clipboard",
        variant: "destructive",
      });
    }
  };

  const renderScriptCard = (script: Script, index: number, isPremiumSection: boolean = false) => (
    <Card 
      key={script.id} 
      className={`${script.is_premium ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' : 'bg-gray-800/50 border-gray-700'} hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 animate-scale-in group`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-white text-xl group-hover:text-cyan-400 transition-colors duration-300 flex items-center">
            {script.is_premium && <Crown className="mr-2 text-yellow-500" size={18} />}
            {script.game_name}
            {script.is_premium && !isPremium && <Lock className="ml-2 text-gray-400" size={16} />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {script.is_premium && (
              <Badge className="bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold">
                PREMIUM
              </Badge>
            )}
            <Badge
              variant={script.status === 'Working' ? 'default' : 'destructive'}
              className={script.status === 'Working' ? 'bg-green-500 hover:bg-green-500/90 border-transparent text-primary-foreground' : 'bg-red-500 hover:bg-red-500/90 border-transparent text-destructive-foreground'}
            >
              {script.status === 'Working' ? '✅ Working' : '❌ Patched'}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          {script.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Functions List */}
        {script.functions && script.functions.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-cyan-400 mb-2">Functions:</h4>
            {script.functions.map((func, funcIndex) => (
              <div key={funcIndex} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{func.name}</span>
                <span className="text-lg">{func.status}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Script Code */}
        <div className="bg-gray-900/70 p-3 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-cyan-400 font-mono">SCRIPT</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-cyan-400"
              onClick={() => copyToClipboard(script.script_body, script.game_name, script.is_premium)}
            >
              {copiedScript === script.script_body ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </div>
          <code className={`text-xs font-mono break-all leading-relaxed ${script.is_premium && !isPremium ? 'text-gray-600 blur-sm' : 'text-gray-300'}`}>
            {script.is_premium && !isPremium ? script.script_body.replace(/./g, '*') : script.script_body}
          </code>
        </div>

        {/* Copy Button */}
        <Button
          className={`w-full transition-all duration-300 hover:scale-105 ${
            script.is_premium 
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500' 
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500'
          } text-white`}
          onClick={() => copyToClipboard(script.script_body, script.game_name, script.is_premium)}
          disabled={script.is_premium && !isPremium}
        >
          {script.is_premium && !isPremium ? (
            <>
              <Lock size={16} className="mr-2" />
              Premium Required
            </>
          ) : copiedScript === script.script_body ? (
            <>
              <Check size={16} className="mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} className="mr-2" />
              Copy Script
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <section id="scripts" className="py-20 px-4 bg-gray-900/50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Scripts
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Premium Roblox scripts with advanced features and bypass protection
          </p>
        </div>

        {/* Premium Code Input */}
        <div className="mb-12">
          <PremiumCodeInput onPremiumStatusChange={setIsPremium} isPremium={isPremium} />
        </div>

        {/* Free Scripts Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Free Scripts
              </span>
            </h3>
            <p className="text-gray-400">
              High-quality scripts available to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-10 text-gray-400">Loading free scripts...</div>
            ) : freeScripts.length > 0 ? (
              freeScripts.map((script, index) => renderScriptCard(script, index))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-400">No free scripts available</div>
            )}
          </div>
        </div>

        {/* Premium Scripts Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center">
              <Crown className="mr-3 text-yellow-500" size={32} />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Premium Scripts
              </span>
            </h3>
            <p className="text-gray-400">
              {isPremium ? "Exclusive premium scripts with advanced features" : "Activate premium to access these exclusive scripts"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-10 text-gray-400">Loading premium scripts...</div>
            ) : premiumScripts.length > 0 ? (
              premiumScripts.map((script, index) => renderScriptCard(script, index, true))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-400">No premium scripts available</div>
            )}
          </div>
        </div>

        {/* More Scripts Coming Soon */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">More Scripts Coming Soon!</h3>
            <p className="text-gray-400 text-sm">
              We're constantly working on new scripts and features. Join our Discord to stay updated!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scripts;
