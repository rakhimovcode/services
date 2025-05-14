import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";

import { Context, Markup, Telegraf } from "telegraf";
import { Master } from "../models/master.model";
import { Services } from "../models/service.model";
import { Op } from "sequelize";
import { InjectBot } from "nestjs-telegraf";

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(Master) private readonly masterModel: typeof Master,
    @InjectModel(Services) private readonly serviceModel: typeof Services,
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
        service_duration: "",
        last_state: "full_name",
      });
    }
    const workshop = [
      [
        {
          text: "Sartaroshxona 💇‍♂️",
          callback_data: "master_1",
        },
      ],
      [
        {
          text: "Go'zallik saloni 💇‍♀️",
          callback_data: "master_2",
        },
      ],
      [
        {
          text: "Zargarlik ustaxonasi 💍",
          callback_data: "master_3",
        },
      ],
      [
        {
          text: "Soatsoz ⌚",
          callback_data: "master_4",
        },
      ],
      [
        {
          text: "Poyabzal ustaxonasi 👞",
          callback_data: "master_5",
        },
      ],
    ];
    await ctx.reply("Service Nomini kiriting", {
      reply_markup: {
        inline_keyboard: workshop,
      },
    });
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
          user.last_state = "service_duration";
          await user.save();
          await ctx.replyWithHTML(
            "Iltimos har bir mijoz uchun sarflaydigan vaqtingizni kiriting:"
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

    await ctx.reply("Iltimos to'liq ismingizni kiriting.");
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
      const contextMessage = ctx.callbackQuery?.message;

      if (contextMessage?.message_id) {
        await ctx.deleteMessage(contextMessage.message_id);
      }
      await ctx.replyWithHTML(
        "Siz Usta sifatida ro'yxatdan o'tdingiz Ma'lumotlaringiz ADMIN tomonidan tasdiqlanishini kuting ✅🎉"
      );
      await this.sendMasterInfoToAdmin(ctx, master.user_id);
      await this.CheckIsVerifiedMenu(master!.user_id, ctx);
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
       await ctx.reply(
         "Iltimos, avval ro'yxatni boshlash uchun '/start' tugmasini bosing.",
         Markup.keyboard([["/start"]])
           .resize()
           .oneTime()
       );
      const contextMessage = ctx.callbackQuery?.message;

      if (contextMessage?.message_id) {
        await ctx.deleteMessage(contextMessage.message_id);
      }
    } catch (error) {
      console.error("Error in confirmNo:", error);
      await ctx.reply("Xatolik yuz berdi, iltimos qayta urinib ko'ring.");
    }
  }

  async sendMasterInfoToAdmin(ctx: Context, user_id: number) {
    try {
      const master = await this.masterModel.findOne({ where: { user_id } });
      if (!master) {
        console.log(`No master found with user_id: ${user_id}`);
        return false;
      }
      const ADMIN = process.env.ADMIN!;
      const message = `👤 Master Info:
🆔 ID: ${master.user_id}
📛 Name: ${master.full_name}
📱 Phone: ${master.phone_number}
✅ Service: ${master.service}
⏲ Start Time: ${master.start_time}
⏲ End Time: ${master.end_time}
🏠 Location: ${master.location || "Not Provided"}
⏳ Service Duration: ${master.service_duration}
🕒 Joined: ${master.createdAt}`;

      await ctx.telegram.sendMessage(ADMIN, message, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Ustani Tasdiqlash",
                callback_data: `confirm_master_${master.user_id}`,
              },
              {
                text: "❌ Ustani bekor qilish",
                callback_data: `reject_master_${master.user_id}`,
              },
            ],
          ],
        },
      });
      return true;
    } catch (error) {
      console.error("Error on sendMasterInfoToAdmin:", error);
      return false;
    }
  }
  async onConfirmMaster(ctx: Context) {
    try {
      const contextAction = ctx.callbackQuery!["data"];
      const user_id = contextAction.split("_")[2];
      if (!user_id) return;
      const master = await this.masterModel.findOne({ where: { user_id } });

      if (!master) {
        await ctx.replyWithHTML("Bunday Master mavjud Emas!");
      }
      if (master?.is_verified == true) {
        await ctx.reply("Allaqachon tasdiqlangan ✅");
        return;
      }
      master!.is_verified = true;
      await master!.save();
      const messageToAdmin = `Siz ${master?.user_id} ID egasi ${master?.full_name}ni  usta sifatida tasdiqladingiz ✅ `;
      // const  messageToMaster = `Hurmatli Usta Ma'lumotlaringiz ADMIN tomonidan tasdiqlandi ✅`
      await ctx.replyWithHTML(messageToAdmin);
      // await ctx.telegram.sendMessage(master!.user_id,messageToMaster)
    } catch (error) {
      console.log("Error while confirming master", error);
    }
  }
  async OnRejection(ctx: Context) {
    try {
      const contextAction = ctx.callbackQuery!["data"];
      const user_id = contextAction.split("_")[2];
      if (!user_id) return;
      const master = await this.masterModel.findOne({ where: { user_id } });

      if (!master) {
        await ctx.replyWithHTML("Bunday Master mavjud Emas!");
      }
      master!.is_verified = false;
      await master?.save();
      const messageToAdmin = `Siz ${master?.user_id} ID egasi ${master?.full_name}ni ma'lumotlarini bekor qildingiz❌`;
      const messageToMaster = `Hurmatli Usta Ma'lumotlaringiz ADMIN tomonidan bekor qilindi ❌`;
      await ctx.replyWithHTML(messageToAdmin);
      await ctx.telegram.sendMessage(master!.user_id, messageToMaster);
    } catch (error) {
      console.log("Error while confirming master", error);
    }
  }
  async CheckIsVerifiedMenu(user_id: number,ctx:Context) {
    try {
      const master = await this.masterModel.findOne({ where: { user_id } });
      await ctx.telegram.sendMessage(
      master!.user_id,
      "📄 Ma'lumotlar ADMINga yuborildi! Tekshirilishini kuting:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Tasdiqlanganini Tekshirish",
                callback_data: `is_verified_master`,
              },
              {
                text: "Bekor qilish❌ ",
                callback_data: `confirm_no`,
              },
            ],
          ],
        },
      }
    );
  
     
    } catch (error) {
      console.log("error on check is verified menu");
    }
  }
  async isVerified(ctx: Context) {
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
      if (master.is_verified !== true) {
        await ctx.reply("Ma'lumotlaringiz xali tasdiqlanmadi...❗");
        return;
      }
      await ctx.reply(
        "Tabriklaymiz ma'lumotlaringiz ADMIN tomonidan tasdiqlangan🎉"
      );
      const contextMessage = ctx.callbackQuery?.message;

      if (contextMessage?.message_id) {
        await ctx.deleteMessage(contextMessage.message_id);
      }
      await this.MasterMenu(ctx)
      
    } catch (error) {
      console.log("Error on isVerified");
    }
  }
  async MasterMenu(ctx:Context){
    try {
      const workshop = [
        [
          {
            text: "👥 Mijozlar",
            callback_data: "customers",
          },
        ],
        [
          {
            text: "⏲ Vaqtni Belgilash",
            callback_data: "master_time",
          },
        ],
        [
          {
            text: "📊 Reytingim",
            callback_data: "rating_of_master",
          },
        ],
        [
          {
            text: "✏️ Ma'lumotlarni O'zgartirish",
            callback_data: "update_info",
          },
        ],
      ];

      await ctx.reply("Asosiy Menu 🗺", {
        reply_markup: {
          inline_keyboard: workshop,
        },
      });
    } catch (error) {
      console.log("error while running master menu", error);
    }
  }
}
