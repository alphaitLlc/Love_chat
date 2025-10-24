import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create a mock API for development when the backend is not available
const createMockApi = () => {
  return {
    get: async (url: string) => {
      console.log(`Mock API GET: ${url}`);
      
      // Return mock data based on the endpoint
      if (url === '/notifications/count') {
        return { data: { count: 3 } };
      }
      if (url === '/notifications') {
        return { 
          data: { 
            notifications: [
              {
                id: '1',
                type: 'order',
                title: 'Nouvelle commande',
                message: 'Votre commande #ORD-2024-123 a été confirmée',
                isRead: false,
                actionUrl: '/orders/1',
                createdAt: new Date().toISOString(),
                priority: 'high'
              },
              {
                id: '2',
                type: 'message',
                title: 'Nouveau message',
                message: 'Vous avez reçu un message de Marie Fournisseur',
                isRead: false,
                actionUrl: '/messages',
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                priority: 'medium'
              },
              {
                id: '3',
                type: 'system',
                title: 'Mise à jour système',
                message: 'La plateforme sera en maintenance ce soir à 22h',
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                priority: 'low'
              }
            ] 
          } 
        };
      }
      if (url === '/conversations/unread-count') {
        return { data: { count: 2 } };
      }
      if (url.startsWith('/conversations')) {
        if (url === '/conversations') {
          return {
            data: {
              conversations: [
                {
                  id: '1',
                  participants: ['1', '2'],
                  participantDetails: [
                    {
                      id: '1',
                      firstName: 'Jean',
                      lastName: 'Vendeur',
                      company: 'VendeurPro SARL',
                      email: 'vendor@example.com',
                      role: 'vendor'
                    },
                    {
                      id: '2',
                      firstName: 'Marie',
                      lastName: 'Fournisseur',
                      company: 'SupplyChain Solutions',
                      email: 'supplier@example.com',
                      role: 'supplier'
                    }
                  ],
                  lastMessage: {
                    id: '123',
                    conversationId: '1',
                    senderId: '2',
                    senderName: 'Marie Fournisseur',
                    receiverId: '1',
                    content: 'Bonjour, avez-vous reçu ma dernière offre ?',
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: 'text'
                  },
                  unreadCount: 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  type: 'direct',
                  conversationId: 'conv_1_2'
                }
              ]
            }
          };
        } else {
          // Single conversation
          return {
            data: {
              conversation: {
                id: '1',
                participants: ['1', '2'],
                participantDetails: [
                  {
                    id: '1',
                    firstName: 'Jean',
                    lastName: 'Vendeur',
                    company: 'VendeurPro SARL',
                    email: 'vendor@example.com',
                    role: 'vendor'
                  },
                  {
                    id: '2',
                    firstName: 'Marie',
                    lastName: 'Fournisseur',
                    company: 'SupplyChain Solutions',
                    email: 'supplier@example.com',
                    role: 'supplier'
                  }
                ],
                messages: [
                  {
                    id: '123',
                    conversationId: '1',
                    senderId: '2',
                    senderName: 'Marie Fournisseur',
                    receiverId: '1',
                    content: 'Bonjour, avez-vous reçu ma dernière offre ?',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: true,
                    type: 'text'
                  },
                  {
                    id: '124',
                    conversationId: '1',
                    senderId: '1',
                    senderName: 'Jean Vendeur',
                    receiverId: '2',
                    content: 'Oui, je l\'ai bien reçue. Pouvons-nous discuter des détails ?',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    read: true,
                    type: 'text'
                  }
                ],
                unreadCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                type: 'direct',
                conversationId: 'conv_1_2'
              }
            }
          };
        }
      }
      if (url.startsWith('/live-streams')) {
        return {
          data: {
            'hydra:member': [
              {
                id: '1',
                title: 'Découverte des Nouveaux Smartphones 2024',
                description: 'Présentation exclusive des derniers modèles',
                streamer: {
                  id: '1',
                  firstName: 'Jean',
                  lastName: 'Vendeur',
                  company: 'TechStore Pro'
                },
                status: 'live',
                scheduledAt: new Date().toISOString(),
                startedAt: new Date(Date.now() - 3600000).toISOString(),
                thumbnail: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?w=200&h=200&fit=crop',
                viewerCount: 1234,
                maxViewers: 1456,
                products: [
                  {
                    id: '1',
                    title: 'Smartphone Galaxy Pro',
                    price: '899.99'
                  }
                ],
                tags: ['smartphone', 'tech', 'nouveautés'],
                isPublic: true,
                allowChat: true,
                isLive: true
              }
            ]
          }
        };
      }
      if (url.startsWith('/products')) {
        return {
          data: {
            'hydra:member': [
              {
                id: '1',
                title: 'Smartphone Galaxy Pro Max',
                description: 'Dernier modèle avec écran OLED 6.7", 256GB de stockage, triple caméra 108MP',
                price: 899.99,
                originalPrice: 1199.99,
                images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'],
                category: 'Électronique',
                supplierId: '2',
                stock: 45,
                minOrder: 1,
                tags: ['smartphone', 'samsung', 'android', '5G'],
                rating: 4.8,
                reviewCount: 156,
                isPromoted: true
              }
            ]
          }
        };
      }
      if (url.startsWith('/kyc')) {
        if (url === '/kyc/status') {
          return {
            data: {
              status: 'pending',
              documents: [],
              requiredDocuments: ['identity_card', 'selfie', 'proof_of_address'],
              canSubmit: true
            }
          };
        }
        if (url === '/kyc/requirements') {
          return {
            data: {
              documentTypes: {
                identity_card: {
                  name: 'Pièce d\'identité',
                  description: 'Carte d\'identité, passeport ou permis de conduire',
                  formats: 'JPG, PNG, PDF',
                  maxSize: '5MB'
                },
                selfie: {
                  name: 'Selfie avec pièce d\'identité',
                  description: 'Photo de vous tenant votre pièce d\'identité',
                  formats: 'JPG, PNG',
                  maxSize: '5MB'
                },
                proof_of_address: {
                  name: 'Justificatif de domicile',
                  description: 'Facture d\'électricité, eau, gaz ou téléphone de moins de 3 mois',
                  formats: 'JPG, PNG, PDF',
                  maxSize: '5MB'
                }
              }
            }
          };
        }
      }
      if (url.startsWith('/payment-methods')) {
        return {
          data: {
            paymentMethods: [
              {
                id: '1',
                type: 'card',
                provider: 'stripe',
                displayName: 'Visa •••• 4242',
                last4: '4242',
                expiryMonth: 12,
                expiryYear: 2025,
                brand: 'visa',
                isDefault: true,
                isExpired: false,
                icon: '💳'
              }
            ]
          }
        };
      }
      if (url.startsWith('/social-share')) {
        return {
          data: {
            shareLinks: {
              facebook: 'https://www.facebook.com/sharer/sharer.php?u=https://example.com/product/1',
              twitter: 'https://twitter.com/intent/tweet?url=https://example.com/product/1',
              whatsapp: 'https://wa.me/?text=Check out this product: https://example.com/product/1',
              email: 'mailto:?subject=Check out this product&body=https://example.com/product/1',
              copy: 'https://example.com/product/1'
            },
            title: 'Smartphone Galaxy Pro Max',
            description: 'Dernier modèle avec écran OLED 6.7"',
            image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'
          }
        };
      }
      if (url.startsWith('/notifications/preferences')) {
        return {
          data: {
            preferences: {
              email: true,
              push: true,
              sms: false,
              marketing: true
            }
          }
        };
      }
      
      // Default empty response
      return { data: {} };
    },
    post: async (url: string, data: any) => {
      console.log(`Mock API POST: ${url}`, data);
      
      if (url === '/login_check') {
        return {
          data: {
            token: 'mock_jwt_token',
            user: {
              id: '1',
              email: data.username,
              firstName: 'Jean',
              lastName: 'Vendeur',
              role: 'vendor'
            }
          }
        };
      }
      
      if (url === '/register') {
        return {
          data: {
            message: 'Utilisateur créé avec succès',
            user: {
              id: '4',
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              isVerified: false,
              subscription: 'free',
              joinedAt: new Date().toISOString()
            },
            token: 'mock_jwt_token'
          }
        };
      }
      
      if (url.startsWith('/conversations')) {
        if (url.includes('/messages')) {
          return {
            data: {
              id: Date.now().toString(),
              conversationId: url.split('/')[2],
              senderId: '1',
              senderName: 'Jean Vendeur',
              receiverId: data.receiverId,
              content: data.content,
              timestamp: new Date().toISOString(),
              read: false,
              type: data.type || 'text'
            }
          };
        } else {
          return {
            data: {
              message: 'Conversation created successfully',
              conversation: {
                id: Date.now().toString(),
                participants: ['1', data.participantIds[0]],
                participantDetails: [
                  {
                    id: '1',
                    firstName: 'Jean',
                    lastName: 'Vendeur',
                    company: 'VendeurPro SARL',
                    email: 'vendor@example.com',
                    role: 'vendor'
                  },
                  {
                    id: data.participantIds[0],
                    firstName: 'Participant',
                    lastName: 'Test',
                    company: 'Test Company',
                    email: 'test@example.com',
                    role: 'client'
                  }
                ],
                unreadCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                type: data.type || 'direct',
                conversationId: `conv_1_${data.participantIds[0]}`
              }
            }
          };
        }
      }
      
      if (url.startsWith('/chatbot/chat')) {
        return {
          data: {
            response: 'Je comprends votre question. Voici comment je peux vous aider :',
            type: 'text',
            options: [
              'Parcourir les produits',
              'Aide avec une commande',
              'Contacter le support',
              'FAQ'
            ],
            sessionId: data.sessionId || 'session_123'
          }
        };
      }
      
      if (url.startsWith('/payments/create-intent')) {
        return {
          data: {
            orderId: Date.now().toString(),
            orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            clientSecret: 'mock_client_secret',
            paymentIntentId: 'pi_mock_' + Date.now(),
            totalAmount: data.items.reduce((sum: number, item: any) => sum + (item.quantity * 899.99), 0),
            currency: data.currency || 'EUR'
          }
        };
      }
      
      if (url.startsWith('/orders')) {
        return {
          data: {
            id: Date.now().toString(),
            orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
            productId: data.productId || '1',
            productTitle: data.productTitle || 'Smartphone Galaxy Pro Max',
            productImage: data.productImage || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
            buyerId: '1',
            buyerName: 'Jean Vendeur',
            sellerId: data.sellerId || '2',
            sellerName: data.sellerName || 'Marie Fournisseur',
            quantity: data.quantity || 1,
            unitPrice: data.unitPrice || 899.99,
            totalAmount: data.totalAmount || 899.99,
            commission: data.commission || 45.00,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: data.paymentMethod || 'Carte bancaire',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            shippingAddress: data.shippingAddress || {},
            billingAddress: data.billingAddress || {},
            timeline: [
              {
                status: 'pending',
                timestamp: new Date().toISOString(),
                description: 'Commande créée'
              }
            ]
          }
        };
      }
      
      if (url.startsWith('/kyc/upload')) {
        return {
          data: {
            message: 'Document uploaded successfully',
            document: {
              id: Date.now(),
              type: data.get('type'),
              status: 'pending',
              uploadedAt: new Date().toISOString()
            }
          }
        };
      }
      
      // Default response
      return { data: { message: 'Success' } };
    },
    put: async (url: string, data: any) => {
      console.log(`Mock API PUT: ${url}`, data);
      
      if (url.startsWith('/notifications/mark-all-read')) {
        return {
          data: {
            message: 'All notifications marked as read',
            count: 3
          }
        };
      }
      
      if (url.startsWith('/notifications/preferences')) {
        return {
          data: {
            message: 'Notification preferences updated',
            preferences: data.preferences
          }
        };
      }
      
      if (url.startsWith('/profile')) {
        return {
          data: {
            message: 'Profile updated successfully',
            user: {
              ...data
            }
          }
        };
      }
      
      // Default response
      return { data: { message: 'Success' } };
    },
    delete: async (url: string) => {
      console.log(`Mock API DELETE: ${url}`);
      return { data: { message: 'Success' } };
    }
  };
};

