/**
 * Real-Time WebSocket / STOMP Service
 * Connects directly to Spring Boot backend STOMP broker at /ws-cab
 */
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.listeners = new Map();
  }

  connect() {
    if (this.client && (this.connected || this.client.active)) {
      return;
    }

    const token = localStorage.getItem('vayro_token');
    let brokerURL = import.meta.env.VITE_WS_URL;
    if (!brokerURL) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      brokerURL = `${protocol}//${window.location.host}/ws-cab`;
    }

    this.client = new Client({
      brokerURL,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (msg) => {
        // console.log('[STOMP]', msg);
      },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = (frame) => {
      this.connected = true;
      console.log('✅ Connected to Spring Boot WebSocket STOMP broker');
      this.resubscribeAll();
    };

    this.client.onDisconnect = () => {
      this.connected = false;
      console.log('ℹ️ Disconnected from Spring Boot WebSocket broker');
    };

    this.client.onStompError = (frame) => {
      console.warn('STOMP warning/error:', frame.headers['message']);
    };

    this.client.onWebSocketError = (event) => {
      // Graceful fallback logging
      console.warn('WebSocket connection attempt encountered network event, retrying in background.');
    };

    try {
      this.client.activate();
    } catch (e) {
      console.warn('WebSocket activate warning:', e);
    }
  }

  resubscribeAll() {
    for (const [topic, callbacks] of this.listeners.entries()) {
      if (!this.subscriptions.has(topic) && this.client && this.connected) {
        try {
          const sub = this.client.subscribe(topic, (message) => {
            try {
              const parsed = JSON.parse(message.body);
              const currentCallbacks = this.listeners.get(topic) || [];
              currentCallbacks.forEach((cb) => cb(parsed));
            } catch (e) {
              console.error('Error parsing STOMP message:', e);
            }
          });
          this.subscriptions.set(topic, sub);
        } catch (e) {
          console.warn('Subscription error for topic:', topic, e);
        }
      }
    }
  }

  subscribe(topic, callback) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    this.listeners.get(topic).push(callback);

    if (this.connected && this.client && !this.subscriptions.has(topic)) {
      try {
        const sub = this.client.subscribe(topic, (message) => {
          try {
            const parsed = JSON.parse(message.body);
            const currentCallbacks = this.listeners.get(topic) || [];
            currentCallbacks.forEach((cb) => cb(parsed));
          } catch (e) {
            console.error('Error parsing STOMP message:', e);
          }
        });
        this.subscriptions.set(topic, sub);
      } catch (e) {
        console.warn('Subscription error:', topic, e);
      }
    }

    return () => {
      const callbacks = this.listeners.get(topic) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.listeners.delete(topic);
        const sub = this.subscriptions.get(topic);
        if (sub) {
          try {
            sub.unsubscribe();
          } catch (e) {}
          this.subscriptions.delete(topic);
        }
      }
    };
  }

  send(destination, body) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.subscriptions.clear();
      this.listeners.clear();
    }
  }
}

export const wsService = new WebSocketService();
