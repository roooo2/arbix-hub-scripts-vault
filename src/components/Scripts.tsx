
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Scripts = () => {
  const { toast } = useToast();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const scripts = [
    {
      gameName: "Steal a Brianrot",
      functions: [
        { name: "Anti Cheat Bypass", status: "🟢" },
        { name: "Insta Steal", status: "🟢" }
      ],
      script: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/Youifpg/Steal-a-Brianrot/refs/heads/main/InstaSteal.lua"))()'
    }
  ];

  const copyToClipboard = async (script: string, gameName: string) => {
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

        {/* Scripts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scripts.map((script, index) => (
            <Card 
              key={script.gameName} 
              className="bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle className="text-white text-xl group-hover:text-cyan-400 transition-colors duration-300">
                  {script.gameName}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Premium Script Collection
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Functions List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">Functions:</h4>
                  {script.functions.map((func, funcIndex) => (
                    <div key={funcIndex} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{func.name}</span>
                      <span className="text-lg">{func.status}</span>
                    </div>
                  ))}
                </div>

                {/* Script Code */}
                <div className="bg-gray-900/70 p-3 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-cyan-400 font-mono">SCRIPT</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-cyan-400"
                      onClick={() => copyToClipboard(script.script, script.gameName)}
                    >
                      {copiedScript === script.script ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </Button>
                  </div>
                  <code className="text-xs text-gray-300 font-mono break-all leading-relaxed">
                    {script.script}
                  </code>
                </div>

                {/* Copy Button */}
                <Button
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition-all duration-300 hover:scale-105"
                  onClick={() => copyToClipboard(script.script, script.gameName)}
                >
                  {copiedScript === script.script ? (
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
          ))}
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
