<?php
/**
 * Plugin Name: Assina Abandoned Cart Tracker
 * Description: Captura carrinhos abandonados no WooCommerce e envia para API externa.
 * Version: 1.0
 * Author: Assina Club
 */

if (!defined('ABSPATH')) {
    exit; // Impede acesso direto
}

// Hook no AJAX do WooCommerce (inclusive para usuários não logados)
add_action('woocommerce_add_to_cart', 'assina_capture_cart', 10, 6);
add_action('woocommerce_cart_updated', 'assina_capture_cart');

function assina_capture_cart() {
    if (WC()->cart->is_empty()) return;

    $cart = WC()->cart->get_cart();
    $items = [];

    foreach ($cart as $item_key => $item) {
        $product = $item['data'];
        $items[] = [
            'product_id' => $product->get_id(),
            'product_name' => $product->get_name(),
            'quantity' => $item['quantity'],
            'price' => $product->get_price()
        ];
    }

    $data = [
        'email' => is_user_logged_in() ? wp_get_current_user()->user_email : 'guest@site.com',
        'timestamp' => time(),
        'cart_items' => $items,
    ];

    // Envia os dados para sua API
    $endpoint = 'https://carrinho-api.onrender.com/api/carrinho'; // <-- Atualize aqui depois
    wp_remote_post($endpoint, [
        'method' => 'POST',
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode($data),
        'timeout' => 10
    ]);
}
