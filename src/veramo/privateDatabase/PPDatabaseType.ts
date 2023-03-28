import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Index,
  PrimaryColumn,
} from "typeorm";

@Entity("privacy")
@Index(["from", "to", "claim"], { unique: false })
export class Privacy extends BaseEntity {
  @PrimaryColumn()
  claim: string;

  @Column({ type: "varchar", nullable: true })
  from?: string;

  @Column({ type: "varchar", nullable: true })
  to?: string;

  @Column({ type: "varchar", nullable: true })
  proof?: string;

  @Column({ type: "varchar", nullable: true })
  input?: string;

  @Column({ type: "varchar", nullable: true })
  contract?: string;
}
