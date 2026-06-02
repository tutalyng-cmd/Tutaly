import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRatingColumnsToShopProducts1746229100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('shop_products', [
      new TableColumn({
        name: 'average_rating',
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0,
      }),
      new TableColumn({
        name: 'total_ratings',
        type: 'integer',
        default: 0,
      }),
      new TableColumn({
        name: 'rating_distribution',
        type: 'jsonb',
        isNullable: true,
        default: "'{}'::jsonb",
      }),
    ]);

    // Create index for efficient rating queries
    await queryRunner.query(
      'CREATE INDEX idx_shop_products_average_rating ON shop_products(average_rating DESC);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX idx_shop_products_average_rating;');

    await queryRunner.dropColumns('shop_products', [
      'average_rating',
      'total_ratings',
      'rating_distribution',
    ]);
  }
}
