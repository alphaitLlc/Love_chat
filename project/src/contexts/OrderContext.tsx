import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Product } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { orderService, paymentService } from '../services/api';

interface OrderContextType {
  orders: Order[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrdersByUser: (userId: string) => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  isLoading: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  addedAt: string;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    // Fetch orders if user is logged in
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchOrders = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await orderService.getOrders();
      if (response && response['hydra:member']) {
        setOrders(response['hydra:member']);
      } else {
        // Mock data if API doesn't return expected format
        setOrders([
          {
            id: '1',
            orderNumber: 'ORD-2024-001',
            productId: '1',
            productTitle: 'Smartphone Galaxy Pro Max',
            productImage: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
            buyerId: user.id,
            buyerName: `${user.firstName} ${user.lastName}`,
            sellerId: '2',
            sellerName: 'Marie Fournisseur',
            quantity: 1,
            unitPrice: 899.99,
            totalAmount: 899.99,
            commission: 45.00,
            status: 'confirmed',
            paymentStatus: 'paid',
            paymentMethod: 'Carte bancaire',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            shippingAddress: {
              firstName: user.firstName,
              lastName: user.lastName,
              street: '123 Rue de Paris',
              city: 'Paris',
              state: 'Île-de-France',
              zipCode: '75001',
              country: 'France'
            },
            estimatedDelivery: new Date(Date.now() + 432000000).toISOString(),
            timeline: [
              {
                status: 'pending',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                description: 'Commande créée'
              },
              {
                status: 'confirmed',
                timestamp: new Date(Date.now() - 82800000).toISOString(),
                description: 'Commande confirmée'
              }
            ]
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Set mock data on error
      setOrders([
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          productId: '1',
          productTitle: 'Smartphone Galaxy Pro Max',
          productImage: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
          buyerId: user.id,
          buyerName: `${user.firstName} ${user.lastName}`,
          sellerId: '2',
          sellerName: 'Marie Fournisseur',
          quantity: 1,
          unitPrice: 899.99,
          totalAmount: 899.99,
          commission: 45.00,
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentMethod: 'Carte bancaire',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          shippingAddress: {
            firstName: user.firstName,
            lastName: user.lastName,
            street: '123 Rue de Paris',
            city: 'Paris',
            state: 'Île-de-France',
            zipCode: '75001',
            country: 'France'
          },
          estimatedDelivery: new Date(Date.now() + 432000000).toISOString(),
          timeline: [
            {
              status: 'pending',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              description: 'Commande créée'
            },
            {
              status: 'confirmed',
              timestamp: new Date(Date.now() - 82800000).toISOString(),
              description: 'Commande confirmée'
            }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
          return prevCart;
        }
        
        toast.success(`Quantité mise à jour dans le panier`);
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          toast.error(`Stock insuffisant. Maximum disponible: ${product.stock}`);
          return prevCart;
        }
        
        toast.success(`${product.title} ajouté au panier`);
        return [...prevCart, {
          product,
          quantity,
          addedAt: new Date().toISOString()
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.product.id === productId);
      if (item) {
        toast.success(`${item.product.title} retiré du panier`);
      }
      return prevCart.filter(item => item.product.id !== productId);
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          if (quantity > item.product.stock) {
            toast.error(`Stock insuffisant. Maximum disponible: ${item.product.stock}`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Panier vidé');
  };

  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    setIsLoading(true);
    
    try {
      // Create payment intent first
      const paymentIntent = await paymentService.createPaymentIntent({
        items: orderData.items || cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'stripe',
        currency: orderData.currency || 'EUR'
      });
      
      // Create order with payment intent ID
      const orderResponse = await orderService.createOrder({
        ...orderData,
        paymentIntentId: paymentIntent.paymentIntentId
      });
      
      // Add order to state
      const newOrder = orderResponse;
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      toast.success('Commande créée avec succès !');
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erreur lors de la création de la commande');
      
      // Create a mock order for development
      const mockOrder = {
        id: Date.now().toString(),
        orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        productId: orderData.productId || '1',
        productTitle: orderData.productTitle || 'Smartphone Galaxy Pro Max',
        productImage: orderData.productImage || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
        buyerId: user.id,
        buyerName: `${user.firstName} ${user.lastName}`,
        sellerId: orderData.sellerId || '2',
        sellerName: orderData.sellerName || 'Marie Fournisseur',
        quantity: orderData.quantity || 1,
        unitPrice: orderData.unitPrice || 899.99,
        totalAmount: orderData.totalAmount || 899.99,
        commission: orderData.commission || 45.00,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod || 'Carte bancaire',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: orderData.shippingAddress || {
          firstName: user.firstName,
          lastName: user.lastName,
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'France'
        },
        timeline: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            description: 'Commande créée'
          }
        ]
      } as Order;
      
      setOrders(prevOrders => [...prevOrders, mockOrder]);
      return mockOrder;
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setIsLoading(true);
    
    try {
      await orderService.updateOrderStatus(orderId, status);
      
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...order.timeline,
                {
                  status,
                  timestamp: new Date().toISOString(),
                  description: getStatusDescription(status)
                }
              ]
            };
          }
          return order;
        })
      );
      
      toast.success('Statut de commande mis à jour');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erreur lors de la mise à jour');
      
      // Update state anyway for development
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...order.timeline,
                {
                  status,
                  timestamp: new Date().toISOString(),
                  description: getStatusDescription(status)
                }
              ]
            };
          }
          return order;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getOrdersByUser = (userId: string): Order[] => {
    return orders.filter(order => 
      order.buyerId === userId || order.sellerId === userId
    );
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const getStatusDescription = (status: Order['status']): string => {
    const descriptions = {
      pending: 'Commande en attente',
      confirmed: 'Commande confirmée',
      processing: 'Préparation en cours',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return descriptions[status] || status;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      createOrder,
      updateOrderStatus,
      getOrdersByUser,
      getOrderById,
      isLoading
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}