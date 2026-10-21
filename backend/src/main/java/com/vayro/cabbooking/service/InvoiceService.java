package com.vayro.cabbooking.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.vayro.cabbooking.entity.Ride;
import com.vayro.cabbooking.exception.ResourceNotFoundException;
import com.vayro.cabbooking.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final RideRepository rideRepository;

    public byte[] generateInvoicePdf(UUID rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // Styling colors
            DeviceRgb brandPrimary = new DeviceRgb(20, 110, 245);
            DeviceRgb darkText = new DeviceRgb(30, 41, 59);

            // Header
            Paragraph title = new Paragraph("VAYRO CAB BOOKING")
                    .setFontSize(22)
                    .setBold()
                    .setFontColor(brandPrimary)
                    .setTextAlignment(TextAlignment.LEFT);
            document.add(title);

            Paragraph subtitle = new Paragraph("Official Trip Receipt & Tax Invoice")
                    .setFontSize(12)
                    .setFontColor(ColorConstants.GRAY)
                    .setMarginBottom(20);
            document.add(subtitle);

            // Info Table
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Invoice No: INV-" + ride.getId().toString().substring(0, 8).toUpperCase())));
            infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Date: " + (ride.getCreatedAt() != null ? ride.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")) : "N/A"))));
            infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Rider: " + ride.getRider().getFullName())));
            infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Phone: " + ride.getRider().getPhoneNumber())));

            if (ride.getDriver() != null) {
                infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Driver: " + ride.getDriver().getUser().getFullName())));
                infoTable.addCell(new Cell().setBorder(null).add(new Paragraph("Vehicle: " + ride.getDriver().getVehicleModel() + " (" + ride.getDriver().getVehicleNumber() + ")")));
            }
            document.add(infoTable);

            // Trip Details Table
            Table tripTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            tripTable.addHeaderCell(new Cell(1, 2).setBackgroundColor(brandPrimary).add(new Paragraph("Trip Summary").setFontColor(ColorConstants.WHITE).setBold()));
            tripTable.addCell(new Cell().add(new Paragraph("Pickup:").setBold()));
            tripTable.addCell(new Cell().add(new Paragraph(ride.getPickupAddress())));
            tripTable.addCell(new Cell().add(new Paragraph("Destination:").setBold()));
            tripTable.addCell(new Cell().add(new Paragraph(ride.getDropAddress())));
            tripTable.addCell(new Cell().add(new Paragraph("Distance:").setBold()));
            tripTable.addCell(new Cell().add(new Paragraph(ride.getDistanceKm() + " km")));
            tripTable.addCell(new Cell().add(new Paragraph("Duration:").setBold()));
            tripTable.addCell(new Cell().add(new Paragraph(ride.getDurationMinutes() + " mins")));
            tripTable.addCell(new Cell().add(new Paragraph("Vehicle Category:").setBold()));
            tripTable.addCell(new Cell().add(new Paragraph(ride.getVehicleType().name())));

            document.add(tripTable);

            // Fare Breakdown Table
            Table fareTable = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                    .useAllAvailableWidth()
                    .setMarginBottom(30);

            fareTable.addHeaderCell(new Cell().setBackgroundColor(ColorConstants.LIGHT_GRAY).add(new Paragraph("Description").setBold()));
            fareTable.addHeaderCell(new Cell().setBackgroundColor(ColorConstants.LIGHT_GRAY).add(new Paragraph("Amount (USD)").setBold()));

            fareTable.addCell(new Cell().add(new Paragraph("Base Ride Fare")));
            fareTable.addCell(new Cell().add(new Paragraph("$" + String.format("%.2f", ride.getBaseFare()))));

            if (ride.getPromoCode() != null) {
                fareTable.addCell(new Cell().add(new Paragraph("Promo Discount (" + ride.getPromoCode().getCode() + ")")));
                fareTable.addCell(new Cell().add(new Paragraph("-$" + String.format("%.2f", ride.getBaseFare() - ride.getFinalFare()))));
            }

            fareTable.addCell(new Cell().setBackgroundColor(new DeviceRgb(240, 249, 255)).add(new Paragraph("Total Paid").setBold()));
            fareTable.addCell(new Cell().setBackgroundColor(new DeviceRgb(240, 249, 255)).add(new Paragraph("$" + String.format("%.2f", ride.getFinalFare())).setBold().setFontColor(brandPrimary)));

            document.add(fareTable);

            // Footer
            Paragraph footer = new Paragraph("Thank you for riding with Vayro! For support, reach out to support@vayro.com")
                    .setFontSize(10)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF invoice", e);
        }
    }
}
