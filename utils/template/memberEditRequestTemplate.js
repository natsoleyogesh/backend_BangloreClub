
module.exports = {
    subject: "Edit {{type}} Details Request for {{memberName}}",
    body: `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{memberName}}Member Name &amp; ID {{memberId}} | Edit Profile - Bangalore Club</title>
    <style>
        /* General styling for responsive and clean design */
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: #115886;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            color: #333333;
        }

        .content h2 {
            color: #115886;
        }

        .content p {
            line-height: 1.6;
            word-wrap: break-word;
        }

        .details-section {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .details-section2 {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #fbeaea;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .details-section h3 {
            margin-top: 0;
            color: #555;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #115886;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
        }

        .icons {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .icon {
            width: 24px;
            height: 24px;
            fill: #115886;
            cursor: pointer;
        }

        .footer {
            background: #f4f4f4;
            color: #666666;
            text-align: center;
            font-size: 14px;
            padding: 10px 20px;
        }

        .footer a {
            color: #115886;
            text-decoration: none;
        }

        .disclaimer {
            margin-top: 10px;
            font-size: 12px;
            color: #888888;
            line-height: 1.4;
        }

        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                width: calc(100% - 20px);
            }

            .header h1 {
                font-size: 20px;
            }

            .content h2 {
                font-size: 18px;
            }

            .button {
                padding: 10px 15px;
                font-size: 14px;
            }

            .footer {
                font-size: 12px;
            }

            .disclaimer {
                font-size: 11px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <h1>Edit Profile Request</h1>
        </div>
        <div class="content">
            <h2>Member Details</h2>


            <div class="details-section">
                <p><strong>Member Name:</strong> {{memberName}}</p>
                <p><strong>Membership ID:</strong> {{memberId}}</p>
                <p><strong>Contact No.:</strong>{{mobileNumber}} </p>
                <p><strong>Email:</strong> {{email}}</p>
            </div>

            <div class="details-section2">
                <h3>Edit Requdst Details</h3>
                <p>{{memberMessage}}</p>

            </div>


        </div>

        <div class="footer">
            <p>&copy; 2024 Bangalore Club. All rights reserved.</p>
            <p><a href="#">Terms & Conditions</a> | <a href="#">Privacy Policy</a></p>
            <p class="disclaimer">This electronic mail (including any attachments) may contain information that is
                privileged, confidential, and/or otherwise protected from disclosure to anyone other than its intended
                recipient(s). Any dissemination or use of this electronic mail or its contents (including any
                attachments) by persons other than the intended recipient(s) is strictly prohibited. If you have
                received this message in error, please notify us immediately by reply e-mail so that we may correct our
                internal records. Please then delete the original message (including any attachments) in its entirety.
                Thank you.</p>
        </div>
    </div>
</body>

</html>

    `
}