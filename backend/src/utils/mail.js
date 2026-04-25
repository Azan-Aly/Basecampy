import Mailgen from "mailgen";
import nodemailer from "nodemailer";


const sendEmail = async (options) => {

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanager.com",
        },
    });

    const emailTextual = mailGenerator.generatePlaintext(
        options.mailgenContent,
    );

    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            password: process.env.MAILTRAP_SMTP_PASS,
        },
    });

    const mail = {
        from: "mail.taskmanager@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error(
            "Email service failed silently. Make sure that you have provided the mailtrap credentials in the dotenv file",
        );
        console.error("Error : ", error);
    }
};


const emailVerificationMailgenContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our App! we're very excited to have you on board.",
            action: {
                instructions:
                    "Please click the button below to verify your email address.",
                button: {
                    color: "#22bc66",
                    text: "Verify Email",
                    link: verificationURL,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};


const forgotPasswordMailgenContent = (username, passwordResetURL) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions:
                    "To reset your password, Please click the button below.",
                button: {
                    color: "#22bc66",
                    text: "Reset password",
                    link: passwordResetURL,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};


export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail,
};
