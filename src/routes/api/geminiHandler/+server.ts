import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import type { RequestHandler } from "@sveltejs/kit";
import { Buffer } from "buffer";
import { writeFileSync } from "fs";
import { join } from "path";

const MAX_SUMMARY_CHARS = 120;
const PROMPT_TEXT = `Summarize the document to ${MAX_SUMMARY_CHARS} characters.`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GEMINI_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const { fileName, fileSize, base64Content, mimeType } = await request.json();

  console.log(`geminiHandler received file ${fileName} with MIME type ${mimeType}`);

  try {

    const decodedFile = Buffer.from(base64Content, "base64");

    if (decodedFile.length !== fileSize) {
      return new Response(JSON.stringify({
        error: "decoded base64 file size mismatch"
      }), { status: 400 });
    }

    return new Response(JSON.stringify({ status: 200, body: { summary: "simulated summary" } }));

    const filePath = join("/tmp/", fileName);
    writeFileSync(filePath, decodedFile);

    console.log(`File saved to ${filePath}`);

    const uploadResponse = await fileManager.uploadFile(
      filePath,
      {
        mimeType, // Example: "application/pdf"
        displayName: fileName, // Example: "Gemini 1.5 PDF"
      }
    );

    console.log(
      `uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: PROMPT_TEXT },
    ]);

    return new Response(JSON.stringify({
      status: 200,
      body: {
        summary: result.response.text()
      },
    }));
  } catch (error) {
    console.error("error uploading file or generating summary:", error);
    return new Response(JSON.stringify({
      status: 500,
      body: {
        error: error.message,
      },
    }));
  }
};

