<?php

namespace App\Service;


use ApiPlatform\OpenApi\OpenApi;
use ApiPlatform\OpenApi\Factory\OpenApiFactoryInterface;
use ApiPlatform\OpenApi\Model\Server;

class OpenApiFactory implements OpenApiFactoryInterface
{
    public function __construct(
        private OpenApiFactoryInterface $decorated
    ) {}

    public function __invoke(array $context = []): OpenApi
    {
        $openApi = ($this->decorated)($context);

        // Ajout des serveurs personnalisés
        $openApi = $openApi->withServers([
            new Server('https://api.linkmarket.com', 'Production server'),
            new Server('https://staging-api.linkmarket.com', 'Staging server'),
            new Server('http://localhost:8000', 'Development server'),
        ]);

        return $openApi;
    }

}