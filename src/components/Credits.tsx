
import { Card, CardContent } from '@/components/ui/card';
import { Crown, Code, Shield } from 'lucide-react';

const Credits = () => {
  const team = [
    {
      role: "Owner",
      name: "wv61",
      icon: Crown,
      color: "from-yellow-400 to-orange-500"
    },
    {
      role: "Website Developer",
      name: "Elmejorsiuuu",
      icon: Code,
      color: "from-cyan-400 to-blue-500"
    },
    {
      role: "Staff",
      name: "chase_lool3004",
      icon: Shield,
      color: "from-purple-400 to-pink-500"
    }
  ];

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
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => {
            const IconComponent = member.icon;
            return (
              <Card
                key={member.name}
                className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${member.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
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