// Determine if we should use the mock API
const useMockApi = true; // Set to false when your backend is ready

// Création d'une instance axios avec la configuration de base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 (non autorisé) et que ce n'est pas une tentative de rafraîchissement
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Tentative de rafraîchissement du token (à implémenter)
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await api.post('/token/refresh', { refresh_token: refreshToken });
        // const { token } = response.data;
        // localStorage.setItem('token', token);
        
        // Réessayer la requête originale avec le nouveau token
        // originalRequest.headers.Authorization = `Bearer ${token}`;
        // return api(originalRequest);
        
        // Pour l'instant, on redirige vers la page de connexion
        window.location.href = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        // En cas d'échec du rafraîchissement, rediriger vers la page de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Create a wrapper that tries the real API first, then falls back to mock if needed
export const apiWrapper = {
  get: async (url: string, config?: any) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      console.warn(`API request failed, using mock data for ${url}`, error);
      if (useMockApi) {
        return createMockApi().get(url);
      }
      throw error;
    }
  },
  post: async (url: string, data?: any, config?: any) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      console.warn(`API request failed, using mock data for ${url}`, error);
      if (useMockApi) {
        return createMockApi().post(url, data);
      }
      throw error;
    }
  },
  put: async (url: string, data?: any, config?: any) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      console.warn(`API request failed, using mock data for ${url}`, error);
      if (useMockApi) {
        return createMockApi().put(url, data);
      }
      throw error;
    }
  },
  delete: async (url: string, config?: any) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      console.warn(`API request failed, using mock data for ${url}`, error);
      if (useMockApi) {
        return createMockApi().delete(url);
      }
      throw error;
    }
  }
};

