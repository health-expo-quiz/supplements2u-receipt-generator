const { jsPDF } = window.jspdf;

document.getElementById('receiptForm').addEventListener('submit', function (e) {
    e.preventDefault();
    generateReceipt();
});

// Fix card details toggle
document.getElementById('paymentMethod').addEventListener('change', function () {
    const cardDetails = document.getElementById('cardDetails');
    if (this.value === 'Card') {
        cardDetails.classList.remove('hidden');
    } else {
        cardDetails.classList.add('hidden');
    }
});

function addItem() {
    const itemsDiv = document.getElementById('items');
    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.innerHTML = `
        <input type="text" class="itemName" placeholder="Item Name">
        <input type="number" class="itemQty" placeholder="Qty" min="0">
        <input type="number" class="itemPrice" placeholder="Price ($)" min="0" step="0.01">
    `;
    itemsDiv.appendChild(newItem);
}

function generateReceipt() {
    try {
        // Get form values
        const customerEmail = document.getElementById('customerEmail').value;
        if (!customerEmail) {
            alert("Customer Email is required!");
            return;
        }
        const dateInput = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        const timeInput = document.getElementById('time').value || new Date().toTimeString().slice(0, 5);
        const paymentMethod = document.getElementById('paymentMethod').value;
        const cardType = document.getElementById('cardType').value;
        const lastFour = document.getElementById('lastFour').value || "N/A";

        const dateObj = new Date(dateInput);
        const date = dateObj.toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });
        const time = timeInput + (parseInt(timeInput.split(':')[0]) >= 12 ? ' PM' : ' AM');
        const formattedDateTime = `${date} at ${time}`;

        const orderNumber = Math.floor(100000 + Math.random() * 900000);
        const items = [];
        const itemElements = document.getElementsByClassName('item');
        for (let item of itemElements) {
            const name = item.querySelector('.itemName').value;
            const qty = parseInt(item.querySelector('.itemQty').value) || 0;
            const price = parseFloat(item.querySelector('.itemPrice').value) || 0;
            if (name && qty > 0 && price > 0) {
                items.push({ name, qty, price });
            }
        }

        const abn = "81 192 583 026"; // Believable static ABN (replace with random logic if needed)
        const phone = "08 9381 2345"; // Placeholder phone number
        const address = "21A Rokeby Street\nSubiaco WA 6008\nAustralia";
        const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const paymentText = paymentMethod === "Card" && lastFour !== "N/A" 
            ? `Paid via ${cardType} •••• •••• •••• ${lastFour}` 
            : `Paid via ${paymentMethod}`;

        const receiptContent = `
            <h1 style="text-align: center; color: #006064;">Rokeby St Pharmacy</h1>
            <p style="text-align: center; font-style: italic; color: #7f8c8d;">Caring for Your Health</p>
            <div class="flash-sale-banner">FLASH SALE! 50% OFF COSMETICS</div>
            <p style="text-align: center;">${address.replace(/\n/g, '<br>')}</p>
            <p style="text-align: center;">ABN: ${abn} | Phone: ${phone}</p>
            <p><strong>Order #${orderNumber}</strong></p>
            <p><strong>Transaction Date:</strong> ${formattedDateTime}</p>
            <hr>
            <h3>Items Purchased</h3>
            <table>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
                ${items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center;">${item.qty}</td>
                        <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                        <td style="text-align: right;">$${(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Grand Total</td>
                    <td style="text-align: right;">$${total.toFixed(2)}</td>
                </tr>
            </table>
            <hr>
            <p><strong>Payment:</strong> ${paymentText}</p>
            <div class="banner">Visit Us Again for Your Health Needs!</div>
            <div class="qr-placeholder">Scan for Prescription Refills</div>
            <p style="text-align: center; margin-top: 20px; font-weight: bold;">Thank You for Choosing Rokeby St Pharmacy!</p>
            <p style="text-align: center; font-size: 10px;">All prices in AUD and include GST</p>
        `;

        document.getElementById('receiptPreview').innerHTML = receiptContent;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        doc.addImage('rokeby-st-pharmacy.png', 'PNG', 85, 5, 40, 40); // Update path as needed
        doc.setFontSize(22);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(0, 96, 100);
        doc.text("Rokeby St Pharmacy", 105, 50, { align: "center" });
        doc.setFontSize(11);
        doc.setFont("Helvetica", "italic");
        doc.setTextColor(127, 140, 141);
        doc.text("Caring for Your Health", 105, 57, { align: "center" });

        // Flash Sale Banner in PDF
        doc.setFillColor(255, 0, 0); // Red background
        doc.rect(20, 60, 170, 8, "F");
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(255, 255, 255); // White text
        doc.text("FLASH SALE! 50% OFF COSMETICS", 105, 66, { align: "center" });

        // Address and ABN with no overlap
        doc.setFontSize(11);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(51, 51, 51);
        doc.text(address, 105, 75, { align: "center", maxWidth: 110 }); // Address at y=75
        doc.text(`ABN: ${abn}  |  Phone: ${phone}`, 105, 90, { align: "center" }); // ABN/Phone at y=90
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 96, 100);
        doc.line(20, 95, 190, 95); // Line moved to y=95

        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.text(`Order #${orderNumber}`, 20, 105); // Adjusted y
        doc.setFont("Helvetica", "normal");
        doc.text(`Date: ${formattedDateTime}`, 20, 113); // Adjusted y

        doc.setFontSize(14);
        doc.setFont("Helvetica", "bold");
        doc.text("Items Purchased", 20, 125); // Adjusted y
        let y = 132; // Adjusted starting y for table
        doc.setFontSize(10);
        doc.setFillColor(0, 96, 100);
        doc.rect(20, y, 170, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("Item", 22, y + 4);
        doc.text("Qty", 130, y + 4, { align: "center" });
        doc.text("Unit Price", 150, y + 4, { align: "right" });
        doc.text("Total", 180, y + 4, { align: "right" });
        y += 6;

        doc.setTextColor(51, 51, 51);
        doc.setFont("Helvetica", "normal");
        items.forEach((item, index) => {
            doc.setFillColor(index % 2 === 0 ? 247 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 252 : 255);
            doc.rect(20, y, 170, 6, "F");
            doc.text(item.name.slice(0, 45), 22, y + 4);
            doc.text(item.qty.toString(), 130, y + 4, { align: "center" });
            doc.text(`$${item.price.toFixed(2)}`, 150, y + 4, { align: "right" });
            doc.text(`$${(item.price * item.qty).toFixed(2)}`, 180, y + 4, { align: "right" });
            y += 6;
        });

        doc.setFillColor(224, 242, 241);
        doc.rect(20, y, 170, 6, "F");
        doc.setFont("Helvetica", "bold");
        doc.text("Grand Total", 150, y + 4, { align: "right" });
        doc.text(`$${total.toFixed(2)}`, 180, y + 4, { align: "right" });
        y += 12;

        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(51, 51, 51);
        doc.text(paymentText, 20, y);
        y += 10;

        doc.setFillColor(224, 247, 250);
        doc.rect(20, y, 170, 10, "F");
        doc.setTextColor(0, 96, 100);
        doc.setFontSize(10);
        doc.text("Visit Us Again for Your Health Needs!", 105, y + 7, { align: "center" });
        y += 15;

        doc.addImage('frame.png', 'PNG', 85, y, 40, 40); // Update path as needed
        doc.setFontSize(9);
        doc.setTextColor(51, 51, 51);
        doc.text("Scan for Prescription Refills", 105, y + 45, { align: "center" });
        y += 56;

        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 8;
        doc.setFontSize(13);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(0, 96, 100);
        doc.text("Thank You for Choosing Rokeby St Pharmacy!", 105, y, { align: "center" });
        doc.setFontSize(9);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(127, 140, 141);
        doc.text("All prices in AUD and include GST", 105, y + 7, { align: "center" });

        const pdfOutput = doc.output('blob');
        const url = URL.createObjectURL(pdfOutput);
        const link = document.createElement('a');
        link.href = url;
        link.download = `RokebyStPharmacy_Receipt_${date.replace(/\s/g, '_')}_${time.replace(':', '').replace(' ', '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Check the console (F12) for details.");
    }
}
