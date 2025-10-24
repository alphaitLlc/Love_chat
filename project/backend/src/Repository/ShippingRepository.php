<?php

namespace App\Repository;

use App\Entity\Shipping;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Shipping>
 *
 * @method Shipping|null find($id, $lockMode = null, $lockVersion = null)
 * @method Shipping|null findOneBy(array $criteria, array $orderBy = null)
 * @method Shipping[]    findAll()
 * @method Shipping[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShippingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Shipping::class);
    }

    public function findByTrackingNumber(string $trackingNumber): ?Shipping
    {
        return $this->createQueryBuilder('s')
            ->where('s.trackingNumber = :trackingNumber')
            ->setParameter('trackingNumber', $trackingNumber)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findPendingShipments(): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.status = :status')
            ->setParameter('status', 'pending')
            ->orderBy('s.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findInTransitShipments(): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.status IN (:statuses)')
            ->setParameter('statuses', ['picked_up', 'in_transit', 'out_for_delivery'])
            ->orderBy('s.estimatedDelivery', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findDelayedShipments(): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.estimatedDelivery < :now')
            ->andWhere('s.status NOT IN (:completedStatuses)')
            ->setParameter('now', new \DateTime())
            ->setParameter('completedStatuses', ['delivered', 'failed', 'returned'])
            ->orderBy('s.estimatedDelivery', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByCarrier(string $carrier): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.carrier = :carrier')
            ->setParameter('carrier', $carrier)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByDateRange(\DateTime $from, \DateTime $to): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function getShippingStatistics(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('s')
            ->select([
                'COUNT(s.id) as total_shipments',
                'COUNT(CASE WHEN s.status = \'delivered\' THEN 1 END) as delivered_count',
                'COUNT(CASE WHEN s.status = \'failed\' THEN 1 END) as failed_count',
                'AVG(CASE WHEN s.deliveredAt IS NOT NULL AND s.shippedAt IS NOT NULL THEN TIMESTAMPDIFF(DAY, s.shippedAt, s.deliveredAt) END) as avg_delivery_days',
                'SUM(s.cost) as total_shipping_cost'
            ])
            ->where('s.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to);

        return $qb->getQuery()->getSingleResult();
    }

    public function findByDestinationCountry(string $country): array
    {
        return $this->createQueryBuilder('s')
            ->where('JSON_EXTRACT(s.toAddress, \'$.country\') = :country')
            ->setParameter('country', $country)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findBySellerAndStatus(int $sellerId, string $status): array
    {
        return $this->createQueryBuilder('s')
            ->join('s.order', 'o')
            ->where('o.seller = :sellerId')
            ->andWhere('s.status = :status')
            ->setParameter('sellerId', $sellerId)
            ->setParameter('status', $status)
            ->orderBy('s.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}