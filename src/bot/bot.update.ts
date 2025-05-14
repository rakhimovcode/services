import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "./bot.service";
import { UseFilters, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../common/guards/admin.guard";
import { TelegrafExceptionFilter } from "../common/filters/telegraf.exception.filter";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @UseFilters(TelegrafExceptionFilter)
  @UseGuards(AdminGuard)
  @Command("admin")
  async onAdminCommand(@Ctx() ctx:Context){
    await this.botService.admin_menu(ctx,`Xush Kelibsiz ADMIN!`)
  }
  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.start(ctx);
  }
  @Hears("Register")
  async OnRegister(ctx:Context){
    return this.botService.register(ctx)
  }
  @On("text")
  async onText(@Ctx() ctx: Context) {
    return this.botService.onText(ctx);
  }
  @On("contact")
  async onContact(@Ctx() ctx: Context) {
    return this.botService.OnContact(ctx);
  }

  @On("message")
  async onMessage(@Ctx() ctx: Context) {
    console.log("Bot Info:", ctx.botInfo);
    console.log("Chat:", ctx.chat);
    console.log("From:", ctx.from);
    console.log("User ID:", ctx.from?.id);
  }
}
