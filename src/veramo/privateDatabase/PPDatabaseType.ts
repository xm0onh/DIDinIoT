import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Index,
  PrimaryColumn,
} from "typeorm";

@Entity("privacy")
@Index(["from", "to", "contract"], { unique: false })
export class Privacy extends BaseEntity {
  @PrimaryColumn()
  contract: string;

  @Column({ type: "varchar", nullable: true })
  from?: string;

  @Column({ type: "varchar", nullable: true })
  to?: string;

  @Column({ type: "varchar", nullable: true })
  proof?: string;

  @Column({ type: "varchar", nullable: true })
  input?: string;

  @Column({ type: "varchar", nullable: true })
  claim?: string;
}
