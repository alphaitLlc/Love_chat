<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private ValidatorInterface $validator
    ) {}

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validate required fields
        $requiredFields = ['email', 'password', 'firstName', 'lastName', 'role'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return new JsonResponse(['error' => "Le champ '$field' est requis"], 400);
            }
        }

        // Check if user already exists
        $existingUser = $this->entityManager->getRepository(User::class)
            ->findOneBy(['email' => $data['email']]);

        if ($existingUser) {
            return new JsonResponse(['error' => 'Cette adresse email est déjà utilisée'], 400);
        }

        // Create new user
        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstName($data['firstName']);
        $user->setLastName($data['lastName']);
        $user->setRole($data['role']);
        
        if (isset($data['company'])) {
            $user->setCompany($data['company']);
        }
        
        if (isset($data['phone'])) {
            $user->setPhone($data['phone']);
        }

        // Hash password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // Validate user
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        // Save user
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Generate JWT token
        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'role' => $user->getRole(),
                'company' => $user->getCompany(),
                'phone' => $user->getPhone(),
                'isVerified' => $user->isVerified(),
                'subscription' => $user->getSubscription(),
                'joinedAt' => $user->getJoinedAt()->format('Y-m-d H:i:s')
            ],
            'token' => $token
        ], 201);
    }

    #[Route('/login_check', name: 'api_login_check', methods: ['POST'])]
    public function loginCheck(): JsonResponse
    {
        // This method is handled by the JWT authentication bundle
        // It's here for route definition purposes
        return new JsonResponse(['message' => 'Login endpoint']);
    }

    #[Route('/profile', name: 'api_profile', methods: ['GET'])]
    public function profile(): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        return new JsonResponse([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'role' => $user->getRole(),
                'company' => $user->getCompany(),
                'phone' => $user->getPhone(),
                'rating' => $user->getRating(),
                'reviewCount' => $user->getReviewCount(),
                'isVerified' => $user->isVerified(),
                'badges' => $user->getBadges(),
                'subscription' => $user->getSubscription(),
                'joinedAt' => $user->getJoinedAt()->format('Y-m-d H:i:s'),
                'lastLoginAt' => $user->getLastLoginAt()?->format('Y-m-d H:i:s'),
                'preferences' => $user->getPreferences(),
                'address' => $user->getAddress()
            ]
        ]);
    }

    #[Route('/profile', name: 'api_profile_update', methods: ['PUT'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // Update allowed fields
        $allowedFields = ['firstName', 'lastName', 'company', 'phone', 'bio', 'address', 'preferences', 'socialLinks'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                if (method_exists($user, $setter)) {
                    $user->$setter($data[$field]);
                }
            }
        }

        // Validate user
        $errors = $this->validator->validate($user);
        if (count($errors) > 0) {
            $errorMessages = [];
            foreach ($errors as $error) {
                $errorMessages[] = $error->getMessage();
            }
            return new JsonResponse(['errors' => $errorMessages], 400);
        }

        $this->entityManager->flush();

        return new JsonResponse([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'role' => $user->getRole(),
                'company' => $user->getCompany(),
                'phone' => $user->getPhone(),
                'bio' => $user->getBio(),
                'address' => $user->getAddress(),
                'preferences' => $user->getPreferences(),
                'socialLinks' => $user->getSocialLinks()
            ]
        ]);
    }

    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['currentPassword']) || !isset($data['newPassword'])) {
            return new JsonResponse(['error' => 'Mot de passe actuel et nouveau mot de passe requis'], 400);
        }

        // Verify current password
        if (!$this->passwordHasher->isPasswordValid($user, $data['currentPassword'])) {
            return new JsonResponse(['error' => 'Mot de passe actuel incorrect'], 400);
        }

        // Hash new password
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data['newPassword']);
        $user->setPassword($hashedPassword);

        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Mot de passe modifié avec succès']);
    }
}