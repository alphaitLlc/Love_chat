<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CustomerController extends AbstractController
{
    #[Route('/admin/customers', name: 'app_customers')]
    public function index(): Response
    {
        // Données factices pour la démonstration
        $customers = [
            [
                'id' => 1,
                'name' => 'John Doe',
                'email' => 'john.doe@example.com',
                'phone' => '+33 6 12 34 56 78',
                'orders_count' => 5,
                'total_spent' => 2547.85,
                'last_order' => '2025-07-15 14:30',
                'status' => 'active',
                'status_label' => 'Actif',
                'status_class' => 'bg-green-100 text-green-800',
            ],
            // Ajoutez plus de clients factices ici
        ];

        return $this->render('customer/index.html.twig', [
            'customers' => $customers,
            'current_menu' => 'customers',
        ]);
    }

    #[Route('/admin/customers/{id}', name: 'app_customers_view')]
    public function view(int $id): Response
    {
        // Récupérer le client depuis la base de données
        $customer = [
            'id' => $id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+33 6 12 34 56 78',
            'company' => 'Acme Inc.',
            'registration_date' => '2024-01-15 10:30:00',
            'status' => 'active',
            'status_label' => 'Actif',
            'status_class' => 'bg-green-100 text-green-800',
            'addresses' => [
                [
                    'type' => 'shipping',
                    'name' => 'John Doe',
                    'company' => 'Acme Inc.',
                    'address' => '123 Rue de la Paix',
                    'address2' => 'Appt 4B',
                    'city' => 'Paris',
                    'postal_code' => '75001',
                    'country' => 'France',
                    'phone' => '+33 6 12 34 56 78',
                    'is_default' => true,
                ],
                // Ajoutez d'autres adresses si nécessaire
            ],
            'stats' => [
                'total_orders' => 5,
                'total_spent' => 2547.85,
                'avg_order_value' => 509.57,
                'last_order' => '2025-07-15 14:30',
            ],
            'recent_orders' => [
                // Dernières commandes du client
            ],
        ];

        return $this->render('customer/view.html.twig', [
            'customer' => $customer,
            'current_menu' => 'customers',
        ]);
    }

    #[Route('/admin/customers/new', name: 'app_customers_new')]
    public function new(): Response
    {
        return $this->render('customer/form.html.twig', [
            'current_menu' => 'customers',
            'form_title' => 'Ajouter un client',
        ]);
    }

    #[Route('/admin/customers/{id}/edit', name: 'app_customers_edit')]
    public function edit(int $id): Response
    {
        // Récupérer le client depuis la base de données
        $customer = [
            'id' => $id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            // Autres champs du client...
        ];

        return $this->render('customer/form.html.twig', [
            'customer' => $customer,
            'current_menu' => 'customers',
            'form_title' => 'Modifier le client',
        ]);
    }

    #[Route('/admin/customers/groups', name: 'app_customers_groups')]
    public function groups(): Response
    {
        $groups = [
            ['id' => 1, 'name' => 'Fidèles', 'customers_count' => 42],
            ['id' => 2, 'name' => 'VIP', 'customers_count' => 15],
            // Ajoutez plus de groupes factices ici
        ];

        return $this->render('customer/groups.html.twig', [
            'groups' => $groups,
            'current_menu' => 'customers',
        ]);
    }
}
