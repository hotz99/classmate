import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import type { RequestHandler } from "@sveltejs/kit";
import { Buffer } from "buffer";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import courseData from "$lib/data/courses.json";
import XXH from "xxhashjs";

const tmpDir = join("/tmp", "geminiHandler");

if (!existsSync(tmpDir)) {
  mkdirSync(tmpDir, { recursive: true });
}

const courseNames: string[] = Object.values(courseData)
  .flatMap((year) => [...year.semester1, ...year.semester2])
  .map((course) => course.name);

const MAX_SUMMARY_CHARS = 120;
const INITIAL_PROMPT_TEXT = `Summarize the document to ${MAX_SUMMARY_CHARS} characters. Classify the attached file content with one of the available tags: ${courseNames}. Return object literal: {"summary": string, "tag": string}`;

// persistent cache
const cacheFilePath = join(tmpDir, "cache.json");
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

      const responseJson = JSON.parse(filesToGeminiResponses.get(hash));
      return new Response(JSON.stringify({
        status: 200,
        body: {
          summary: responseJson.summary,
          tag: responseJson.tag
        },
      }));
    }

    if (decodedFile.length !== fileSize) {
      return new Response(JSON.stringify({
        error: "decoded base64 file size mismatch"
      }), { status: 400 });
    }

    const filePath = join(tmpDir, fileName);
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
    // because gemini adds code blocks around the JSON response
    // even when told not to
    const cleanedResponse = result.response.text().replace(/```json\n|```/g, '');
    filesToGeminiResponses.set(hash, cleanedResponse);
    saveCacheToFile();

    console.log(`total response time: ${Date.now() - totalResponseTimeStart}ms`);

    const responseJson = JSON.parse(cleanedResponse);

    return new Response(JSON.stringify({
      status: 200,
      body: {
        summary: responseJson.summary,
        tag: responseJson.tag
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
