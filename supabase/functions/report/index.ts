import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "npm:docx@9.5.1";

const allowedOrigins = new Set([
  "https://auratio.cloud",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const BRAND_DARK = "041B3B";
const BRAND_ACCENT = "B2CAEB";
const BRAND_BLUE = "53A6E6";
const MUTED = "4B5B6B";
const LIGHT = "F3F7FB";
const SUCCESS_BG = "EAF7F0";
const WARNING_BG = "FFF5E6";

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://auratio.cloud",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function respond(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function uuid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function formatDate(value: unknown): string {
  const date = new Date(asText(value));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDuration(value: unknown): string {
  const total = Math.max(0, Math.floor(Number(value) || 0));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function cell(text: string, bold = false, shade?: string): TableCell {
  return new TableCell({
    shading: shade ? { fill: shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [new TextRun({ text, bold, font: "Inter", size: 20, color: BRAND_DARK })],
      }),
    ],
  });
}

function labelParagraph(label: string, value: string, positive = false): Paragraph {
  return new Paragraph({
    spacing: { after: 110, line: 276 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, font: "Inter", size: 20, color: BRAND_DARK }),
      new TextRun({ text: value, font: "Inter", size: 20, color: positive ? "176B3A" : MUTED }),
    ],
  });
}

function criterionBlock(item: Record<string, unknown>): Table {
  const score = Number(item.score);
  const max = Number(item.max_points);
  const timestamp = formatDuration(item.primary_timestamp_seconds);
  const heading = `${asText(item.criterion_name)}  —  ${score}/${max}`;

  const headingParagraph = new Paragraph({
    heading: HeadingLevel.HEADING_3,
    keepNext: true,
    spacing: { before: 160, after: 90 },
    children: [
      new TextRun({
        text: heading,
        bold: true,
        font: "Inter",
        color: BRAND_DARK,
        size: 23,
      }),
    ],
  });

  const anchorTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
      left: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
      right: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "D9E4EF",
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
        color: "D9E4EF",
      },
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          cell("Anchor", true, LIGHT),
          cell(asText(item.anchor)),
          cell("Primary timestamp", true, LIGHT),
          cell(timestamp),
        ],
      }),
    ],
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
      insideVertical: {
        style: BorderStyle.NONE,
        size: 0,
        color: "FFFFFF",
      },
    },
    rows: [
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              headingParagraph,
              anchorTable,
              labelParagraph(
                "Evidence / Observation",
                asText(item.evidence),
              ),
              labelParagraph("Strength", asText(item.strength), true),
              labelParagraph("Weakness", asText(item.weakness)),
              labelParagraph(
                "Actionable Improvement",
                asText(item.actionable_improvement),
              ),
            ],
          }),
        ],
      }),
    ],
  });
}