// Services d'API
export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiWrapper.post('/login_check', { username: email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await apiWrapper.post('/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiWrapper.get('/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await apiWrapper.put('/profile', userData);
    return response.data;
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiWrapper.post('/change-password', { currentPassword, newPassword });
    return response.data;
  }
};

export const productService = {
  getProducts: async (params: any = {}) => {
    const response = await apiWrapper.get('/products', { params });
    return response.data;
  },
  
  getProduct: async (id: string) => {
    const response = await apiWrapper.get(`/products/${id}`);
    return response.data;
  },
  
  createProduct: async (productData: any) => {
    const response = await apiWrapper.post('/products', productData);
    return response.data;
  },
  
  updateProduct: async (id: string, productData: any) => {
    const response = await apiWrapper.put(`/products/${id}`, productData);
    return response.data;
  },
  
  deleteProduct: async (id: string) => {
    const response = await apiWrapper.delete(`/products/${id}`);
    return response.data;
  }
};

export const categoryService = {
  getCategories: async () => {
    const response = await apiWrapper.get('/categories');
    return response.data;
  },
  
  getCategory: async (id: string) => {
    const response = await apiWrapper.get(`/categories/${id}`);
    return response.data;
  }
};

export const orderService = {
  getOrders: async (params: any = {}) => {
    const response = await apiWrapper.get('/orders', { params });
    return response.data;
  },
  
  getOrder: async (id: string) => {
    const response = await apiWrapper.get(`/orders/${id}`);
    return response.data;
  },
  
  createOrder: async (orderData: any) => {
    const response = await apiWrapper.post('/orders', orderData);
    return response.data;
  },
  
  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiWrapper.put(`/orders/${id}`, { status });
    return response.data;
  }
};

