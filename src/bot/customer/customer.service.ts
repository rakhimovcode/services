import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Customer } from "../models/customer.model";
import { Context } from "telegraf";

@Injectable()
export class CustomerService{
constructor(@InjectModel(Customer) private readonly customerModel:typeof Customer){}

async OnStart(ctx:Context){
    
}

}
