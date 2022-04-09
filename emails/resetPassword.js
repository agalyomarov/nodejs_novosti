require("dotenv").config();
module.exports = function(email, token) {
    return {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: "Восстановление пароля",
        html: `
        <h1>Вы забыли парол?</h1>
        <p>Если нет то проигнорируйте данное писмо</p>
        <p>Иначе нажмите на сcылку:</p>
        <a href="${process.env.BASE_URL}/auth/password/${email}/${token}">Ввостоновить доступ</a>
        <hr/>
        <a href="${process.env.BASE_URL}">Novosto.com</a>
        `,
    };
};