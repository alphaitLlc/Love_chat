<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ProductController extends AbstractController
{
    #[Route('/admin/products', name: 'app_products')]
    public function index(Request $request): Response
    {
        // Données factices pour la démonstration
        $products = [
            [
                'id' => 1,
                'name' => 'iPhone 13 Pro',
                'sku' => 'IP13P-256GB',
                'category' => 'Smartphones',
                'price' => 1159.99,
                'stock' => 42,
                'status' => 'active',
                'created_at' => '2025-07-15 10:30:00',
            ],
            // Ajoutez plus de produits factices ici
        ];

        return $this->render('product/index.html.twig', [
            'products' => $products,
            'current_menu' => 'products',
        ]);
    }

    #[Route('/admin/products/new', name: 'app_products_new')]
    public function new(): Response
    {
        return $this->render('product/form.html.twig', [
            'current_menu' => 'products',
            'form_title' => 'Ajouter un produit',
        ]);
    }

    #[Route('/admin/products/{id}/edit', name: 'app_products_edit')]
    public function edit(int $id): Response
    {
        // Récupérer le produit depuis la base de données
        $product = [
            'id' => $id,
            'name' => 'iPhone 13 Pro',
            // Autres champs du produit...
        ];

        return $this->render('product/form.html.twig', [
            'product' => $product,
            'current_menu' => 'products',
            'form_title' => 'Modifier le produit',
        ]);
    }

    #[Route('/admin/products/categories', name: 'app_products_categories')]
    public function categories(): Response
    {
        $categories = [
            ['id' => 1, 'name' => 'Smartphones', 'slug' => 'smartphones', 'products_count' => 42],
            ['id' => 2, 'name' => 'Accessoires', 'slug' => 'accessories', 'products_count' => 18],
            // Ajoutez plus de catégories factices ici
        ];

        return $this->render('product/categories.html.twig', [
            'categories' => $categories,
            'current_menu' => 'products',
        ]);
    }

    #[Route('/admin/products/inventory', name: 'app_products_inventory')]
    public function inventory(): Response
    {
        $inventory = [
            'total_products' => 156,
            'out_of_stock' => 8,
            'low_stock' => 15,
            'in_stock' => 133,
            'inventory_value' => 125487.65,
        ];

        return $this->render('product/inventory.html.twig', [
            'inventory' => $inventory,
            'current_menu' => 'products',
        ]);
    }
}
