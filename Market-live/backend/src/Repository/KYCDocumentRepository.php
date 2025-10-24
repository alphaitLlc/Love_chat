<?php

namespace App\Repository;

use App\Entity\KYCDocument;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<KYCDocument>
 *
 * @method KYCDocument|null find($id, $lockMode = null, $lockVersion = null)
 * @method KYCDocument|null findOneBy(array $criteria, array $orderBy = null)
 * @method KYCDocument[]    findAll()
 * @method KYCDocument[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class KYCDocumentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, KYCDocument::class);
    }

    public function findByUser(User $user): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.user = :user')
            ->setParameter('user', $user)
            ->orderBy('d.uploadedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findPendingDocuments(): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.status = :status')
            ->setParameter('status', 'pending')
            ->orderBy('d.uploadedAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserAndType(User $user, string $type): ?KYCDocument
    {
        return $this->createQueryBuilder('d')
            ->where('d.user = :user')
            ->andWhere('d.type = :type')
            ->setParameter('user', $user)
            ->setParameter('type', $type)
            ->orderBy('d.uploadedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findExpiringDocuments(int $daysThreshold = 30): array
    {
        $threshold = new \DateTime("+{$daysThreshold} days");
        
        return $this->createQueryBuilder('d')
            ->where('d.status = :status')
            ->andWhere('d.expiresAt IS NOT NULL')
            ->andWhere('d.expiresAt <= :threshold')
            ->andWhere('d.expiresAt > :now')
            ->setParameter('status', 'approved')
            ->setParameter('threshold', $threshold)
            ->setParameter('now', new \DateTime())
            ->orderBy('d.expiresAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findExpiredDocuments(): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.status = :status')
            ->andWhere('d.expiresAt IS NOT NULL')
            ->andWhere('d.expiresAt <= :now')
            ->setParameter('status', 'approved')
            ->setParameter('now', new \DateTime())
            ->orderBy('d.expiresAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countByStatus(string $status): int
    {
        return $this->createQueryBuilder('d')
            ->select('COUNT(d.id)')
            ->where('d.status = :status')
            ->setParameter('status', $status)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function getAverageVerificationTime(): float
    {
        $result = $this->createQueryBuilder('d')
            ->select('AVG(TIMESTAMPDIFF(HOUR, d.uploadedAt, d.verifiedAt)) as avg_time')
            ->where('d.status IN (:statuses)')
            ->andWhere('d.verifiedAt IS NOT NULL')
            ->setParameter('statuses', ['approved', 'rejected'])
            ->getQuery()
            ->getSingleScalarResult();
        
        return $result ? (float)$result : 0;
    }

    public function findRecentlyVerified(int $limit = 10): array
    {
        return $this->createQueryBuilder('d')
            ->where('d.status IN (:statuses)')
            ->andWhere('d.verifiedAt IS NOT NULL')
            ->setParameter('statuses', ['approved', 'rejected'])
            ->orderBy('d.verifiedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}