import { motion } from 'framer-motion';
import { Heart, Target, Users, Shield, Award, Globe } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export function AboutPage() {
  const values = [
    { icon: <Heart className="w-6 h-6" />, title: 'Compassion', desc: 'We believe in the power of human kindness to save lives.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Safety', desc: 'Every donation is handled with the highest safety standards.' },
    { icon: <Users className="w-6 h-6" />, title: 'Community', desc: 'Building a network of donors and recipients who support each other.' },
    { icon: <Award className="w-6 h-6" />, title: 'Recognition', desc: 'Celebrating and rewarding the heroes who give the gift of life.' },
  ];

  

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About HemaLink
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We're on a mission to ensure no one dies due to lack of blood. HemaLink connects donors,
              hospitals, and patients in a seamless ecosystem of life-saving support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Mission</h2>
                <p className="text-slate-600">
                  To create a world where blood is always available when needed. We leverage technology
                  to connect donors with recipients instantly, making blood donation accessible, efficient,
                  and rewarding for everyone involved.
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Our Vision</h2>
                <p className="text-slate-600">
                  To build the world's largest and most efficient blood donation network. We envision
                  a future where every hospital has adequate blood supply and every patient receives
                  the blood they need, when they need it.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              These core values guide everything we do at HemaLink.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="text-center h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="/images/hospital.jpg"
                alt="Our Impact"
                className="rounded-2xl shadow-xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-slate-800 mb-6">Our Impact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">100,000+ Lives Saved</h4>
                    <p className="text-slate-600 text-sm">Through our network of dedicated donors and partner hospitals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">25,000+ Active Donors</h4>
                    <p className="text-slate-600 text-sm">A growing community of heroes ready to help at a moment's notice.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">50+ Cities Covered</h4>
                    <p className="text-slate-600 text-sm">Expanding our reach to serve more communities every day.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
