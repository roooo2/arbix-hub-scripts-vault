
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Key, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PremiumCodeInputProps {
  onPremiumStatusChange: (isPremium: boolean) => void;
  isPremium: boolean;
}

const PremiumCodeInput = ({ onPremiumStatusChange, isPremium }: PremiumCodeInputProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a premium code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get or create user ID (for demo purposes, using a simple identifier)
      const userId = localStorage.getItem('user_id') || `user_${Date.now()}`;
      localStorage.setItem('user_id', userId);

      // Call secure edge function to validate premium code
      const { data, error } = await supabase.functions.invoke('validate-premium-code', {
        body: {
          code: code.trim(),
          userId: userId
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to validate premium code",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (data.error) {
        toast({
          title: "Invalid Code",
          description: data.error,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "Premium Activated!",
        description: "You now have access to premium scripts!",
      });

      onPremiumStatusChange(true);
      setCode('');
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (isPremium) {
    return (
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
        <CardContent className="flex items-center justify-center py-6">
          <div className="flex items-center space-x-3">
            <Crown className="text-yellow-500" size={24} />
            <div>
              <Badge className="bg-yellow-500 hover:bg-yellow-500/90 text-black font-semibold">
                <CheckCircle size={14} className="mr-1" />
                PREMIUM ACTIVE
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Key className="mr-2 text-cyan-400" size={20} />
          Activate Premium
        </CardTitle>
        <CardDescription className="text-gray-400">
          Enter your premium code to access exclusive scripts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder="Enter premium code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-gray-900/70 border-gray-600 text-white placeholder-gray-500"
          />
          <Button
            onClick={handleCodeSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
          >
            {loading ? 'Activating...' : 'Activate'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumCodeInput;
