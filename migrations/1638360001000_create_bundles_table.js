exports.up = (pgm) => {
  pgm.createTable('bundles', {
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
    tier: {
      type: 'varchar(50)',
      notNull: true,
      check: "tier IN ('basic', 'pro', 'enterprise')",
    },
    quota: {
      type: 'integer',
      notNull: true,
    },
    remaining_quota: {
      type: 'integer',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    expires_at: {
      type: 'timestamp',
      default: null,
    },
  });

  pgm.createIndex('bundles', 'user_id');
  pgm.createIndex('bundles', ['user_id', 'remaining_quota']);
};

exports.down = (pgm) => {
  pgm.dropTable('bundles');
};

