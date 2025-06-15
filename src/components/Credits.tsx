
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Code } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a UUID (for visitor tracking)
function getOrCreateVisitorId() {
  let id = localStorage.getItem('arbixhub-visitor-id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('arbixhub-visitor-id', id);
  }
  return id;
}

const Credits = () => {
  const team = [
    {
      role: "Owner",
      name: "wv61",
      icon: Crown,
      color: "from-yellow-400 to-orange-500",
      avatar: "https://cdn.discordapp.com/avatars/1216727781505765460/78328b94bc85f3ecc2d125eb1d95562b.webp?size=512"
    },
    {
      role: "Website Developer",
      name: "Elmejorsiuuu",
      icon: Code,
      color: "from-cyan-400 to-blue-500",
      avatar: "https://cdn.discordapp.com/avatars/697962992041459756/6617a18545274c53c2fefc82cb827e40?size=1024"
    }
  ];

  const [viewStats, setViewStats] = useState<{total_views: number; unique_visitors: number;} | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Helper function to fetch stats from database
  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('website_stats')
      .select('total_views, unique_visitors')
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error("Error fetching website stats:", error);
      setLoadingStats(false);
      return;
    }
    setViewStats(data);
    setLoadingStats(false);
  };

  // Track view and fetch stats
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const incrementAndFetch = async () => {
      setLoadingStats(true);
      // Await the result of the RPC call and log error if it occurs
      const { error: rpcError } = await supabase.rpc('increment_view_count', { visitor_uuid: visitorId });
      if (rpcError) {
        console.error("Error incrementing view count:", rpcError);
      }
      // Fetch the stats again, so UI is up-to-date
      await fetchStats();
    };

    incrementAndFetch();

    // --- Realtime subscription for live updates ---
    const channel = supabase
      .channel('realtime-website-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'website_stats'
        },
        (payload) => {
          if (payload.new) {
            setViewStats({
              total_views: payload.new.total_views,
              unique_visitors: payload.new.unique_visitors,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="credits" className="py-20 px-4 bg-gray-950">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              Credits
            </span>
          </h2>
          <p className="text-gray-400 text-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Meet the amazing team behind ARBIX HUB
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {team.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <Card
                key={member.name}
                className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  {/* Profile Picture */}
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <img 
                      src={member.avatar} 
                      alt={`${member.name} profile`}
                      className="w-20 h-20 rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${member.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Role */}
                  <h3 className={`text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${member.color}`}>
                    {member.role}
                  </h3>

                  {/* Name */}
                  <p className="text-white font-medium text-xl group-hover:text-gray-300 transition-colors duration-300">
                    {member.name}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Views Counter */}
        <div className="flex flex-col items-center mt-14">
          <div className="bg-gradient-to-r from-cyan-700/30 to-purple-700/30 border border-cyan-500/20 rounded-xl px-7 py-4 flex flex-col gap-2 shadow animate-fade-in-up" style={{animationDelay: '0.30s'}}>
            <div className="flex justify-center items-center gap-4 text-center text-white">
              <span className="font-bold text-xl">
                👁️&nbsp;{loadingStats ? '...' : viewStats?.total_views ?? '--'}
              </span>
              <span className="text-gray-400 text-base">Total visits</span>
            </div>
            <div className="flex justify-center items-center gap-4 text-center text-white">
              <span className="font-bold text-xl">
                🎉&nbsp;{loadingStats ? '...' : viewStats?.unique_visitors ?? '--'}
              </span>
              <span className="text-gray-400 text-base">Unique visitors</span>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">Thank You!</h3>
            <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Special thanks to our community members and everyone who supports ARBIX HUB. 
              Your feedback and engagement help us create better tools and scripts for the Roblox community.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Credits;
