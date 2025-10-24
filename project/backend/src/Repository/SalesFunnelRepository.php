<?php

namespace App\Repository;

use App\Entity\SalesFunnel;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<SalesFunnel>
 *
 * @method SalesFunnel|null find($id, $lockMode = null, $lockVersion = null)
 * @method SalesFunnel|null findOneBy(array $criteria, array $orderBy = null)
 * @method SalesFunnel[]    findAll()
 * @method SalesFunnel[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SalesFunnelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SalesFunnel::class);
    }

    public function findByOwner(User $owner): array
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.owner = :owner')
            ->setParameter('owner', $owner)
            ->orderBy('sf.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveFunnels(): array
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.status = :status')
            ->setParameter('status', 'active')
            ->orderBy('sf.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findBySlug(string $slug): ?SalesFunnel
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findTopPerformingFunnels(int $limit = 10): array
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.status = :status')
            ->andWhere('sf.totalVisitors > 0')
            ->setParameter('status', 'active')
            ->orderBy('sf.conversionRate', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findRecentlyUpdated(int $limit = 10): array
    {
        return $this->createQueryBuilder('sf')
            ->orderBy('sf.updatedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByTargetAudience(string $audience): array
    {
        return $this->createQueryBuilder('sf')
            ->where('JSON_CONTAINS(sf.targetAudience, :audience) = 1')
            ->setParameter('audience', json_encode($audience))
            ->orderBy('sf.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getFunnelStatistics(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('sf')
            ->select([
                'COUNT(sf.id) as total_funnels',
                'COUNT(CASE WHEN sf.status = \'active\' THEN 1 END) as active_funnels',
                'SUM(sf.totalVisitors) as total_visitors',
                'SUM(sf.totalConversions) as total_conversions',
                'SUM(sf.totalRevenue) as total_revenue',
                'AVG(sf.conversionRate) as avg_conversion_rate'
            ])
            ->where('sf.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to);

        return $qb->getQuery()->getSingleResult();
    }

    public function findWithHighConversionRate(float $minRate = 5.0): array
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.conversionRate >= :minRate')
            ->andWhere('sf.totalVisitors > 100') // Ensure statistical significance
            ->setParameter('minRate', $minRate)
            ->orderBy('sf.conversionRate', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findWithLowConversionRate(float $maxRate = 1.0): array
    {
        return $this->createQueryBuilder('sf')
            ->where('sf.conversionRate <= :maxRate')
            ->andWhere('sf.totalVisitors > 100') // Ensure statistical significance
            ->setParameter('maxRate', $maxRate)
            ->orderBy('sf.conversionRate', 'ASC')
            ->getQuery()
            ->getResult();
    }
}