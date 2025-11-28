exports.up = (pgm) => {
  pgm.createTable('usage_tracking', {
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
    month: {
      type: 'integer',
      notNull: true,
      check: 'month >= 1 AND month <= 12',
    },
    year: {
      type: 'integer',
      notNull: true,
    },
    free_messages_used: {
      type: 'integer',
      notNull: true,
      default: 0,
      check: 'free_messages_used >= 0 AND free_messages_used <= 3',
    },
    last_reset_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('usage_tracking', ['user_id', 'month', 'year'], { unique: true });
  pgm.createIndex('usage_tracking', ['year', 'month']);
};

exports.down = (pgm) => {
  pgm.dropTable('usage_tracking');
};

