import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
async function start() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule,
      {logger: ["debug","error"]}
    );
      app.use(cookieParser());
    app.setGlobalPrefix("api")
    const start = async () =>{
      app.enableCors({
        origin:(origin,callback)=>{
          const allowedOrigins = [
            "http://localhost:8000",
            "http://localhost:3000",
          ]
          if(!origin || allowedOrigins.includes(origin)){
            callback(null,true)
          } else {
            callback(new BadRequestException("Not allowed by CORS"))
          }
        },
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials:true
      })
    }

    app.useGlobalPipes(new ValidationPipe());
    const config = new DocumentBuilder()
      .setTitle("Services")
      .setDescription("SERVICES-REST-API")
      .setVersion("1.0")
      .addTag("NESTJS", "Validation")
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
    await app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();



