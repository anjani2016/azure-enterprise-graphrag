package com.centauri.rag.graph.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * Deterministic enterprise document rendering engine using Apache PDFBox.
 * Directly constructs PDF graphics, coordinates, and typography with zero browser dependency.
 */
@Service
public class DeterministicPdfBoxRenderer {

    private static final Logger log = LoggerFactory.getLogger(DeterministicPdfBoxRenderer.class);

    public record AdjudicationBriefData(
            String claimId,
            String policyNumber,
            String claimantName,
            double claimedAmountUsd,
            String status,
            List<String> triggeredExclusions,
            List<String> policyConditions,
            String recommendation
    ) {}

    public byte[] renderAdjudicationBrief(AdjudicationBriefData data) throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            try (PDPageContentStream stream = new PDPageContentStream(doc, page)) {
                drawHeader(stream, data.claimId());
                drawMetadataGrid(stream, data);
                drawExclusionTable(stream, data.triggeredExclusions(), data.policyConditions());
                drawRecommendation(stream, data.recommendation());
                drawFooter(stream);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            log.info("Rendered deterministic PDFBox brief for claim: {}, size: {} bytes", data.claimId(), baos.size());
            return baos.toByteArray();
        }
    }

    private void setColor(PDPageContentStream stream, int r, int g, int b) throws IOException {
        stream.setNonStrokingColor(r / 255.0f, g / 255.0f, b / 255.0f);
    }

    private void drawHeader(PDPageContentStream stream, String claimId) throws IOException {
        PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        setColor(stream, 15, 23, 42); // Navy background bar
        stream.addRect(40, 720, 532, 50);
        stream.fill();

        setColor(stream, 255, 255, 255);
        stream.beginText();
        stream.setFont(bold, 16);
        stream.newLineAtOffset(55, 745);
        stream.showText("CENTAURI RESEARCH · CLAIMS ADJUDICATION BRIEF");
        stream.endText();

        stream.beginText();
        stream.setFont(normal, 10);
        stream.newLineAtOffset(55, 730);
        stream.showText("Reference: " + claimId + " | Deterministic PDFBox Engine v3.0");
        stream.endText();
    }

    private void drawMetadataGrid(PDPageContentStream stream, AdjudicationBriefData data) throws IOException {
        PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        setColor(stream, 241, 245, 249);
        stream.addRect(40, 620, 532, 85);
        stream.fill();

        setColor(stream, 30, 41, 59);
        stream.beginText();
        stream.setFont(bold, 11);
        stream.newLineAtOffset(55, 680);
        stream.showText("Policy Number: ");
        stream.setFont(normal, 11);
        stream.showText(data.policyNumber());

        stream.newLineAtOffset(250, 0);
        stream.setFont(bold, 11);
        stream.showText("Claimant: ");
        stream.setFont(normal, 11);
        stream.showText(data.claimantName());

        stream.newLineAtOffset(-250, -25);
        stream.setFont(bold, 11);
        stream.showText("Claimed Amount: ");
        stream.setFont(normal, 11);
        stream.showText("$" + String.format("%,.2f", data.claimedAmountUsd()));

        stream.newLineAtOffset(250, 0);
        stream.setFont(bold, 11);
        stream.showText("Adjudication Status: ");
        stream.setFont(bold, 11);
        stream.showText(data.status());
        stream.endText();
    }

    private void drawExclusionTable(PDPageContentStream stream, List<String> exclusions, List<String> conditions) throws IOException {
        PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

        setColor(stream, 15, 23, 42);
        stream.beginText();
        stream.setFont(bold, 12);
        stream.newLineAtOffset(40, 580);
        stream.showText("TRIGGERED EXCLUSIONS & APPLICABLE POLICY CONDITIONS");
        stream.endText();

        int y = 550;
        for (String excl : exclusions) {
            drawRow(stream, y, "EXCLUSION", excl, 220, 38, 38);
            y -= 30;
        }
        for (String cond : conditions) {
            drawRow(stream, y, "CONDITION", cond, 180, 83, 9);
            y -= 30;
        }
    }

    private void drawRow(PDPageContentStream stream, int y, String label, String text, int r, int g, int b) throws IOException {
        PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        setColor(stream, r, g, b);
        stream.addRect(40, y - 5, 80, 20);
        stream.fill();

        setColor(stream, 255, 255, 255);
        stream.beginText();
        stream.setFont(bold, 9);
        stream.newLineAtOffset(45, y);
        stream.showText(label);
        stream.endText();

        setColor(stream, 30, 41, 59);
        stream.beginText();
        stream.setFont(normal, 10);
        stream.newLineAtOffset(130, y);
        stream.showText(text);
        stream.endText();
    }

    private void drawRecommendation(PDPageContentStream stream, String text) throws IOException {
        PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

        setColor(stream, 15, 23, 42);
        stream.beginText();
        stream.setFont(bold, 12);
        stream.newLineAtOffset(40, 420);
        stream.showText("ADJUDICATION COUNSEL RECOMMENDATION");
        stream.endText();

        setColor(stream, 71, 85, 105);
        stream.beginText();
        stream.setFont(normal, 10);
        stream.newLineAtOffset(40, 395);
        stream.showText(text);
        stream.endText();
    }

    private void drawFooter(PDPageContentStream stream) throws IOException {
        PDType1Font normal = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        setColor(stream, 148, 163, 184);
        stream.beginText();
        stream.setFont(normal, 8);
        stream.newLineAtOffset(40, 40);
        stream.showText("Generated by Centauri Research Apache PDFBox Deterministic Engine | Timestamp: " + Instant.now());
        stream.endText();
    }
}
