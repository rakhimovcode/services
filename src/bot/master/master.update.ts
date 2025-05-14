import { Hears, On, Update, Ctx, Action, Command } from "nestjs-telegraf";
import { Context } from "telegraf";
import { MasterService } from "./master.service";
import { BotService } from "../bot.service";

@Update()
export class MasterUpdate {
  constructor(
    private readonly masterService: MasterService,
    private readonly botService: BotService
  ) {}

  @Hears("Usta")
  async onUsta(@Ctx() ctx: Context) {
    return this.masterService.create(ctx);
  }

  @Hears("soatsoz")
  async onSoatsoz(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "soatsoz");
  }

  @Hears("sartaroshxona")
  async onSartaroshxona(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "sartaroshxona");
  }

  @Hears("tamirlash")
  async onTamirlash(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "tamirlash");
  }

  @Hears("salon")
  async onSaloon(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "salon");
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    return this.masterService.onLocation(ctx);
  }

  @Action("confirm_no")
  async confirmNo(@Ctx() ctx: Context) {
    return this.masterService.confirmNo(ctx);
  }

  @Action("confirm_yes")
  async confirmYes(@Ctx() ctx: Context) {
    return this.masterService.confirmYes(ctx);
  }

  @Action(/^confirm_master_+\d/)
  async onConfirmMaster(@Ctx() ctx: Context) {
    await this.masterService.onConfirmMaster(ctx);
  }
  @Action(/^reject_master_+\d/)
  async onRejectMaster(@Ctx() ctx: Context) {
    await this.masterService.OnRejection(ctx)
  }
}
