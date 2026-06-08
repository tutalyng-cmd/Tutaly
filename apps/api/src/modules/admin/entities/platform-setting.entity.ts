import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Key-value store for platform-wide configuration.
 * Used for commission rates, cookie settings, and other admin-configurable values.
 */
@Entity('platform_settings')
export class PlatformSetting {
  @PrimaryColumn()
  key: string;

  @Column('jsonb')
  value: Record<string, unknown>;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  updatedById: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
