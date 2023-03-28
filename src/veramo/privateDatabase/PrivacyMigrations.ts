import { MigrationInterface, QueryRunner, TableColumn, Table } from "typeorm";
import Debug from "debug";

/**
 * Fix inconsistencies between Entity data and column data.
 *
 * @public
 */
export class PrivacyPreserving1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    function getTableName(givenName: string): string {
      return (
        queryRunner.connection.entityMetadatas.find(
          (meta) => meta.givenTableName === givenName
        )?.tableName || givenName
      );
    }
    await queryRunner.createTable(
      new Table({
        name: getTableName("privacy"),
        columns: [
          { name: "claim", type: "varchar", isPrimary: true },
          { name: "from", type: "varchar", isNullable: true },
          { name: "to", type: "varchar", isNullable: true },
          { name: "proof", type: "varchar", isNullable: true },
          { name: "input", type: "varchar", isNullable: true },
          { name: "contract", type: "varchar", isNullable: true },
        ],
        indices: [
          {
            columnNames: ["from", "to", "claim"],
            isUnique: false,
          },
        ],
      }),
      true
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error("illegal_operation: cannot roll back initial migration");
  }
}
