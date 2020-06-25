const { exec } = require("child_process");
const fs = require("fs");
const https = require("https");

const FONT_DIRECTORY = "C:\\windows\\fonts\\";

module.exports = async (job, settings, { fonts }) => {
  if (!fonts.length) return "No Fonts Supplied";

  const promises = fonts.map(async ({ src, name }) => {
    await getFileFromUrl(src);
    const { stderr } = await exec(
      `reg query HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts /f "${name}"`
    );
    if (!stderr) return "Font already Installed";

    const { stderr, stdout } = await exec(
      `reg add HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts /v ${name} /t REG_SZ /d ${fileName} /f`
    );

    if (stderr) throw new Error("Install Command File");

    return "Installed";
  });

  return Promise.all(promises);
};

const getFileFromUrl = (src) => {
  return new Promise((resolve, reject) => {
    const fileName = src.split("/").pop();
    const filePath = `${FONT_DIRECTORY}${fileName}`;
    const file = fs.createWriteStream(filePath);

    https.get(src, (response) => {
      const stream = response.pipe(file);

      stream.on("finish", function () {
        resolve({ filePath, fileName });
      });
      stream.on("error", reject);
    });
  });
};
