import nodeMailr from "nodemailer"

const senMail = async (adres, content) => {

    const transport = nodeMailr.createTransport({
        service: "gmail",
        auth:{
            user:"karzinkawebsite@gmail.com",
            pass:"jxhpfbsrewpjkcri"
        }
    })

    const mailSend = await transport.sendMail({
        from: "karzinkawebsite@gmail.com",
        to: adres,
        subject: content,
        text: content
    })

    return content;
}

export default senMail