import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPhysicalOrderTrackingToOrders1746316000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('orders', [
      new TableColumn({
        name: 'quantity',
        type: 'integer',
        default: 1,
      }),
      new TableColumn({
        name: 'confirmed_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'auto_confirm_scheduled_at',
        type: 'timestamp',
        isNullable: true,
      }),
    ]);

    // Update OrderStatus enum to include CONFIRMED
    await queryRunner.query(`
      ALTER TYPE orders_status_enum ADD VALUE 'confirmed'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('orders', [
      'quantity',
      'confirmed_at',
      'auto_confirm_scheduled_at',
    ]);
  }
}
