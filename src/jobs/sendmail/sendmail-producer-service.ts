import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import {SendMailDTO} from "./sendMail-dto";


@Injectable()
class SendMailProducerService{
    constructor(@InjectQueue("sendmail-queue") private mailQueue: Queue) {}
    async SendMail(sendMailDTO: SendMailDTO){
        this.mailQueue.add("sendmail-job", sendMailDTO, {priority: 1, attempts: 3});
    }
}

export { SendMailProducerService};