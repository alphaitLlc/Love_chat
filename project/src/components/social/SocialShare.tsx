import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { SocialShare as SocialShareType } from '../../types';
import toast from 'react-hot-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export default function SocialShare({ url, title, description, image, className = '' }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateUTMUrl = (platform: string, baseUrl: string) => {
    const utmParams = new URLSearchParams({
      utm_source: platform,
      utm_medium: 'social',
      utm_campaign: 'product_share',
      utm_content: title.toLowerCase().replace(/\s+/g, '_')
    });
    
    return `${baseUrl}?${utmParams.toString()}`;
  };

  const shareOptions: Array<{
    platform: SocialShareType['platform'];
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    getUrl: (url: string) => string;
  }> = [
    {
      platform: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      getUrl: (shareUrl) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      platform: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      getUrl: (shareUrl) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      platform: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      getUrl: (shareUrl) => `https://wa.me/?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`
    },
    {
      platform: 'email',
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      getUrl: (shareUrl) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ''}\n\n${shareUrl}`)}`
    }
  ];

  const handleShare = (platform: SocialShareType['platform'], getUrl: (url: string) => string) => {
    const utmUrl = generateUTMUrl(platform, url);
    const shareUrl = getUrl(utmUrl);
    
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setIsOpen(false);
    toast.success(`Partagé sur ${platform}`);
  };

  const copyToClipboard = async () => {
    try {
      const utmUrl = generateUTMUrl('direct', url);
      await navigator.clipboard.writeText(utmUrl);
      setCopied(true);
      toast.success('Lien copié !');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>Partager</span>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]">
            <h3 className="font-semibold text-gray-900 mb-4">Partager ce produit</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.platform}
                    onClick={() => handleShare(option.platform, option.getUrl)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white transition-colors ${option.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Copy Link */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={generateUTMUrl('direct', url)}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Stats */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">
                Les liens partagés incluent un suivi UTM pour mesurer les performances
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}