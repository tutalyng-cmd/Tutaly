import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreatePostSharesTable1746400300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create share type enum if it doesn't exist
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE share_type_enum AS ENUM('feed', 'whatsapp', 'twitter');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.createTable(
      new Table({
        name: 'post_shares',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'originalPostId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sharedById',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'shareType',
            type: 'enum',
            enum: ['feed', 'whatsapp', 'twitter'],
            default: "'feed'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'post_shares',
      new TableForeignKey({
        columnNames: ['originalPostId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'posts',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'post_shares',
      new TableForeignKey({
        columnNames: ['sharedById'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'post_shares',
      new TableIndex({
        columnNames: ['originalPostId'],
      }),
    );

    await queryRunner.createIndex(
      'post_shares',
      new TableIndex({
        columnNames: ['sharedById', 'createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('post_shares');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('post_shares', fk);
      }
      await queryRunner.dropTable('post_shares');
    }

    // Drop enum if it exists
    await queryRunner.query(`DROP TYPE IF EXISTS share_type_enum;`);
  }
}
