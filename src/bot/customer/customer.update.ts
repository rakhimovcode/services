import { Hears, On, Update, Ctx, Action } from "nestjs-telegraf";
import { Context } from "telegraf";
import { CustomerService } from "./customer.service";


@Update()
export class CustomerUpdate {
  constructor(private readonly customerService: CustomerService) {}

  @Hears("Mijoz")
  async onCustomer(@Ctx() ctx: Context) {
    return this.customerService
  }
  

  

  
}
