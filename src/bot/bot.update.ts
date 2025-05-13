import {
  Action,
  Command,
  Ctx,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { Context } from "telegraf";
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.start(ctx);
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
