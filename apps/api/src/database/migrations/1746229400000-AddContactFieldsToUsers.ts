import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddContactFieldsToUsers1746229300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'contact_phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
      new TableColumn({
        name: 'whatsapp_phone',
        type: 'varchar',
        length: '20',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('users', ['contact_phone', 'whatsapp_phone']);
  }
}
