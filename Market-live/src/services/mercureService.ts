// Mercure Hub URL - Use relative URL to work with Nginx proxy
const MERCURE_HUB_URL = '/.well-known/mercure';

// Store active event sources
const activeEventSources: Record<string, EventSource> = {};

/**
 * Service for Mercure real-time updates
 */
export const mercureService = {
  /**
   * Subscribe to topics
   * @param topics Array of topics to subscribe to
   * @param onMessage Callback function for messages
   * @param onError Callback function for errors
   * @returns Subscription ID
   */
  subscribe: (
    topics: string[],
    onMessage: (data: any, topic: string) => void,
    onError?: (error: Event) => void
  ): string => {
    // Create a unique subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Create URL with topics - ensure it uses the same protocol as the current page
      const url = new URL(MERCURE_HUB_URL, window.location.origin);
      
      // Add topics as query parameters
      topics.forEach(topic => {
        url.searchParams.append('topic', topic);
      });
      
      console.log(`Subscribing to Mercure topics: ${topics.join(', ')} at ${url.toString()}`);
      
      // Create event source with proper configuration
      const eventSource = new EventSource(url.toString());
      
      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Extract topic from data or use default
          const topic = data.topic || topics[0];
          
          // Call message handler
          onMessage(data, topic);
        } catch (error) {
          console.error('Error parsing Mercure message:', error);
        }
      };
      
      // Handle connection open
      eventSource.onopen = () => {
        console.log('Mercure connection established for topics:', topics);
      };
      
      // Handle errors with better error reporting
      eventSource.onerror = (error) => {
        console.warn('Mercure connection error for topics:', topics, error);
        
        // Check if the connection is in a failed state
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('Mercure connection closed, cleaning up subscription:', subscriptionId);
          delete activeEventSources[subscriptionId];
          
          // Try to reconnect after a delay
          setTimeout(() => {
            console.log('Attempting to reconnect to Mercure...');
            mercureService.subscribe(topics, onMessage, onError);
          }, 5000);
        }
        
        if (onError) {
          onError(error);
        }
      };
      
      // Store event source
      activeEventSources[subscriptionId] = eventSource;
      
      return subscriptionId;
    } catch (error) {
      console.error('Error creating Mercure subscription:', error);
      return subscriptionId;
    }
  },
  
  /**
   * Unsubscribe from a subscription
   * @param subscriptionId Subscription ID to unsubscribe from
   */
  unsubscribe: (subscriptionId: string): void => {
    const eventSource = activeEventSources[subscriptionId];
    
    if (eventSource) {
      eventSource.close();
      delete activeEventSources[subscriptionId];
      console.log('Unsubscribed from Mercure subscription:', subscriptionId);
    }
  },
  
  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll: (): void => {
    Object.keys(activeEventSources).forEach(subscriptionId => {
      mercureService.unsubscribe(subscriptionId);
    });
  },
  
  /**
   * Get JWT token for Mercure
   * This would typically be provided by your backend
   */
  getJWT: async (): Promise<string> => {
    // In a real implementation, this would be fetched from your backend
    // For development, return a mock token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZXJjdXJlIjp7InB1Ymxpc2giOlsiKiJdLCJzdWJzY3JpYmUiOlsiKiJdfX0.q4SrfT5h0ZVfZoKpyL-KIjP81_tv_vOB6KqpQA4BGjk';
  }
};

export default mercureService;