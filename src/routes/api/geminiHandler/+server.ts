import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import type { RequestHandler } from "@sveltejs/kit";
import { Buffer } from "buffer";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import courseData from "$lib/data/courses.json";
import XXH from "xxhashjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TMP_DIR = join(__dirname, "tmp");

if (!existsSync(TMP_DIR)) {
  mkdirSync(TMP_DIR, { recursive: true });
}

const courseNames: string[] = Object.values(courseData)
  .flatMap((year) => [...year.semester1, ...year.semester2])
  .map((course) => course.name);

const MAX_SUMMARY_CHARS = 120;
const INITIAL_PROMPT_TEXT = `Summarize the document to ${MAX_SUMMARY_CHARS} characters. Classify the attached file content with one of the available tags: ${courseNames}. Format your response as [SUMMARY: ..., TAG: ...]`;

// persistent cache
const cacheFilePath = join(TMP_DIR, "cache.json");
// cache
let filesToGeminiResponses = new Map<string, string>();

function saveCacheToFile() {
  try {
    const cacheData = JSON.stringify([...filesToGeminiResponses]);
    writeFileSync(cacheFilePath, cacheData);
    console.log("cache saved successfully");
  } catch (error) {
    console.error("error saving cache:", error);
  }
}

function loadCacheFromFile() {
  if (existsSync(cacheFilePath)) {
    try {
      const cacheData = readFileSync(cacheFilePath, "utf-8");
      filesToGeminiResponses = new Map(JSON.parse(cacheData));
      console.log("cache loaded successfully.");
    } catch (error) {
      console.error("error loading cache:", error);
    }
  } else {
    console.log("no cache file found. starting with an empty cache.");
  }
}

// load on startup
loadCacheFromFile();

function decodeGeminiResponse(response: string): { summary: string, tag: string } {
  const regex = /\[SUMMARY: (.+?), TAG: (.+?)\]/;

  const match = response.match(regex);

  if (match) {
    const summary = match[1].trim();
    const tag = match[2].trim();

    return { summary, tag };
  } else {
    console.log("gemini response does not match expected format");
    return { summary: "", tag: "" };
  }
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});
const fileManager = new GoogleAIFileManager(import.meta.env.VITE_GEMINI_KEY);

export const POST: RequestHandler = async ({ request }) => {
  const totalResponseTimeStart = Date.now();

  const { fileName, fileSize, base64Content, mimeType, adjustVerbosity, summaryToBeAdjusted } = await request.json();

  // if set no other fields besides summaryToBeAdjusted are expected
  if (adjustVerbosity) {
    try {
      const regenResponseTimeStart = Date.now();
      const response = await model.generateContent(`Make the summary more ${adjustVerbosity == 1 ? "verbose" : "concise"}: "${summaryToBeAdjusted}"`);

      console.log(`regenerating summary took ${Date.now() - regenResponseTimeStart}ms (${adjustVerbosity == 1 ? "increased" : "decreased"} verbosity)`);

      return new Response(JSON.stringify({
        status: 200,
        body: {
          newSummary: (response.response.text())
        },
      }));
    } catch (error) {
      console.error("error regenerating summary:", error);
      return new Response(JSON.stringify({
        status: 500,
        body: {
          error: error.message,
        },
      }));
    }
  }

  console.log(`geminiHandler received file ${fileName} with MIME type ${mimeType}`);

  try {

    const decodedFile = Buffer.from(base64Content, "base64");

    const hash = XXH.h32(decodedFile, 0xDEADBEEF).toString(16);

    if (filesToGeminiResponses.has(hash)) {
      console.log("cache hit: ", fileName);

      return new Response(JSON.stringify({
        status: 200,
        body: {
          geminiResponse: decodeGeminiResponse(filesToGeminiResponses.get(hash)!)
        },
      }));
    }

    if (decodedFile.length !== fileSize) {
      return new Response(JSON.stringify({
        error: "decoded base64 file size mismatch"
      }), { status: 400 });
    }

    const filePath = join(TMP_DIR, fileName);
    writeFileSync(filePath, decodedFile);

    console.log(`file saved to ${filePath}`);

    const geminiUploadFileStart = Date.now();

    const uploadResponse = await fileManager.uploadFile(
      filePath,
      {
        mimeType,
        displayName: fileName,
      }
    );

    console.log(`upload took ${Date.now() - geminiUploadFileStart}ms`);

    console.log(
      `uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );



    const geminiResponseTimeStart = Date.now();

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: INITIAL_PROMPT_TEXT },
    ]);

    console.log(`gemini took ${Date.now() - geminiResponseTimeStart}ms`);

    console.log("adding to cache: ", fileName);
    filesToGeminiResponses.set(hash, result.response.text());
    saveCacheToFile();

    console.log(`total response time: ${Date.now() - totalResponseTimeStart}ms`);

    return new Response(JSON.stringify({
      status: 200,
      body: {
        geminiResponse: decodeGeminiResponse(result.response.text())
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
