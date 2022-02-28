import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import {SendMailDTO} from "./sendMail-dto";
import { MailerService } from "@nestjs-modules/mailer";

@Processor('sendmail-queue')
class SendMailConsumer{
    constructor(private mailService: MailerService){}
    @Process('sendmail-job')
    async SendMailJob(job: Job<SendMailDTO>){
        const { data } = job

        await this.mailService.sendMail({
            from: data.from,
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.html
        })

    }
}

export { SendMailConsumer }