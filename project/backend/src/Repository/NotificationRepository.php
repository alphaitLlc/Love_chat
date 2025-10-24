<?php

namespace App\Repository;

use App\Entity\Notification;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Notification>
 *
 * @method Notification|null find($id, $lockMode = null, $lockVersion = null)
 * @method Notification|null findOneBy(array $criteria, array $orderBy = null)
 * @method Notification[]    findAll()
 * @method Notification[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class NotificationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    public function findUnreadByUser(User $user): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->andWhere('n.isRead = :read')
            ->andWhere('n.expiresAt IS NULL OR n.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('read', false)
            ->setParameter('now', new \DateTime())
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByUserPaginated(User $user, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->andWhere('n.expiresAt IS NULL OR n.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('now', new \DateTime())
            ->orderBy('n.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countUnreadByUser(User $user): int
    {
        return $this->createQueryBuilder('n')
            ->select('COUNT(n.id)')
            ->where('n.user = :user')
            ->andWhere('n.isRead = :read')
            ->andWhere('n.expiresAt IS NULL OR n.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('read', false)
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function markAllAsReadForUser(User $user): int
    {
        return $this->createQueryBuilder('n')
            ->update()
            ->set('n.isRead', ':read')
            ->set('n.readAt', ':readAt')
            ->where('n.user = :user')
            ->andWhere('n.isRead = :unread')
            ->setParameter('read', true)
            ->setParameter('readAt', new \DateTime())
            ->setParameter('user', $user)
            ->setParameter('unread', false)
            ->getQuery()
            ->execute();
    }

    public function findByType(string $type, int $limit = 100): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.type = :type')
            ->setParameter('type', $type)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findHighPriorityUnread(User $user): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->andWhere('n.isRead = :read')
            ->andWhere('n.priority IN (:priorities)')
            ->andWhere('n.expiresAt IS NULL OR n.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('read', false)
            ->setParameter('priorities', ['high', 'urgent'])
            ->setParameter('now', new \DateTime())
            ->orderBy('n.priority', 'DESC')
            ->addOrderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function deleteExpiredNotifications(): int
    {
        return $this->createQueryBuilder('n')
            ->delete()
            ->where('n.expiresAt IS NOT NULL')
            ->andWhere('n.expiresAt < :now')
            ->setParameter('now', new \DateTime())
            ->getQuery()
            ->execute();
    }

    public function findRecentByUser(User $user, int $days = 7): array
    {
        $since = new \DateTime("-{$days} days");

        return $this->createQueryBuilder('n')
            ->where('n.user = :user')
            ->andWhere('n.createdAt >= :since')
            ->andWhere('n.expiresAt IS NULL OR n.expiresAt > :now')
            ->setParameter('user', $user)
            ->setParameter('since', $since)
            ->setParameter('now', new \DateTime())
            ->orderBy('n.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}