export const paymentService = {
  createPaymentIntent: async (data: any) => {
    const response = await apiWrapper.post('/payments/create-intent', data);
    return response.data;
  },
  
  confirmPayment: async (orderId: string, paymentIntentId: string) => {
    const response = await apiWrapper.post(`/payments/confirm/${orderId}`, { paymentIntentId });
    return response.data;
  },
  
  getPaymentMethods: async () => {
    const response = await apiWrapper.get('/payment-methods');
    return response.data;
  },
  
  createSetupIntent: async () => {
    const response = await apiWrapper.post('/payment-methods/setup-intent');
    return response.data;
  },
  
  addPaymentMethod: async (paymentMethodId: string, makeDefault: boolean = false) => {
    const response = await apiWrapper.post('/payment-methods', { paymentMethodId, makeDefault });
    return response.data;
  },
  
  setDefaultPaymentMethod: async (id: string) => {
    const response = await apiWrapper.put(`/payment-methods/${id}/default`);
    return response.data;
  },
  
  deletePaymentMethod: async (id: string) => {
    const response = await apiWrapper.delete(`/payment-methods/${id}`);
    return response.data;
  }
};

export const liveStreamService = {
  getLiveStreams: async (params: any = {}) => {
    const response = await apiWrapper.get('/live-streams', { params });
    return response.data;
  },
  
  getPublicLiveStreams: async () => {
    const response = await apiWrapper.get('/live-streams/public');
    return response.data;
  },
  
  getLiveStream: async (id: string) => {
    const response = await apiWrapper.get(`/live-streams/${id}`);
    return response.data;
  },
  
  createLiveStream: async (streamData: any) => {
    const response = await apiWrapper.post('/live-streams', streamData);
    return response.data;
  },
  
  startLiveStream: async (id: string) => {
    const response = await apiWrapper.post(`/live-streams/start/${id}`);
    return response.data;
  },
  
  endLiveStream: async (id: string) => {
    const response = await apiWrapper.post(`/live-streams/end/${id}`);
    return response.data;
  },
  
  joinLiveStream: async (id: string, sessionId: string) => {
    const response = await apiWrapper.post(`/live-streams/${id}/join`, { sessionId });
    return response.data;
  },
  
  leaveLiveStream: async (id: string, sessionId: string) => {
    const response = await apiWrapper.post(`/live-streams/${id}/leave`, { sessionId });
    return response.data;
  },
  
  sendChatMessage: async (id: string, content: string, type: string = 'text') => {
    const response = await apiWrapper.post(`/live-streams/${id}/chat`, { content, type });
    return response.data;
  },
  
  highlightProduct: async (id: string, productId: string) => {
    const response = await apiWrapper.post(`/live-streams/${id}/highlight-product`, { productId });
    return response.data;
  },
  
  getLiveStreamAnalytics: async (id: string) => {
    const response = await apiWrapper.get(`/live-streams/${id}/analytics`);
    return response.data;
  },
  
  getLiveStreamMessages: async (id: string) => {
    const response = await apiWrapper.get(`/live-stream-messages?liveStream=${id}`);
    return response.data;
  }
};

