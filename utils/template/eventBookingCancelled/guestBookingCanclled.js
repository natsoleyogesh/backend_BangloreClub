module.exports = {
    subject: "Booking Cancelled for {{eventTitle}}",
    body: `
       <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Booking Cancelled - Bangalore Club</title>
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
            <h1>Event Booking Cancelled</h1>
        </div>
        <div class="content">
            <h2>Booking Details</h2>
            <div class="details-section" style="text-align: center;">
                <p><img src="cid:qrCodeImage" alt="QR Code" style="width: 250px; height: 250px;" /></p>
                <p><strong>QR Code ID:</strong> {{uniqueQRCode}}</p>
            </div>

            <div class="details-section">
                <h3>Event Information</h3>
                <p><strong>Event Name:</strong> {{eventTitle}}</p>
                <p><strong>Event Date:</strong> {{eventDate}}</p>
            </div>
              <div class="details-section">
               <h3>Booked By :- {{bookedBy}}</h3>
                <p><strong>Member A/C No:</strong> {{memberShipId}}</p>
                <p><strong>Contact Number:</strong> {{memberContact}}</p>
            </div>

            <div class="details-section">
                <h3>Guest Member Details</h3>
                <p><strong>Name:</strong> {{guestName}}</p>
                <p><strong>Email:</strong> {{guestEmail}}</p>
                <p><strong>Contact Number:</strong> {{guestContact}}</p>
              
            </div>
           
            <div class="icons">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M14 9V5a5 5 0 0 0-10 0v4H2v13h20V9h-8zM8 5a3 3 0 0 1 6 0v4H8zm10 15H4v-9h4v3h8v-3h4z" />
                </svg>
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M21 11.5a8.38 8.38 0 0 1-.09 1.23 8.5 8.5 0 1 1-9.74-9.74 8.38 8.38 0 0 1 1.23-.09h.5v2h-.5a6.5 6.5 0 1 0 6.5 6.5h-2v-2h4v4h-2z" />
                </svg>
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
    `,
}