<?php

namespace App\Repository;

use App\Entity\FunnelStep;
use App\Entity\SalesFunnel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FunnelStep>
 *
 * @method FunnelStep|null find($id, $lockMode = null, $lockVersion = null)
 * @method FunnelStep|null findOneBy(array $criteria, array $orderBy = null)
 * @method FunnelStep[]    findAll()
 * @method FunnelStep[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FunnelStepRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FunnelStep::class);
    }

    public function findByFunnel(SalesFunnel $funnel): array
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.funnel = :funnel')
            ->setParameter('funnel', $funnel)
            ->orderBy('fs.sortOrder', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByFunnelAndType(SalesFunnel $funnel, string $type): array
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.funnel = :funnel')
            ->andWhere('fs.type = :type')
            ->setParameter('funnel', $funnel)
            ->setParameter('type', $type)
            ->orderBy('fs.sortOrder', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findBySlug(string $slug): ?FunnelStep
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findFirstStep(SalesFunnel $funnel): ?FunnelStep
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.funnel = :funnel')
            ->setParameter('funnel', $funnel)
            ->orderBy('fs.sortOrder', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findNextStep(FunnelStep $currentStep): ?FunnelStep
    {
        if ($currentStep->getNextStepId()) {
            return $this->find($currentStep->getNextStepId());
        }
        
        return $this->createQueryBuilder('fs')
            ->where('fs.funnel = :funnel')
            ->andWhere('fs.sortOrder > :currentOrder')
            ->setParameter('funnel', $currentStep->getFunnel())
            ->setParameter('currentOrder', $currentStep->getSortOrder())
            ->orderBy('fs.sortOrder', 'ASC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findAlternativeStep(FunnelStep $currentStep): ?FunnelStep
    {
        if ($currentStep->getAlternativeStepId()) {
            return $this->find($currentStep->getAlternativeStepId());
        }
        
        return null;
    }

    public function getStepConversionRates(SalesFunnel $funnel): array
    {
        $steps = $this->findByFunnel($funnel);
        $rates = [];
        
        for ($i = 0; $i < count($steps) - 1; $i++) {
            $currentStep = $steps[$i];
            $nextStep = $steps[$i + 1];
            
            if ($currentStep->getVisitors() > 0) {
                $rate = ($nextStep->getVisitors() / $currentStep->getVisitors()) * 100;
                $rates[$currentStep->getId()] = [
                    'from' => $currentStep->getName(),
                    'to' => $nextStep->getName(),
                    'rate' => round($rate, 2)
                ];
            }
        }
        
        return $rates;
    }

    public function findTopPerformingSteps(int $limit = 10): array
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.visitors > 100') // Ensure statistical significance
            ->andWhere('fs.conversionRate > 0')
            ->orderBy('fs.conversionRate', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findLowPerformingSteps(int $limit = 10): array
    {
        return $this->createQueryBuilder('fs')
            ->where('fs.visitors > 100') // Ensure statistical significance
            ->andWhere('fs.conversionRate > 0')
            ->orderBy('fs.conversionRate', 'ASC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getStepsByType(): array
    {
        $qb = $this->createQueryBuilder('fs')
            ->select('fs.type, COUNT(fs.id) as count, AVG(fs.conversionRate) as avg_rate')
            ->groupBy('fs.type')
            ->orderBy('avg_rate', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $types = [];
        foreach ($result as $row) {
            $types[$row['type']] = [
                'count' => (int)$row['count'],
                'avg_conversion_rate' => round((float)$row['avg_rate'], 2)
            ];
        }
        
        return $types;
    }
}