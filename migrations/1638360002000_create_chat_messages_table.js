exports.up = (pgm) => {
  pgm.createTable('chat_messages', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    question: {
      type: 'text',
      notNull: true,
    },
    answer: {
      type: 'text',
      notNull: true,
    },
    tokens_used: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('chat_messages', 'user_id');
  pgm.createIndex('chat_messages', ['user_id', 'created_at']);
};

exports.down = (pgm) => {
  pgm.dropTable('chat_messages');
};

