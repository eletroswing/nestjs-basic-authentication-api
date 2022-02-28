interface SendMailDTO {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
}

export {SendMailDTO};