<?php

namespace App\Repository;

use App\Entity\Analytics;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Analytics>
 *
 * @method Analytics|null find($id, $lockMode = null, $lockVersion = null)
 * @method Analytics|null findOneBy(array $criteria, array $orderBy = null)
 * @method Analytics[]    findAll()
 * @method Analytics[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AnalyticsRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Analytics::class);
    }

    public function findByEventType(string $eventType, \DateTime $from, \DateTime $to): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.eventType = :eventType')
            ->andWhere('a.createdAt BETWEEN :from AND :to')
            ->setParameter('eventType', $eventType)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('a.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUser(User $user, \DateTime $from, \DateTime $to): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.user = :user')
            ->andWhere('a.createdAt BETWEEN :from AND :to')
            ->setParameter('user', $user)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('a.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findBySession(string $sessionId): array
    {
        return $this->createQueryBuilder('a')
            ->where('a.sessionId = :sessionId')
            ->setParameter('sessionId', $sessionId)
            ->orderBy('a.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function getEventCountByType(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.eventType, COUNT(a.id) as count')
            ->where('a.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('a.eventType')
            ->orderBy('count', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $counts = [];
        foreach ($result as $row) {
            $counts[$row['eventType']] = (int)$row['count'];
        }
        
        return $counts;
    }

    public function getRevenueByDay(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.eventDate, SUM(a.value) as revenue')
            ->where('a.eventType = :eventType')
            ->andWhere('a.eventDate BETWEEN :from AND :to')
            ->setParameter('eventType', 'purchase')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('a.eventDate')
            ->orderBy('a.eventDate', 'ASC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $revenue = [];
        foreach ($result as $row) {
            $revenue[$row['eventDate']->format('Y-m-d')] = (float)$row['revenue'];
        }
        
        return $revenue;
    }

    public function getTopPages(\DateTime $from, \DateTime $to, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('JSON_EXTRACT(a.properties, \'$.page\') as page, COUNT(a.id) as views')
            ->where('a.eventType = :eventType')
            ->andWhere('a.createdAt BETWEEN :from AND :to')
            ->setParameter('eventType', 'page_view')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('page')
            ->orderBy('views', 'DESC')
            ->setMaxResults($limit);

        $result = $qb->getQuery()->getResult();
        
        // Clean up JSON extraction
        $pages = [];
        foreach ($result as $row) {
            $page = trim($row['page'], '"');
            $pages[$page] = (int)$row['views'];
        }
        
        return $pages;
    }

    public function getTopProducts(\DateTime $from, \DateTime $to, int $limit = 10): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('JSON_EXTRACT(a.properties, \'$.product_id\') as product_id, COUNT(a.id) as views')
            ->where('a.eventType = :eventType')
            ->andWhere('a.createdAt BETWEEN :from AND :to')
            ->setParameter('eventType', 'product_view')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('product_id')
            ->orderBy('views', 'DESC')
            ->setMaxResults($limit);

        $result = $qb->getQuery()->getResult();
        
        // Clean up JSON extraction
        $products = [];
        foreach ($result as $row) {
            $productId = (int)trim($row['product_id'], '"');
            $products[$productId] = (int)$row['views'];
        }
        
        return $products;
    }

    public function getTrafficBySource(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.source, COUNT(a.id) as count')
            ->where('a.createdAt BETWEEN :from AND :to')
            ->andWhere('a.source IS NOT NULL')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('a.source')
            ->orderBy('count', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $sources = [];
        foreach ($result as $row) {
            $sources[$row['source']] = (int)$row['count'];
        }
        
        return $sources;
    }

    public function getDeviceBreakdown(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.device, COUNT(a.id) as count')
            ->where('a.createdAt BETWEEN :from AND :to')
            ->andWhere('a.device IS NOT NULL')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('a.device')
            ->orderBy('count', 'DESC');

        $result = $qb->getQuery()->getResult();
        
        // Convert to associative array
        $devices = [];
        foreach ($result as $row) {
            $devices[$row['device']] = (int)$row['count'];
        }
        
        return $devices;
    }

    public function getHourlyDistribution(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('a')
            ->select('a.eventHour, COUNT(a.id) as count')
            ->where('a.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->groupBy('a.eventHour')
            ->orderBy('a.eventHour', 'ASC');

        $result = $qb->getQuery()->getResult();
        
        // Initialize all hours with 0
        $hours = array_fill(0, 24, 0);
        
        // Fill with actual data
        foreach ($result as $row) {
            $hour = (int)$row['eventHour'];
            $hours[$hour] = (int)$row['count'];
        }
        
        return $hours;
    }
}