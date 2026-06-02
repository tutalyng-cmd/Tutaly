import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddResolutionFieldsToOrderDisputes1746229500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('order_disputes', [
      new TableColumn({
        name: 'resolution_notes',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'resolved_at',
        type: 'timestamp',
        isNullable: true,
      }),
      new TableColumn({
        name: 'resolved_by_id',
        type: 'uuid',
        isNullable: true,
      }),
    ]);

    // Add foreign key for resolved_by_id
    await queryRunner.query(
      'ALTER TABLE order_disputes ADD CONSTRAINT fk_order_disputes_resolved_by_id FOREIGN KEY (resolved_by_id) REFERENCES users(id);',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE order_disputes DROP CONSTRAINT fk_order_disputes_resolved_by_id;',
    );

    await queryRunner.dropColumns('order_disputes', [
      'resolution_notes',
      'resolved_at',
      'resolved_by_id',
    ]);
  }
}
