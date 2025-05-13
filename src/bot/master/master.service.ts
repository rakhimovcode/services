import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { Context, Markup } from "telegraf";
import { Master } from "../models/master.model";
import { Services } from "../models/service.model";
import { Op } from "sequelize";

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Services) private readonly serviceModel: typeof Services
  ) {}

  async create(ctx: Context) {
    const user_id = ctx.from!.id;
    let master = await this.masterModel.findOne({ where: { user_id } });
    if (!master) {
      master = await this.masterModel.create({
        user_id,
        full_name: "",
        phone_number: "",
        location: "",
        start_time: "",
        end_time: "",
        last_state: "full_name",
      });
    }
    const allServices = await this.serviceModel.findAll();
    const serviceButtons = allServices.map((service) => [
      { text: service.name },
    ]);
    await ctx.reply(
      "Quyidagi xizmatlardan birini tanlang:",
      Markup.keyboard(serviceButtons).resize().oneTime()
    );
  }

  async onLocation(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.masterModel.findByPk(user_id);

      if (!user) {
        await ctx.reply("Siz avval ro'yxatdan o'ting", {
          parse_mode: "HTML",
          ...Markup.keyboard([["/start"]]).resize(),
        });
        return;
      }

      if ("location" in ctx.message!) {
        const user = await this.masterModel.findOne({
          where: {
            user_id,
            last_state: { [Op.ne]: "finish" },
          },
        });

        if (user && user.last_state === "location") {
          const { latitude, longitude } = ctx.message.location;
          user.location = `${latitude},${longitude}`;
          user.last_state = "finish";
          await user.save();

          await ctx.replyWithHTML(
            "<b>🔍 Kiritgan ma'lumotlarni tasdiqlaysizmi! Tanlang:</b>",
            Markup.inlineKeyboard([
              [Markup.button.callback("Tasdiqlash", "confirm_yes")],
              [Markup.button.callback("Rad Etish", "confirm_no")],
            ])
          );
        }
      }
    } catch (error) {
      console.error("Error on onLocation():", error);
    }
  }

  async fillInfo(ctx: Context, theService: string) {
    const user_id = ctx.from!.id;
    let master = await this.masterModel.findByPk(user_id);
    if (!master) {
      await ctx.reply(
        "Iltimos avval ro'yxatni boshlash uchun 'Start' tugmasini bosing.",
        Markup.keyboard([["/Start"]])
          .resize()
          .oneTime()
      );
      return;
    }
    master.service = theService;
    await master.save();

    await ctx.reply("Iltimos ismingizni kiriting.");
  }

  async confirmYes(ctx: Context) {
    try {
      const user_id = ctx.from!.id;
      const master = await this.masterModel.findByPk(user_id);

      if (!master) {
        await ctx.reply(
          "Iltimos, avval ro'yxatni boshlash uchun '/start' tugmasini bosing.",
          Markup.keyboard([["/start"]])
            .resize()
            .oneTime()
        );
        return;
      }

      if (master.last_state !== "finish") {
        await ctx.reply("Iltimos, ma'lumotlaringizni to'liq kiriting!");
        return;
      }

      master.is_verified = true;
      await master.save();
      await ctx.replyWithHTML("Siz Usta sifatida ro'yxatdan o'tdingiz✅🎉");
    } catch (error) {
      console.error("Error in confirmYes:", error);
      await ctx.reply("Xatolik yuz berdi, iltimos qayta urinib ko'ring.");
    }
  }

  async confirmNo(ctx: Context) {
    try {
      const user_id = ctx.from!.id;
      const master = await this.masterModel.findOne({ where: { user_id } });

      if (!master) {
        await ctx.reply(
          "Iltimos, avval ro'yxatni boshlash uchun '/start' tugmasini bosing.",
          Markup.keyboard([["/start"]])
            .resize()
            .oneTime()
        );
        return;
      }

      if (master.last_state !== "finish") {
        await ctx.reply("Iltimos, ma'lumotlaringizni to'liq kiriting!");
        return;
      }

      await this.masterModel.destroy({ where: { user_id } });
      await ctx.reply("Ma'lumotlar saqlanmadi ❌");
    } catch (error) {
      console.error("Error in confirmNo:", error);
      await ctx.reply("Xatolik yuz berdi, iltimos qayta urinib ko'ring.");
    }
  }
}