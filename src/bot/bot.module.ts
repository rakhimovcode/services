import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { BotUpdate } from './bot.update';
import { Master } from './models/master.model';
import { MasterService } from './master/master.service';
import { MasterUpdate } from './master/master.update';
import { Customer } from './models/customer.model';
import { CustomerService } from './customer/customer.service';
import { CustomerUpdate } from './customer/customer.update';
import { Services } from './models/service.model';


@Module({
  imports: [SequelizeModule.forFeature([Customer, Master,Services])],
  controllers: [],
  providers: [
    BotService,
    MasterService,
    MasterUpdate,
    CustomerService,
    CustomerUpdate,
    BotUpdate],
  exports: [BotService],
})
export class BotModule {}
