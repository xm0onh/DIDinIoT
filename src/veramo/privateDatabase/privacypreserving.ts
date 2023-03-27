import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Index,
  PrimaryColumn,
} from "typeorm";

@Entity("privacy")
@Index(["test1", "test2"], { unique: true })
export class Privacy extends BaseEntity {
  @PrimaryColumn()
  privacy: string;

  @Column({ type: "varchar", nullable: true })
  test1?: string;

  @Column({ type: "varchar", nullable: true })
  test2?: string;
}
