import { rm, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, basename } from "node:path";
import { marked } from "marked";
import yaml from "js-yaml";

const config = yaml.load(await readFile("./config.yaml", "utf-8"));
const templateHTML = await readFile("./template.html", "utf-8");

await rm(config.outputDir, { recursive: true, force: true });
await mkdir(config.outputDir);

const files = await readdir(config.inputDir);

const navigationItems = files.map((file) => {
  if (extname(file) !== ".md") return null;
  const name = basename(file, ".md");
  return `<li><a href="${name}.html">${name}</a></li>`;
});

const navigation = `<ul>${navigationItems.join("")}</ul>`;

files.forEach(async (file) => {
  if (extname(file) !== ".md") return;

  const markdownFilePath = join(config.inputDir, file);
  const htmlFilePath = join(config.outputDir, basename(file, ".md") + ".html");

  const data = await readFile(markdownFilePath, "utf-8");
  const htmlContent = templateHTML
    .replace(/<!-- language -->/g, config.language)
    .replace(/<!-- siteTitle -->/g, config.siteTitle)
    .replace(/<!-- navigation -->/g, navigation)
    .replace(/<!-- content -->/g, marked(data));

  await writeFile(htmlFilePath, htmlContent);
  console.log(`Generated ${htmlFilePath}`);
});
