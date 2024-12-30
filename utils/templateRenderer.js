const eventrenderTemplate = (template, data) => {
    // Replace array placeholders (familyMembers, guests, etc.)
    template = template.replace(/{{familyMembers}}/g, () => {
        return data.familyMembers.length > 0
            ? data.familyMembers
                .map((member, index) => `<p><strong>Family Member ${index + 1}:</strong> ${member.name}</p>`)
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

module.exports = { eventrenderTemplate, banquetrenderTemplate };
