package com.vayro.cabbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable in-memory broker for subscriptions: /topic (broadcast), /queue (user-targeted)
        config.enableSimpleBroker("/topic", "/queue");
        // Application destination prefix for incoming messages handled by @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS fallback
        registry.addEndpoint("/ws-cab")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Plain WebSocket endpoint for non-SockJS clients
        registry.addEndpoint("/ws-cab")
                .setAllowedOriginPatterns("*");
    }
}
