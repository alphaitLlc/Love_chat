<?php

namespace App\Repository;

use App\Entity\LiveStream;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LiveStream>
 *
 * @method LiveStream|null find($id, $lockMode = null, $lockVersion = null)
 * @method LiveStream|null findOneBy(array $criteria, array $orderBy = null)
 * @method LiveStream[]    findAll()
 * @method LiveStream[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class LiveStreamRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LiveStream::class);
    }

    public function findPublicLiveStreams(): array
    {
        return $this->createQueryBuilder('ls')
            ->where('ls.isPublic = :public')
            ->andWhere('ls.status IN (:statuses)')
            ->setParameter('public', true)
            ->setParameter('statuses', ['live', 'scheduled'])
            ->orderBy('ls.status', 'DESC')
            ->addOrderBy('ls.scheduledAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findLiveStreams(): array
    {
        return $this->createQueryBuilder('ls')
            ->where('ls.status = :status')
            ->setParameter('status', 'live')
            ->orderBy('ls.viewerCount', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findScheduledStreams(): array
    {
        return $this->createQueryBuilder('ls')
            ->where('ls.status = :status')
            ->andWhere('ls.scheduledAt > :now')
            ->setParameter('status', 'scheduled')
            ->setParameter('now', new \DateTime())
            ->orderBy('ls.scheduledAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByStreamer($streamer): array
    {
        return $this->createQueryBuilder('ls')
            ->where('ls.streamer = :streamer')
            ->setParameter('streamer', $streamer)
            ->orderBy('ls.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findPopularStreams(int $limit = 10): array
    {
        return $this->createQueryBuilder('ls')
            ->where('ls.status = :status')
            ->setParameter('status', 'live')
            ->orderBy('ls.viewerCount', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findStreamsByCategory(string $category): array
    {
        return $this->createQueryBuilder('ls')
            ->join('ls.products', 'p')
            ->join('p.category', 'c')
            ->where('c.name = :category')
            ->andWhere('ls.status IN (:statuses)')
            ->setParameter('category', $category)
            ->setParameter('statuses', ['live', 'scheduled'])
            ->orderBy('ls.status', 'DESC')
            ->addOrderBy('ls.viewerCount', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getStreamAnalytics(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('ls')
            ->select([
                'COUNT(ls.id) as total_streams',
                'SUM(ls.totalViews) as total_views',
                'AVG(ls.maxViewers) as avg_max_viewers',
                'SUM(ls.revenue) as total_revenue',
                'SUM(ls.ordersCount) as total_orders'
            ])
            ->where('ls.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to);

        return $qb->getQuery()->getSingleResult();
    }
}