async function renderReport(payload: Record<string, unknown>): Promise<Uint8Array> {
  const criteria = Array.isArray(payload.criteria) ? payload.criteria as Record<string, unknown>[] : [];
  const grouped = new Map<string, Record<string, unknown>[]>([
    ["universal_delivery", []],
    ["structural_flow", []],
    ["track_specialisation", []],
  ]);
  for (const item of criteria) {
    const category = asText(item.category);
    if (grouped.has(category)) grouped.get(category)!.push(item);
  }

  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "AURATIO", bold: true, font: "Inter", size: 34, color: BRAND_DARK })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [new TextRun({ text: "Where Greats Orate", italics: true, font: "Inter", size: 20, color: BRAND_BLUE })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 260 },
      children: [new TextRun({ text: "Evaluation Report", bold: true, font: "Inter", size: 32, color: BRAND_DARK })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
        left: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
        right: { style: BorderStyle.SINGLE, size: 2, color: BRAND_ACCENT },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D9E4EF" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "D9E4EF" },
      },
      rows: [
        new TableRow({ children: [cell("Speaker", true, LIGHT), cell(asText(payload.speaker_display_name))] }),
        new TableRow({ children: [cell("Selected track", true, LIGHT), cell(asText(payload.track_name))] }),
        new TableRow({ children: [cell("Evaluation mode", true, LIGHT), cell(asText(payload.mode_label))] }),
        new TableRow({ children: [cell("Submission ID", true, LIGHT), cell(asText(payload.submission_id))] }),
        new TableRow({ children: [cell("Submission date", true, LIGHT), cell(formatDate(payload.submission_date))] }),
        new TableRow({ children: [cell("Report generation date", true, LIGHT), cell(formatDate(payload.report_generation_date))] }),
        new TableRow({ children: [cell("Measured video duration", true, LIGHT), cell(formatDuration(payload.duration_seconds))] }),
      ],
    }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 }, children: [new TextRun({ text: "Score Summary", bold: true, font: "Inter", size: 27, color: BRAND_DARK })] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 2, color: BRAND_BLUE },
        bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_BLUE },
        left: { style: BorderStyle.SINGLE, size: 2, color: BRAND_BLUE },
        right: { style: BorderStyle.SINGLE, size: 2, color: BRAND_BLUE },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
      },
      rows: [
        new TableRow({ children: [cell("Universal Delivery", true, LIGHT), cell(`${payload.universal_score}/40`)] }),
        new TableRow({ children: [cell("Structural Flow", true, LIGHT), cell(`${payload.structural_score}/20`)] }),
        new TableRow({ children: [cell("Track Specialisation", true, LIGHT), cell(`${payload.track_score}/40`)] }),
        new TableRow({ children: [cell("Final Score", true, BRAND_ACCENT), cell(`${payload.final_score}/100`, true, BRAND_ACCENT)] }),
      ],
    }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 }, children: [new TextRun({ text: "Overall Evaluation Summary", bold: true, font: "Inter", size: 27, color: BRAND_DARK })] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
        left: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
        right: { style: BorderStyle.SINGLE, size: 1, color: BRAND_ACCENT },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: SUCCESS_BG, type: ShadingType.CLEAR },
              margins: { top: 150, bottom: 150, left: 160, right: 160 },
              children: [new Paragraph({ spacing: { after: 0, line: 300 }, children: [new TextRun({ text: asText(payload.overall_summary), font: "Inter", size: 21, color: BRAND_DARK })] })],
            }),
          ],
        }),
      ],
    }),
  ];

  const sectionTitles: Record<string, string> = {
    universal_delivery: "Universal Delivery",
    structural_flow: "Structural Flow",
    track_specialisation: "Track Specialisation",
  };

  for (const category of ["universal_delivery", "structural_flow", "track_specialisation"]) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      keepNext: true,
      spacing: { before: 360, after: 100 },
      children: [new TextRun({ text: sectionTitles[category], bold: true, font: "Inter", size: 28, color: BRAND_DARK })],
    }));
    for (const item of grouped.get(category) ?? []) {
      children.push(criterionBlock(item));
    }
  }

  children.push(new Paragraph({
    spacing: { before: 300, after: 0 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "This report is generated from the final Approved structured evaluation stored by Auratio.", font: "Inter", size: 17, color: MUTED, italics: true })],
  }));

  const generatedAt = new Date(asText(payload.report_generation_date));
  const doc = new Document({
    creator: "Auratio",
    title: "Auratio Evaluation Report",
    subject: "Approved communication performance evaluation",
    description: "Auratio — Where Greats Orate",
    lastModifiedBy: "Auratio",
    created: Number.isNaN(generatedAt.getTime()) ? new Date(0) : generatedAt,
    modified: Number.isNaN(generatedAt.getTime()) ? new Date(0) : generatedAt,
    styles: {
      default: {
        document: {
          run: { font: "Inter", size: 20, color: BRAND_DARK },
          paragraph: { spacing: { after: 120, line: 276 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Auratio — Where Greats Orate", font: "Inter", size: 16, color: BRAND_BLUE })],
            }),
          ],
        }),
      },
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return new Uint8Array(buffer);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return respond(req, 405, { error: "method_not_allowed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return respond(req, 500, { error: "server_configuration_error" });

  const accessToken = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!accessToken) return respond(req, 401, { error: "authentication_required" });

  const service = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let actorId: string | null = null;
  if (accessToken !== serviceRoleKey) {
    const { data: authData, error: authError } = await service.auth.getUser(accessToken);
    if (authError || !authData.user) return respond(req, 401, { error: "invalid_session" });
    actorId = authData.user.id;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return respond(req, 400, { error: "invalid_json" });
  }

  const requestId = uuid(body.request_id);
  if (!requestId) return respond(req, 400, { error: "valid_request_id_required" });

  const { data: prep, error: prepError } = await service.rpc("svc_prepare_report_generation", {
    p_actor_user_id: actorId,
    p_request_id: requestId,
  });
  if (prepError) return respond(req, 409, { error: "report_not_available", message: prepError.message });

  const state = asText((prep as Record<string, unknown>)?.state);
  if (state === "ready" || state === "in_progress") return respond(req, 200, prep);

  const claimToken = uuid((prep as Record<string, unknown>)?.claim_token);
  const objectPath = asText((prep as Record<string, unknown>)?.object_path);
  const filename = asText((prep as Record<string, unknown>)?.filename);
  const payload = (prep as Record<string, unknown>)?.payload as Record<string, unknown> | undefined;
  if (!claimToken || !objectPath || !filename) return respond(req, 500, { error: "invalid_report_generation_claim" });

  try {
    let sizeBytes: number | null = null;
    if (state === "generate") {
      if (!payload) throw new Error("Report payload missing");
      const bytes = await renderReport(payload);
      sizeBytes = bytes.byteLength;
      const { error: uploadError } = await service.storage
        .from("evaluation-reports")
        .upload(objectPath, bytes, {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          cacheControl: "31536000",
          upsert: false,
        });
      if (uploadError && !/already exists|duplicate/i.test(uploadError.message ?? "")) throw uploadError;
    } else if (state !== "register_existing") {
      throw new Error(`Unsupported report state: ${state}`);
    }

    const { data: completed, error: completeError } = await service.rpc("svc_complete_report_generation", {
      p_claim_token: claimToken,
      p_size_bytes: sizeBytes,
    });
    if (completeError) throw completeError;
    return respond(req, 200, completed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "report_generation_failed";
    await service.rpc("svc_fail_report_generation", {
      p_claim_token: claimToken,
      p_error: message,
    });
    return respond(req, 500, { error: "report_generation_failed", message });
  }
});
