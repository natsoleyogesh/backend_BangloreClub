const emailTemplates = {
    welcome: {
        subject: "Welcome to Our Platform, {{name}}!",
        body: `
            <h1>Welcome, {{name}}!</h1>
            <p>We're excited to have you on board. Here's some information to get you started.</p>
            <p>Feel free to reach out if you have any questions.</p>
        `,
    },
    resetPassword: {
        subject: "Reset Your Password, {{name}}",
        body: `
            <h1>Password Reset</h1>
            <p>Hello {{name}},</p>
            <p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>
        `,
    },
};

module.exports = emailTemplates;
