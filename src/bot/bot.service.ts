import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../app.constants";
import { Context, Markup, Telegraf } from "telegraf";
import { Customer } from "./models/customer.model";
import { Master } from "./models/master.model";
import { Op } from "sequelize";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Customer) private readonly customerModel: typeof Customer,
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    try {
      await ctx.replyWithHTML(
        "<b>🔍 ServiceUz ga Xush Kelibsiz 🎉</b>",
        Markup.keyboard([["Register"]])
          .resize()
          .oneTime()
      );
    } catch (error) {
      console.error("Error in start:", error);
      await ctx.reply("Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  }

  async register(ctx: Context) {
    try {
       await ctx.replyWithHTML(
         "<b>🔍Tanlang:</b>",
         Markup.keyboard([["Usta", "Mijoz"]])
           .resize()
           .oneTime()
       );
    } catch (error) {
      console.error("Error in start:", error);
      await ctx.reply("Xatolik yuz berdi, qayta urinib ko'ring.");
    }
  }
  async admin_menu(ctx:Context, message:string){
    try {
      await ctx.reply(message,{
        parse_mode: "HTML",
        ...Markup.keyboard([["Ustalar", "Mijozlar"]])
        .oneTime()
        .resize()
      })
    } catch (error) {
      console.log("Admin menusida xatolik!",error);
    }
  }
  async onText(ctx: Context) {
    try {
      const user_id = ctx.from?.id;

      if (!("text" in ctx.message!)) return;

      const userInput = ctx.message.text;

      const master = await this.masterModel.findOne({
        where: {
          user_id,
          last_state: { [Op.ne]: "finish" },
        },
      });

      if (!master) return;

      const customer = await this.customerModel.findOne({
        where: { user_id, last_state: { [Op.ne]: "finish" } },
      });


  
      switch (master.last_state) {
        case "full_name":
          master.full_name = userInput;
          master.last_state = "phone_number";
          await master.save();
          await ctx.reply("Telefon raqamingizni yuboring", {
            parse_mode: "HTML",
            ...Markup.keyboard([
              [Markup.button.contactRequest("Telefon raqamingizni yuboring!")],
            ])
              .oneTime()
              .resize(),
          });
          break;

        case "phone_number":
          master.phone_number = userInput;
          master.last_state = "start_time";
          await master.save();
          await ctx.reply("Ish boshlash vaqtingizni kiriting");
          break;
        case "start_time":
          master.start_time = userInput;
          master.last_state = "end_time";
          await master.save();

          await ctx.reply("Ish tugatish vaqtingizni kiriting");
          break;

        case "end_time":
          master.end_time = userInput;
          master.last_state = "location";
          await master.save();

          await ctx.reply("Manzilingizni lokatsiyasini yuboring", {
            parse_mode: "HTML",
            ...Markup.keyboard([
              [Markup.button.locationRequest("Lokatsiyani yuboring!")],
            ])
              .oneTime()
              .resize(),
          });
          break;
        case "service_duration":
          master.service_duration = userInput;
          master.last_state = "finish";
          await master.save();
          const message = `👤 Usta Info:
🆔 ID: ${master.user_id}
📛 Name: ${master.full_name}
📱 Phone: ${master.phone_number}
✅ Service: ${master.service}
⏲ Start Time: ${master.start_time}
⏲ End Time: ${master.end_time}
🏠 Location: ${master.location || "Not Provided"}
⏳ Service Duration: ${master.service_duration}`;
          await ctx.replyWithHTML("Ma'lumotlaringiz:", {
            reply_markup: { remove_keyboard: true },
          });

          await ctx.replyWithHTML(
            `<b>Siz kiritgan ma'lumotlar! ${message} 
            Kiritgan ma'lumotlarni tasdiqlaysizmi?</b>`,
            Markup.inlineKeyboard([
              [Markup.button.callback("Tasdiqlash", "confirm_yes")],
              [Markup.button.callback("Bekor qilish", "confirm_no")],
            ])
          );

          break;
      }
    } catch (error) {
      console.error("Error on onText():", error);
    }
  }
  async OnContact(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.masterModel.findOne({ where: { user_id } });
      if (!user) {
        await ctx.replyWithHTML(
          `Iltimos, <b>/start</b> tugmasini bosing!`,
          Markup.keyboard([["/start"]])
            .oneTime()
            .resize()
        );
        return;
      }

      if ("contact" in ctx.message!) {
        const contact = ctx.message.contact;

        if (contact.user_id !== user_id) {
          await ctx.replyWithHTML(
            `Iltimos, o'zingizni telefon raqamingizni yuboring!`,
            Markup.keyboard([
              [Markup.button.contactRequest("📞Telefon raqam yuborish!")],
            ])
              .oneTime()
              .resize()
          );
          return;
        }
        let phone = contact.phone_number;
        user.phone_number = phone;
        user.last_state = "start_time";
        await user.save();
        await ctx.reply("Ish boshlash vaqtingizni kiriting");
      }
    } catch (error) {
      console.error("Error on OnContact():", error);
    }
  }
}
