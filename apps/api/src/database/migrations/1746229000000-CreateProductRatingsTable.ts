import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateProductRatingsTable1746229000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_ratings',
        columns: [
          new TableColumn({
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          }),
          new TableColumn({
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'buyer_id',
            type: 'uuid',
            isNullable: false,
          }),
          new TableColumn({
            name: 'rating',
            type: 'integer',
            isNullable: false,
          }),
          new TableColumn({
            name: 'comment',
            type: 'text',
            isNullable: true,
          }),
          new TableColumn({
            name: 'is_verified_purchase',
            type: 'boolean',
            default: false,
          }),
          new TableColumn({
            name: 'order_id',
            type: 'uuid',
            isNullable: true,
          }),
          new TableColumn({
            name: 'created_at',
            type: 'timestamp',
            default: 'NOW()',
          }),
          new TableColumn({
            name: 'updated_at',
            type: 'timestamp',
            default: 'NOW()',
          }),
          new TableColumn({
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          }),
        ],
        indices: [
          {
            columnNames: ['product_id'],
            isUnique: false,
          },
          {
            columnNames: ['buyer_id'],
            isUnique: false,
          },
          {
            columnNames: ['product_id', 'buyer_id'],
            isUnique: true, // One rating per buyer per product
          },
          {
            columnNames: ['created_at'],
            isUnique: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['product_id'],
            referencedTableName: 'shop_products',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['buyer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_ratings');
  }
}
