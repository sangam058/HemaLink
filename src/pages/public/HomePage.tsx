import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Building2, Award, ArrowRight, Droplets, Shield, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export function HomePage() {
  const stats = [
    { icon: <Droplets className="w-8 h-8" />, value: '50,000+', label: 'Units Donated' },
    { icon: <Users className="w-8 h-8" />, value: '25,000+', label: 'Active Donors' },
    { icon: <Building2 className="w-8 h-8" />, value: '500+', label: 'Partner Hospitals' },
    { icon: <Heart className="w-8 h-8" />, value: '100,000+', label: 'Lives Saved' },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Network',
      description: 'All hospitals and donors are verified for safe and reliable blood donation.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Matching',
      description: 'Instant matching of blood requests with nearby compatible donors.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Rewards Program',
      description: 'Earn points, badges, and recognition for every donation you make.',
    },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Blood Donation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" /> Every Drop Saves Lives
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Connect. Donate.
                <span className="block bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  Save Lives.
                </span>
              </h1>
              <p className="text-lg text-slate-300 mb-8">
                HemaLink bridges the gap between blood donors and those in need. Join our community
                of heroes and make a difference today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Become a Donor <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                    Request Blood
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Blood Types */}
        <div className="absolute bottom-10 right-10 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-4 gap-3"
          >
            {bloodTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold border border-white/20"
              >
                {type}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Why Choose HemaLink?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform makes blood donation simple, safe, and rewarding for everyone involved.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Getting started with HemaLink is easy. Follow these simple steps.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Sign Up', desc: 'Create your account as a donor, requester, or hospital' },
              { step: '02', title: 'Complete Profile', desc: 'Add your blood type, location, and availability' },
              { step: '03', title: 'Get Matched', desc: 'Our system matches you with nearby requests or donors' },
              { step: '04', title: 'Save Lives', desc: 'Donate blood and earn rewards for your contribution' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold text-rose-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-0.5 bg-rose-100" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-rose-600 to-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-rose-100 max-w-2xl mx-auto mb-8">
              Join thousands of donors who are saving lives every day. Your blood donation can save up to 3 lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-rose-600 hover:bg-rose-50 w-full sm:w-auto">
                  Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-slate-500 font-medium">Trusted by Leading Healthcare Institutions</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {['City General Hospital', 'Mercy Medical', 'St. Mary\'s', 'Metro Health', 'Unity Hospital'].map((name) => (
              <div key={name} className="text-xl font-semibold text-slate-400">{name}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
