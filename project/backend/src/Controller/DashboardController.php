<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    #[Route('/admin/dashboard', name: 'app_dashboard')]
    public function index(): Response
    {
        // Données factices pour la démonstration
        // Dans une application réelle, ces données viendraient de votre base de données
        $totalSales = 12549.99;
        $pendingOrders = 8;
        $newCustomers = 24;
        $lowStockProducts = 15;
        $criticalStock = 5;

        // Activités récentes
        $recentActivities = [
            [
                'user' => 'John Doe',
                'action' => 'a créé une nouvelle commande',
                'target' => '#4587',
                'time' => 'Il y a 5 minutes',
                'icon' => 'fas fa-shopping-cart',
                'bg_color' => 'bg-blue-500',
                'link' => '#'
            ],
            [
                'user' => 'Jane Smith',
                'action' => 'a mis à jour le produit',
                'target' => 'iPhone 13 Pro',
                'time' => 'Il y a 1 heure',
                'icon' => 'fas fa-box',
                'bg_color' => 'bg-green-500',
                'link' => '#'
            ],
            [
                'user' => 'Admin',
                'action' => 'a ajouté une nouvelle catégorie',
                'target' => 'Accessoires',
                'time' => 'Il y a 3 heures',
                'icon' => 'fas fa-tag',
                'bg_color' => 'bg-purple-500',
                'link' => '#'
            ],
            [
                'user' => 'System',
                'action' => 'Sauvegarde automatique effectuée',
                'target' => '',
                'time' => 'Aujourd\'hui, 02:30',
                'icon' => 'fas fa-save',
                'bg_color' => 'bg-yellow-500',
                'link' => ''
            ],
        ];

        // Dernières commandes
        $recentOrders = [
            [
                'id' => '#4587',
                'customer' => 'John Doe',
                'date' => '2025-07-20 14:30',
                'total' => 1299.99,
                'status' => 'en_attente',
                'status_label' => 'En attente',
                'status_class' => 'bg-yellow-100 text-yellow-800'
            ],
            [
                'id' => '#4586',
                'customer' => 'Jane Smith',
                'date' => '2025-07-20 13:15',
                'total' => 799.99,
                'status' => 'en_cours',
                'status_label' => 'En cours',
                'status_class' => 'bg-blue-100 text-blue-800'
            ],
            [
                'id' => '#4585',
                'customer' => 'Robert Johnson',
                'date' => '2025-07-19 16:45',
                'total' => 459.50,
                'status' => 'expedie',
                'status_label' => 'Expédié',
                'status_class' => 'bg-green-100 text-green-800'
            ],
            [
                'id' => '#4584',
                'customer' => 'Emily Davis',
                'date' => '2025-07-18 11:20',
                'total' => 129.99,
                'status' => 'livre',
                'status_label' => 'Livré',
                'status_class' => 'bg-gray-100 text-gray-800'
            ],
            [
                'id' => '#4583',
                'customer' => 'Michael Brown',
                'date' => '2025-07-17 09:10',
                'total' => 89.99,
                'status' => 'annule',
                'status_label' => 'Annulé',
                'status_class' => 'bg-red-100 text-red-800'
            ],
        ];

        return $this->render('dashboard/dashboard.html.twig', [
            'total_sales' => $totalSales,
            'pending_orders' => $pendingOrders,
            'new_customers' => $newCustomers,
            'low_stock_products' => $lowStockProducts,
            'critical_stock' => $criticalStock,
            'recent_activities' => $recentActivities,
            'recent_orders' => $recentOrders,
        ]);
    }
}
