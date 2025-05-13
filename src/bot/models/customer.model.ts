import { Column, DataType, Model, Table } from "sequelize-typescript"

interface ICustomerCreationAttr{
    user_id: number
    username:string
    phone_number:string
    last_state:string
}

@Table({ tableName: "customer" })
export class Customer extends Model<Customer, ICustomerCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
  })
  declare user_id: number;

  @Column({
    type: DataType.STRING(100),
  })
  declare username: string;

  @Column({
    type: DataType.STRING(30),
    defaultValue: "full_name",
  })
  declare last_state: string;

  @Column({
    type: DataType.STRING(15),
  })
  declare phone_number: string;
}