<?php

namespace App\Repository;

use App\Entity\PaymentMethod;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PaymentMethod>
 *
 * @method PaymentMethod|null find($id, $lockMode = null, $lockVersion = null)
 * @method PaymentMethod|null findOneBy(array $criteria, array $orderBy = null)
 * @method PaymentMethod[]    findAll()
 * @method PaymentMethod[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PaymentMethodRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PaymentMethod::class);
    }

    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('pm')
            ->where('pm.user = :user')
            ->andWhere('pm.isActive = :active')
            ->setParameter('user', $user)
            ->setParameter('active', true)
            ->orderBy('pm.isDefault', 'DESC')
            ->addOrderBy('pm.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findDefaultForUser(User $user): ?PaymentMethod
    {
        return $this->createQueryBuilder('pm')
            ->where('pm.user = :user')
            ->andWhere('pm.isActive = :active')
            ->andWhere('pm.isDefault = :default')
            ->setParameter('user', $user)
            ->setParameter('active', true)
            ->setParameter('default', true)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByExternalId(string $externalId): ?PaymentMethod
    {
        return $this->createQueryBuilder('pm')
            ->where('pm.externalId = :externalId')
            ->setParameter('externalId', $externalId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByType(User $user, string $type): array
    {
        return $this->createQueryBuilder('pm')
            ->where('pm.user = :user')
            ->andWhere('pm.type = :type')
            ->andWhere('pm.isActive = :active')
            ->setParameter('user', $user)
            ->setParameter('type', $type)
            ->setParameter('active', true)
            ->orderBy('pm.isDefault', 'DESC')
            ->addOrderBy('pm.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findExpiredCards(): array
    {
        $now = new \DateTime();
        $year = (int)$now->format('Y');
        $month = (int)$now->format('m');

        return $this->createQueryBuilder('pm')
            ->where('pm.type = :type')
            ->andWhere('pm.isActive = :active')
            ->andWhere('(pm.expiryYear < :year) OR (pm.expiryYear = :year AND pm.expiryMonth < :month)')
            ->setParameter('type', 'card')
            ->setParameter('active', true)
            ->setParameter('year', $year)
            ->setParameter('month', $month)
            ->getQuery()
            ->getResult();
    }

    public function findExpiringCards(int $monthsAhead = 1): array
    {
        $now = new \DateTime();
        $expiryDate = clone $now;
        $expiryDate->modify("+{$monthsAhead} month");
        
        $expiryYear = (int)$expiryDate->format('Y');
        $expiryMonth = (int)$expiryDate->format('m');
        
        $currentYear = (int)$now->format('Y');
        $currentMonth = (int)$now->format('m');

        return $this->createQueryBuilder('pm')
            ->where('pm.type = :type')
            ->andWhere('pm.isActive = :active')
            ->andWhere('(pm.expiryYear = :expiryYear AND pm.expiryMonth = :expiryMonth)')
            ->andWhere('(pm.expiryYear > :currentYear) OR (pm.expiryYear = :currentYear AND pm.expiryMonth >= :currentMonth)')
            ->setParameter('type', 'card')
            ->setParameter('active', true)
            ->setParameter('expiryYear', $expiryYear)
            ->setParameter('expiryMonth', $expiryMonth)
            ->setParameter('currentYear', $currentYear)
            ->setParameter('currentMonth', $currentMonth)
            ->getQuery()
            ->getResult();
    }

    public function countByProvider(string $provider): int
    {
        return $this->createQueryBuilder('pm')
            ->select('COUNT(pm.id)')
            ->where('pm.provider = :provider')
            ->setParameter('provider', $provider)
            ->getQuery()
            ->getSingleScalarResult();
    }
}