export const messageService = {
  getConversations: async () => {
    const response = await apiWrapper.get('/conversations');
    return response.data;
  },
  
  getConversation: async (id: string) => {
    const response = await apiWrapper.get(`/conversations/${id}`);
    return response.data;
  },
  
  createConversation: async (data: any) => {
    const response = await apiWrapper.post('/conversations', data);
    return response.data;
  },
  
  sendMessage: async (conversationId: string, data: any) => {
    const response = await apiWrapper.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },
  
  markConversationAsRead: async (id: string) => {
    const response = await apiWrapper.put(`/conversations/${id}/read`);
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await apiWrapper.get('/conversations/unread-count');
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async (params: any = {}) => {
    const response = await apiWrapper.get('/notifications', { params });
    return response.data;
  },
  
  getUnreadNotifications: async () => {
    const response = await apiWrapper.get('/notifications/unread');
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await apiWrapper.get('/notifications/count');
    return response.data;
  },
  
  markAsRead: async (id: string) => {
    const response = await apiWrapper.put(`/notifications/${id}/read`);
    return response.data;
  },
  
  markAllAsRead: async () => {
    const response = await apiWrapper.put('/notifications/mark-all-read');
    return response.data;
  },
  
  deleteNotification: async (id: string) => {
    const response = await apiWrapper.delete(`/notifications/${id}`);
    return response.data;
  },
  
  getNotificationPreferences: async () => {
    const response = await apiWrapper.get('/notifications/preferences');
    return response.data;
  },
  
  updateNotificationPreferences: async (preferences: any) => {
    const response = await apiWrapper.put('/notifications/preferences', { preferences });
    return response.data;
  }
};

export const chatbotService = {
  sendMessage: async (message: string, sessionId?: string, context?: any) => {
    const response = await apiWrapper.post('/chatbot/chat', { message, sessionId, context });
    return response.data;
  },
  
  getSuggestions: async (context: string = 'general') => {
    const response = await apiWrapper.get('/chatbot/suggestions', { params: { context } });
    return response.data;
  },
  
  sendFeedback: async (sessionId: string, rating: number, comment?: string) => {
    const response = await apiWrapper.post('/chatbot/feedback', { sessionId, rating, comment });
    return response.data;
  }
};

export const analyticsService = {
  trackEvent: async (eventType: string, eventName: string, properties: any = {}, value?: number) => {
    const response = await apiWrapper.post('/analytics/track', { eventType, eventName, properties, value });
    return response.data;
  },
  
  trackPageView: async (page: string) => {
    const response = await apiWrapper.post('/analytics/page-view', { page });
    return response.data;
  },
  
  trackProductView: async (productId: string) => {
    const response = await apiWrapper.post('/analytics/product-view', { productId });
    return response.data;
  },
  
  trackAddToCart: async (productId: string, quantity: number, value: number) => {
    const response = await apiWrapper.post('/analytics/add-to-cart', { productId, quantity, value });
    return response.data;
  },
  
  trackPurchase: async (orderId: string, value: number, items: any[] = []) => {
    const response = await apiWrapper.post('/analytics/purchase', { orderId, value, items });
    return response.data;
  },
  
  getSummary: async (period: string = 'month') => {
    const response = await apiWrapper.get('/analytics/summary', { params: { period } });
    return response.data;
  },
  
  getRealtimeAnalytics: async () => {
    const response = await apiWrapper.get('/analytics/realtime');
    return response.data;
  }
};

export const funnelService = {
  getFunnels: async () => {
    const response = await apiWrapper.get('/funnels');
    return response.data;
  },
  
  getFunnel: async (id: string) => {
    const response = await apiWrapper.get(`/funnels/${id}`);
    return response.data;
  },
  
  createFunnel: async (funnelData: any) => {
    const response = await apiWrapper.post('/funnels', funnelData);
    return response.data;
  },
  
  updateFunnel: async (id: string, funnelData: any) => {
    const response = await apiWrapper.put(`/funnels/${id}`, funnelData);
    return response.data;
  },
  
  deleteFunnel: async (id: string) => {
    const response = await apiWrapper.delete(`/funnels/${id}`);
    return response.data;
  },
  
  viewFunnelStep: async (slug: string) => {
    const response = await apiWrapper.get(`/funnels/view/${slug}`);
    return response.data;
  },
  
  convertFunnelStep: async (slug: string, action: string = 'convert', value?: number) => {
    const response = await apiWrapper.post(`/funnels/convert/${slug}`, { action, value });
    return response.data;
  },
  
  getFunnelAnalytics: async (id: string) => {
    const response = await apiWrapper.get(`/funnels/analytics/${id}`);
    return response.data;
  },
  
  publishFunnel: async (id: string) => {
    const response = await apiWrapper.put(`/funnels/publish/${id}`);
    return response.data;
  },
  
  pauseFunnel: async (id: string) => {
    const response = await apiWrapper.put(`/funnels/pause/${id}`);
    return response.data;
  },
  
  duplicateFunnel: async (id: string) => {
    const response = await apiWrapper.post(`/funnels/duplicate/${id}`);
    return response.data;
  }
};

export const shippingService = {
  calculateShipping: async (orderId: string, carrier: string = 'colissimo') => {
    const response = await apiWrapper.post('/shipping/calculate', { orderId, carrier });
    return response.data;
  },
  
  getAvailableCarriers: async (orderId: string) => {
    const response = await apiWrapper.get(`/shipping/carriers/${orderId}`);
    return response.data;
  },
  
  createShipment: async (orderId: string, carrier: string, options: any = {}) => {
    const response = await apiWrapper.post('/shipping/create', { orderId, carrier, options });
    return response.data;
  },
  
  trackShipment: async (id: string) => {
    const response = await apiWrapper.get(`/shipping/track/${id}`);
    return response.data;
  },
  
  generateLabel: async (id: string) => {
    const response = await apiWrapper.get(`/shipping/label/${id}`);
    return response.data;
  }
};

export const kycService = {
  getKYCStatus: async () => {
    const response = await apiWrapper.get('/kyc/status');
    return response.data;
  },
  
  uploadDocument: async (type: string, file: File) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('document', file);
    
    const response = await apiWrapper.post('/kyc/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },
  
  submitKYC: async () => {
    const response = await apiWrapper.post('/kyc/submit');
    return response.data;
  },
  
  getKYCRequirements: async () => {
    const response = await apiWrapper.get('/kyc/requirements');
    return response.data;
  }
};

export const socialShareService = {
  getProductShareLinks: async (productId: string) => {
    const response = await apiWrapper.get(`/social-share/product/${productId}`);
    return response.data;
  },
  
  trackShare: async (platform: string, entityType: string, entityId: string, url?: string) => {
    const response = await apiWrapper.post('/social-share/track', { platform, entityType, entityId, url });
    return response.data;
  },
  
  getShareStats: async (entityType: string, entityId: string) => {
    const response = await apiWrapper.get('/social-share/stats', { params: { entityType, entityId } });
    return response.data;
  }
};

export default apiWrapper;