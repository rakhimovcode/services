import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IServicesCreationAttr {
    name:string
}

@Table({ tableName: "services",timestamps:false})
export class Services extends Model<Services, IServicesCreationAttr> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING
  })
  declare name:string
}
