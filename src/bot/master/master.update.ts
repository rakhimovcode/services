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

  @Action("master_1")
  async onSartaroshxona(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "Sartaroshxona");
  }

  @Action("master_2")
  async onSaloon(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "Go'zallik saloni");
  }

  @Action("master_3")
  async onZargarlik(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "Zargarlik Ustaxonasi");
  }

  @Action("master_4")
  async onSoatsoz(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "Soatsoz");
  }

  @Action("master_5")
  async onPoyabzalUstasi(@Ctx() ctx: Context) {
    return this.masterService.fillInfo(ctx, "Poyabzal Ustaxonasi");
  }

  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    return this.masterService.onLocation(ctx);
  }

  @Action("confirm_no")
  async confirmNo(@Ctx() ctx: Context) {
    return this.masterService.confirmNo(ctx);
  }

  @Action("is_verified_master")
  async isVerfifiedMaster(@Ctx() ctx: Context) {
    return this.masterService.isVerified(ctx);
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
    await this.masterService.OnRejection(ctx);
  }
}
