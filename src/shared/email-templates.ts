import fs from "fs/promises";
import path from "path";

export class ParseHTMLTemplate {
  static async parse(
    template: string,
    data: Record<string, string>
  ): Promise<string> {
    const route = path.resolve(
      __dirname,
      "../../src/presentation/templates",
      `${template}.html`
    );
    console.log(route);
    let htmlBody = await fs.readFile(route, "utf-8");
    htmlBody = htmlBody.replace(/{{(.*?)}}/g, (_, varName) => {
      return data[varName] ?? "";
    });
    return htmlBody;
  }
}
