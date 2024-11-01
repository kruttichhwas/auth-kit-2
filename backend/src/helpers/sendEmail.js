import nodeMailer from "nodemailer"
import path from "path"
import hbs from "nodemailer-express-handlebars"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (subject, send_to, reply_to, template, send_from, name, verificationLink)=> {
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.TEAM_AUTH_MAIL,
            pass: process.env.TEAM_AUTH_PASS
        },
        tls: {
            ciphers: "SSLv3"
        }
    });
    const handlebarOptions = {
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.resolve(__dirname, "../views"),
            defaultLayout: false
        },
        viewPath: path.resolve(__dirname, "../views"),
        extName: ".hbs"
    };
    transporter.use("compile", hbs(handlebarOptions));
    const mailOptions = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        template: template,
        context: {
            name: name,
            link: verificationLink
        }
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("message sent", info.messageId);
        return info;
    } catch (error) {
        throw error;
    }
};

export default sendEmail