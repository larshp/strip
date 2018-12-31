const fs = require("fs");

function stripDescriptions(lines) {
  let remove = false;
  let result = [];

  for (const line of lines) {
    if (line.match(/^\s*<DESCRIPTIONS>\s*$/)) {
      remove = true;
    }
    if (remove === false) {
      result.push(line);
    }
    if (line.match(/^\s+<\/DESCRIPTIONS>\s*$/)) {
      remove = false;
    }
  }

  return result.join("\n");
}

function stripCLAS(lines) {
  let isFinal = undefined;
  let section = undefined;
  let result = [];

  for (const line of lines) {
    if (line.match(/\sFINAL\s/i) || line.match(/\sFINAL$/i)) {
      isFinal = true;
    } else if (line.match(/\./) && isFinal == undefined) {
      isFinal = false;
    }

    if (line.match(/\s*PROTECTED\s+SECTION/i)) {
      section = "protected";
      result.push(line);
      continue;
    } else if (line.match(/\s*PRIVATE\s+SECTION/i)) {
      section = "private";
      result.push(line);
      continue;
    } else if (line.match(/^\s*METHOD\s+/i) && section === undefined) {
      section = "method";
      result.push(line);
      continue;
    } else if (line.match(/^\s*ENDCLASS/i)) {
      section = undefined;
    } else if (line.match(/^\s*ENDMETHOD/i)) {
      section = undefined;
    }

    if (isFinal === true && section === "protected") {
      continue;
    } else if (section === "private") {
      continue;
    } else if (section === "method") {
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

function strip(folder) {
  console.log(folder);
  const files = fs.readdirSync(folder);
  for (const filename of files) {
    console.log(filename);
    if (filename.match(/\.clas\.locals_def\.abap$/)
        || filename.match(/\.clas\.locals_imp\.abap$/)
        || filename.match(/\.clas\.macros\.abap$/)
        || filename.match(/\.clas\.testclasses\.abap$/)) {
      fs.unlinkSync(folder + filename);
      continue;
    } else if (filename.match(/\.clas\.abap$/)) {
      const raw = fs.readFileSync(folder + filename, "UTF-8");
      fs.writeFileSync(folder + filename, stripCLAS(raw.split("\n")));
    } else if (filename.match(/\.clas\.xml$/) || filename.match(/\.intf\.xml$/)) {
      const raw = fs.readFileSync(folder + filename, "UTF-8");
      fs.writeFileSync(folder + filename, stripDescriptions(raw.split("\n")));
    }

  }
}

function run() {
  let arg = process.argv.slice(2);
  if (arg.length === 0) {
    throw "Supply folder";
  }

  const folder = arg[0];
  strip(folder);
}

try {
  run();
} catch (e) {
  process.stderr.write(e + "\n");
  process.exit(1);
}