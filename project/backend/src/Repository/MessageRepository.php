<?php

namespace App\Repository;

use App\Entity\Conversation;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Message>
 *
 * @method Message|null find($id, $lockMode = null, $lockVersion = null)
 * @method Message|null findOneBy(array $criteria, array $orderBy = null)
 * @method Message[]    findAll()
 * @method Message[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Message::class);
    }

    public function findByConversation(Conversation $conversation): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.conversation = :conversation')
            ->setParameter('conversation', $conversation)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByConversationPaginated(Conversation $conversation, int $page = 1, int $limit = 20): array
    {
        $offset = ($page - 1) * $limit;

        return $this->createQueryBuilder('m')
            ->where('m.conversation = :conversation')
            ->setParameter('conversation', $conversation)
            ->orderBy('m.createdAt', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findUnreadByConversationAndReceiver(Conversation $conversation, User $receiver): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.conversation = :conversation')
            ->andWhere('m.receiver = :receiver')
            ->andWhere('m.isRead = :isRead')
            ->setParameter('conversation', $conversation)
            ->setParameter('receiver', $receiver)
            ->setParameter('isRead', false)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function countUnreadByReceiver(User $receiver): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->where('m.receiver = :receiver')
            ->andWhere('m.isRead = :isRead')
            ->setParameter('receiver', $receiver)
            ->setParameter('isRead', false)
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function findByType(string $type): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.type = :type')
            ->setParameter('type', $type)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findByContent(string $searchTerm): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.content LIKE :searchTerm')
            ->setParameter('searchTerm', '%' . $searchTerm . '%')
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findBySenderAndReceiver(User $sender, User $receiver): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.sender = :sender AND m.receiver = :receiver')
            ->orWhere('m.sender = :receiver AND m.receiver = :sender')
            ->setParameter('sender', $sender)
            ->setParameter('receiver', $receiver)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findRecentBySender(User $sender, int $limit = 10): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.sender = :sender')
            ->setParameter('sender', $sender)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function findRecentByReceiver(User $receiver, int $limit = 10): array
    {
        return $this->createQueryBuilder('m')
            ->where('m.receiver = :receiver')
            ->setParameter('receiver', $receiver)
            ->orderBy('m.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function getMessageStatistics(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('m')
            ->select([
                'COUNT(m.id) as total_messages',
                'COUNT(DISTINCT m.sender) as unique_senders',
                'COUNT(DISTINCT m.conversation) as active_conversations',
                'AVG(CASE WHEN m.isRead = true THEN 1 ELSE 0 END) as read_rate'
            ])
            ->where('m.createdAt BETWEEN :from AND :to')
            ->setParameter('from', $from)
            ->setParameter('to', $to);

        return $qb->getQuery()->getSingleResult();
    }

    public function getMessageCountByDay(\DateTime $from, \DateTime $to): array
    {
        $qb = $this->createQueryBuilder('m')
            ->select('DATE(m.createdAt) as date, COUNT(m.id) as count')
            ->where('m.createdAt BETWEEN :from AND :to')
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
}