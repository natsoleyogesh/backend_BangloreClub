const eventrenderTemplate = (template, data) => {
    // Replace array placeholders (familyMembers, guests, etc.)
    template = template.replace(/{{familyMembers}}/g, () => {
        return data.familyMembers.length > 0
            ? data.familyMembers
                // .map((member, index) => `<p><strong>Family Member ${index + 1}:</strong> ${member.name}</p>
                .map((member, index) => `<p><strong>${member.relation}:</strong> ${member.name}</p>
                                         <p><strong>Email:</strong> ${member.email}</p>
                                         <p><strong>Contact Number:</strong> ${member.contact}</p>`)
                .join("")
            : "<p>No family members added.</p>";
    });

    template = template.replace(/{{guests}}/g, () => {
        return data.guests.length > 0
            ? data.guests
                .map(
                    (guest, index) => `
                          <p><strong>${index + 1}.Guest Name:</strong> ${guest.name}</p>
                          <p><strong>Email:</strong> ${guest.email}</p>
                          <p><strong>Contact Number:</strong> ${guest.contact}</p>
                        
                      `
                )
                .join("")
            : "<p>No guests added.</p>";
    });

    // Replace array placeholders (taxTypes)
    template = template.replace(/{{taxTypes}}/g, () => {
        return data.taxTypes.length > 0
            ? data.taxTypes
                .map(
                    (tax, index) => `
                          <p><strong> ${tax.taxType} (${tax.taxRate}%):</strong> ₹${tax.taxAmount.toFixed(2)}</p>
                      `
                )
                .join("")
            : "<p>No taxes applicable.</p>";
    });


    // Replace other placeholders
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
};

const eventrenderDependentTemplate = (template, data) => {
    // Replace other placeholders
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
};

const banquetrenderTemplate = (template, data) => {
    // Replace array placeholders (taxTypes)
    template = template.replace(/{{taxTypes}}/g, () => {
        return data.taxTypes.length > 0
            ? data.taxTypes
                .map(
                    (tax, index) => `
                          <p><strong> ${tax.taxType} (${tax.taxRate}%):</strong> ₹${tax.taxAmount.toFixed(2)}</p>
                      `
                )
                .join("")
            : "<p>No taxes applicable.</p>";
    });

    // Replace other placeholders
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
};


const roomrenderTemplate = (template, data) => {
    // Replace room details placeholder (roomDetails)
    template = template.replace(/{{roomDetails}}/g, () => {
        return data.roomDetails.length > 0
            ? data.roomDetails
                .map(
                    (room, index) => `
                        <div class="details-section">
                            <h3>${index + 1}. ${room.roomName} & Payment Details</h3>
                            <p><strong>No. of Occupants:</strong> ${room.numberOfOccupants}</p>
                            <p><strong>No. of Rooms:</strong> ${room.numberOfRooms}</p>
                            <p><strong>No. of Nights:</strong> ${room.numberOfNights}</p>
                            <p><strong>Check-In Date:</strong> ${room.checkInDate}</p>
                            <p><strong>Check-Out Date:</strong> ${room.checkOutDate}</p>
                            <p><strong>Room Fees:</strong> ${room.roomFees}</p>
                            <p><strong>Extra Bed:</strong> ${room.extraBedCharge}</p>
                            <p><strong>Taxes:</strong></p>
                            <ul>
                                ${room.taxDetails.length > 0
                            ? room.taxDetails
                                .map(
                                    (tax) =>
                                        `<li><strong>${tax.taxType} (${tax.taxRate}):</strong> ₹${tax.taxAmount}</li>`
                                )
                                .join("")
                            : "<li>No taxes applicable.</li>"
                        }
                            </ul>
                            <p><strong>Total Room Amount:</strong> ${room.totalRoomAmount}</p>
                        </div>
                    `
                )
                .join("")
            : "<div class='details-section'><p>No room details available.</p></div>";
    });

    // Replace other placeholders
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
};


const otpRenderTemplate = (template, data) => {
    // Replace other placeholders
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
};

module.exports = { eventrenderTemplate, banquetrenderTemplate, roomrenderTemplate, eventrenderDependentTemplate, otpRenderTemplate };
