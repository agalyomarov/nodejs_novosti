require("dotenv").config();
module.exports = function(email) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Аккаунт создан",
        html: `
        <p>Вы успешно создали аккаунт ${email}</p>
        <hr/>
        <a href="${process.env.BASE_URL}">Наш сайт</a>
        `,
    };
};