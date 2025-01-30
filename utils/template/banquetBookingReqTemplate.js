module.exports = {
    subject: "Booking Request for {{banquetName}}",
    body: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Banquet Booking Confirmation - Bangalore Club</title>
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
            <h1>Banquet Booking Request</h1>
        </div>
        <div class="content">
            <h2>Booking Details</h2>
            <div class="details-section" style="text-align: center;">
              <!-- <p><img src="cid:qrCodeImage" alt="QR Code" style="width: 250px; height: 250px;" /></p> -->
                <p><strong>Booking Ref. ID:</strong> {{bookingReferenceId}}</p>
            </div>
            <div class="details-section">
                <h3>Banquet Information</h3>
                <p><strong>Banquet Name:</strong> {{banquetName}}</p>
                <p><strong>Member Name:</strong> {{primaryName}}</p>
                <p><strong>Membership ID:</strong> {{memberId}}</p>
                <p><strong>Contact No.:</strong> {{primaryContact}}</p>
                <p><strong>Email:</strong> {{primaryEmail}}</p>
                <p><strong>Attending Guests:</strong> {{attendingGuests}}</p>
                <p><strong>Date of Banquet:</strong> {{bookingDate}}</p>
                <p><strong>Duration:</strong> {{from}} - {{to}} PM ({{duration}} Hours)</p>
            </div>
            <div class="details-section2">
                <h3>Payment Details</h3>
                <p><strong>Banquet Fees:</strong> ₹{{totalAmount}}</p>
                  {{taxTypes}}
                <p><strong>Total Tax Amount:</strong> ₹{{totalTaxAmount}}</p>
                <p><strong>Total Billed Amount:</strong> ₹{{final_totalAmount}}</p>
                <p class="disclaimer"><strong>Important:</strong> The total billed amount will be directly charged to
                    the member's account. For detailed tax information, please refer to the respective individual room
                    sections above.</p>
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