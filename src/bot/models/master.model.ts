import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IMasterCreationAttr {
  user_id: number;
  full_name: string;
  phone_number: string;
  location: string;
  start_time: string;
  end_time: string;
  last_state: string;
}

@Table({ tableName: "master" })
export class Master extends Model<Master, IMasterCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING(50),
  })
  declare full_name: string;

  @Column({
    type: DataType.STRING(15),
  })
  declare service: string;

  @Column({
    type: DataType.STRING(15),
  })
  declare phone_number: string;

  @Column({
    type: DataType.STRING(5),
  })
  declare start_time: string;

  @Column({
    type: DataType.STRING(5),
  })
  declare end_time: string;

  @Column({
    type: DataType.STRING(30),
    defaultValue: "full_name",
  })
  declare last_state: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_verified: boolean;

  @Column({
    type: DataType.STRING(50),
  })
  declare location: string;
}
