<?php

namespace App\Repository;

use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Conversation>
 *
 * @method Conversation|null find($id, $lockMode = null, $lockVersion = null)
 * @method Conversation|null findOneBy(array $criteria, array $orderBy = null)
 * @method Conversation[]    findAll()
 * @method Conversation[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

    public function findByParticipant(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.participants', 'p')
            ->where('p.id = :userId')
            ->andWhere('c.isArchived = :archived')
            ->setParameter('userId', $user->getId())
            ->setParameter('archived', false)
            ->orderBy('c.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByParticipants(User $user1, User $user2): ?Conversation
    {
        return $this->createQueryBuilder('c')
            ->join('c.participants', 'p1')
            ->join('c.participants', 'p2')
            ->where('p1.id = :user1Id')
            ->andWhere('p2.id = :user2Id')
            ->andWhere('c.type = :type')
            ->setParameter('user1Id', $user1->getId())
            ->setParameter('user2Id', $user2->getId())
            ->setParameter('type', 'direct')
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findByConversationId(string $conversationId): ?Conversation
    {
        return $this->createQueryBuilder('c')
            ->where('c.conversationId = :conversationId')
            ->setParameter('conversationId', $conversationId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findArchivedByParticipant(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.participants', 'p')
            ->where('p.id = :userId')
            ->andWhere('c.isArchived = :archived')
            ->setParameter('userId', $user->getId())
            ->setParameter('archived', true)
            ->orderBy('c.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByType(string $type): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.type = :type')
            ->setParameter('type', $type)
            ->orderBy('c.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findWithUnreadMessages(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.participants', 'p')
            ->join('c.messages', 'm')
            ->where('p.id = :userId')
            ->andWhere('m.receiver = :user')
            ->andWhere('m.isRead = :isRead')
            ->andWhere('c.isArchived = :archived')
            ->setParameter('userId', $user->getId())
            ->setParameter('user', $user)
            ->setParameter('isRead', false)
            ->setParameter('archived', false)
            ->groupBy('c.id')
            ->orderBy('c.updatedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function countUnreadConversations(User $user): int
    {
        $result = $this->createQueryBuilder('c')
            ->select('COUNT(DISTINCT c.id) as count')
            ->join('c.participants', 'p')
            ->join('c.messages', 'm')
            ->where('p.id = :userId')
            ->andWhere('m.receiver = :user')
            ->andWhere('m.isRead = :isRead')
            ->andWhere('c.isArchived = :archived')
            ->setParameter('userId', $user->getId())
            ->setParameter('user', $user)
            ->setParameter('isRead', false)
            ->setParameter('archived', false)
            ->getQuery()
            ->getSingleScalarResult();
        
        return (int)$result;
    }

    public function findRecentConversations(User $user, int $limit = 10): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.participants', 'p')
            ->where('p.id = :userId')
            ->andWhere('c.isArchived = :archived')
            ->setParameter('userId', $user->getId())
            ->setParameter('archived', false)
            ->orderBy('c.updatedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findByMetadata(string $key, $value): array
    {
        return $this->createQueryBuilder('c')
            ->where('JSON_EXTRACT(c.metadata, :path) = :value')
            ->setParameter('path', '$.' . $key)
            ->setParameter('value', json_encode($value))
            ->getQuery()
            ->getResult();
    }
}