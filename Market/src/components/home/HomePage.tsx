import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Star, 
  ArrowRight, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  MessageCircle,
  Download,
  ChevronDown,
  Check,
  Heart,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const stats = [
    { label: 'Vendeurs actifs', value: '10,000+', icon: Users },
    { label: 'Produits disponibles', value: '500K+', icon: ShoppingBag },
    { label: 'Transactions mensuelles', value: '€2M+', icon: TrendingUp },
    { label: 'Pays couverts', value: '25+', icon: Globe }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Sécurisé et Fiable',
      description: 'Transactions sécurisées, vendeurs vérifiés, paiements protégés par Stripe'
    },
    {
      icon: Zap,
      title: 'Réactivité',
      description: 'Commandes traitées rapidement, livraisons express, support 24/7'
    },
    {
      icon: MessageCircle,
      title: 'Communication Directe',
      description: 'Chat en temps réel, négociation de prix, support personnalisé'
    },
    {
      icon: TrendingUp,
      title: 'Croissance Garantie',
      description: 'Outils marketing avancés, analytics détaillées, tunnels de vente'
    }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Directrice Achats, TechCorp',
      content: 'LinkMarket a révolutionné notre approvisionnement. Nous avons réduit nos coûts de 30% tout en améliorant la qualité.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Jean Martin',
      role: 'Fondateur, EcoSupply',
      content: 'En tant que fournisseur, LinkMarket m\'a permis d\'atteindre des milliers de nouveaux clients. Le ROI est exceptionnel.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Sophie Bernard',
      role: 'E-commerce Manager, StylePlus',
      content: 'Les outils de live shopping ont boosté nos ventes de 150%. L\'interface est intuitive et les résultats parlent d\'eux-mêmes.',
      rating: 5,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      description: 'Parfait pour commencer',
      features: [
        'Jusqu\'à 10 produits',
        'Commission 5%',
        'Support email',
        'Analytics de base'
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      name: 'Professional',
      price: '49€/mois',
      description: 'Pour les entreprises en croissance',
      features: [
        'Produits illimités',
        'Commission 3%',
        'Support prioritaire',
        'Analytics avancées',
        'Live shopping',
        'Tunnels de vente'
      ],
      cta: 'Essai gratuit 14 jours',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      description: 'Solutions personnalisées',
      features: [
        'Tout Professional',
        'Commission négociable',
        'Account manager dédié',
        'API personnalisée',
        'Intégrations sur mesure',
        'Formation équipe'
      ],
      cta: 'Nous contacter',
      popular: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                L'avenir du
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  {' '}B2B
                </span>
                <br />
                commence ici
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
                Connectez vendeurs et fournisseurs sur la première plateforme qui combine 
                <strong className="text-white"> e-commerce, live shopping</strong> et 
                <strong className="text-white"> intelligence artificielle</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Link to="/register" className="flex items-center">
                    Démarrer gratuitement
                    <ArrowRight className="inline ml-2 h-5 w-5" />
                  </Link>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsVideoPlaying(true)}
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Voir la démo
                </motion.button>
              </div>

              {/* App Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://play.google.com/store/apps/details?id=com.linkmarket"
                  className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-black/30 transition-all duration-300"
                >
                  <Download className="h-8 w-8" />
                  <div>
                    <p className="text-xs text-blue-200">Télécharger sur</p>
                    <p className="text-lg font-semibold">Google Play</p>
                  </div>
                </a>
                
                <a 
                  href="https://apps.apple.com/app/idXXXXXXXX"
                  className="flex items-center space-x-3 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 hover:bg-black/30 transition-all duration-300"
                >
                  <Download className="h-8 w-8" />
                  <div>
                    <p className="text-xs text-blue-200">Télécharger sur</p>
                    <p className="text-lg font-semibold">App Store</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsVideoPlaying(true)}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all duration-300"
                  >
                    <Play className="h-12 w-12 text-white ml-1" />
                  </motion.button>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">Découvrez LinkMarket en 2 minutes</p>
                    <p className="text-blue-200 text-sm">Voir comment révolutionner votre business B2B</p>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">+150%</p>
                    <p className="text-gray-600 text-sm">Croissance moyenne</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">10K+</p>
                    <p className="text-gray-600 text-sm">Utilisateurs actifs</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="h-8 w-8 text-white/60" />
        </motion.div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-2 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                <p className="text-white">Vidéo de démonstration LinkMarket</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir LinkMarket ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui révolutionne la façon dont les entreprises 
              achètent et vendent en B2B
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 w-fit mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Shopping Preview */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Live Shopping
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {' '}Révolutionnaire
                </span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Vendez en direct, interagissez avec vos clients en temps réel et 
                boostez vos conversions avec notre technologie de live shopping avancée.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Streaming HD en temps réel',
                  'Chat interactif avec les spectateurs',
                  'Ajout au panier pendant le live',
                  'Analytics détaillées post-live'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Link to="/live-shopping" className="flex items-center">
                  Essayer le Live Shopping
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </Link>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Live Indicator */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    LIVE
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    1,234
                  </div>

                  {/* Product Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Smartphone Pro Max</p>
                        <p className="text-blue-600 font-bold">€899</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Acheter
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Chat Preview */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                      <span className="font-semibold">Marie:</span> Quelle est la garantie ?
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                    <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm">
                      <span className="font-semibold">Jean:</span> Excellent produit ! 👍
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 10,000 entreprises nous font confiance
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-50 rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto"
              >
                <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                  <img
                    src={testimonials[activeTestimonial].avatar}
                    alt={testimonials[activeTestimonial].name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex justify-center lg:justify-start mb-4">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-xl lg:text-2xl text-gray-900 mb-4 leading-relaxed">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>
                    
                    <div>
                      <p className="font-semibold text-gray-900">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-gray-600">
                        {testimonials[activeTestimonial].role}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tarifs transparents
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                  plan.popular ? 'border-2 border-blue-500 scale-105' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Plus populaire
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{plan.price}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Link to="/register">
                    {plan.cta}
                  </Link>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Prêt à révolutionner votre business ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Rejoignez des milliers d'entreprises qui ont déjà transformé leur 
              façon de vendre et d'acheter avec LinkMarket.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Link to="/register" className="flex items-center">
                  Commencer gratuitement
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </Link>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                <Link to="/contact">
                  Planifier une démo
                </Link>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}