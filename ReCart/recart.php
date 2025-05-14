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

    $email = 'guest@site.com';

    if (is_user_logged_in()) {
        $email = wp_get_current_user()->user_email;
    } elseif (!empty($_COOKIE['assina_checkout_email']) && is_email($_COOKIE['assina_checkout_email'])) {
        $email = sanitize_email($_COOKIE['assina_checkout_email']);
    }

    $data = [
        'email' => $email,
        'timestamp' => time(),
        'cart_items' => $items,
        'site_url' => get_site_url(),
    ];

    // Envia os dados para sua API
    $endpoint = 'https://carrinho-api.onrender.com/api/carrinho';
    wp_remote_post($endpoint, [
        'method' => 'POST',
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode($data),
        'timeout' => 10
    ]);
}

// Injetar script no checkout para capturar e-mail de visitantes
add_action('wp_footer', 'assina_injetar_script_checkout');
function assina_injetar_script_checkout() {
    if (!is_checkout()) return;
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function () {
        const emailInput = document.querySelector('#billing_email');
        if (emailInput) {
            emailInput.addEventListener('input', function () {
                const email = emailInput.value.trim();
                localStorage.setItem('assina_checkout_email', email);
                document.cookie = "assina_checkout_email=" + encodeURIComponent(email) + "; path=/";
            });
        }
    });
    </script>
    <?php
}
