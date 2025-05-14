import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TelegrafException, TelegrafExecutionContext } from "nestjs-telegraf";
import { Context } from "telegraf";

@Injectable()
export class AdminGuard implements CanActivate {
    private readonly ADMIN = process.env.ADMIN

    async canActivate(context: ExecutionContext):Promise<boolean>{
        const ctx = TelegrafExecutionContext.create(context)
        const {from} = ctx.getContext<Context>()


        if(Number(this.ADMIN) != from!.id){
            throw new TelegrafException("Siz administrator emassiz. Ruxsat Yo'q")
        }

        return true
    }
}