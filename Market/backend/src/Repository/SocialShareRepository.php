<?php

namespace App\Repository;

use App\Entity\SocialShare;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<SocialShare>
 *
 * @method SocialShare|null find($id, $lockMode = null, $lockVersion = null)
 * @method SocialShare|null findOneBy(array $criteria, array $orderBy = null)
 * @method SocialShare[]    findAll()
 * @method SocialShare[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class SocialShareRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, SocialShare::class);
    }

    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.user = :user')
            ->setParameter('user', $user)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByEntityTypeAndId(string $entityType, string $entityId): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.entityType = :entityType')
            ->andWhere('s.entityId = :entityId')
            ->setParameter('entityType', $entityType)
            ->setParameter('entityId', $entityId)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByPlatform(string $platform): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.platform = :platform')
            ->setParameter('platform', $platform)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findMostSharedEntities(int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.entityType, s.entityId, COUNT(s.id) as shareCount')
            ->groupBy('s.entityType, s.entityId')
            ->orderBy('shareCount', 'DESC')
            ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function findMostActiveSharers(int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('IDENTITY(s.user) as userId, COUNT(s.id) as shareCount')
            ->where('s.user IS NOT NULL')
            ->groupBy('s.user')
            ->orderBy('shareCount', 'DESC')
            ->setMaxResults($limit);

        return $qb->getQuery()->getResult();
    }

    public function findByDateRange(\DateTime $from, \DateTime $to): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('s.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function getShareCountsByPlatform(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.platform, COUNT(s.id) as count')
            ->groupBy('s.platform')
            ->orderBy('count', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $counts = [];
        foreach ($result as $row) {
            $counts[$row['platform']] = (int)$row['count'];
        }
        
        return $counts;
    }

    public function getShareCountsByEntityType(): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('s.entityType, COUNT(s.id) as count')
            ->groupBy('s.entityType')
            ->orderBy('count', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $counts = [];
        foreach ($result as $row) {
            $counts[$row['entityType']] = (int)$row['count'];
        }
        
        return $counts;
    }

    public function getShareCountsByDay(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select('DATE(s.createdAt) as date, COUNT(s.id) as count')
            ->where('s.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('date')
            ->orderBy('date', 'ASC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $counts = [];
        foreach ($result as $row) {
            $counts[$row['date']] = (int)$row['count'];
        }
        
        return $counts;
    }

    public function getShareStatistics(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select([
                'COUNT(s.id) as total_shares',
                'COUNT(DISTINCT s.user) as unique_users',
                'COUNT(DISTINCT CONCAT(s.entityType, s.entityId)) as unique_entities',
                'AVG(s.clickCount) as avg_clicks_per_share'
            ])
            ->where('s.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to);

        return $qb->getQuery()->getSingleResult();
    }
}