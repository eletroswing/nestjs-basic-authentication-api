import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { MailerService } from "@nestjs-modules/mailer";

interface SendMailDTO {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

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