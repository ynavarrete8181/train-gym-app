const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sourcesDir = path.join(
  root,
  "node_modules",
  "expo-modules-jsi",
  "apple",
  "Sources",
  "ExpoModulesJSI"
);
const packageManifest = path.join(
  root,
  "node_modules",
  "expo-modules-jsi",
  "apple",
  "Package.swift"
);
const podspec = path.join(
  root,
  "node_modules",
  "expo-modules-jsi",
  "apple",
  "ExpoModulesJSI.podspec"
);

const files = [
  "Contexts/HostFunctionContext.swift",
  "Contexts/HostObjectContext.swift",
  "Runtime/JavaScriptActor.swift",
  "Runtime/JavaScriptPropNameID.swift",
  "Runtime/Values/JavaScriptArray.swift",
  "Runtime/Values/JavaScriptArrayBuffer.swift",
  "Runtime/Values/JavaScriptBigInt.swift",
  "Runtime/Values/JavaScriptError.swift",
  "Runtime/Values/JavaScriptFunction.swift",
  "Runtime/Values/JavaScriptObject.swift",
  "Runtime/Values/JavaScriptPromise.swift",
  "Runtime/Values/JavaScriptTypedArray.swift",
  "Runtime/Values/JavaScriptValue.swift",
  "Runtime/Values/JavaScriptWeakObject.swift",
];

let patched = 0;

function patchFile(file, replacements) {
  if (!fs.existsSync(file)) {
    return false;
  }

  const before = fs.readFileSync(file, "utf8");
  const after = replacements.reduce(
    (content, [from, to]) => content.replace(from, to),
    before
  );

  if (before !== after) {
    fs.writeFileSync(file, after);
    return true;
  }

  return false;
}

for (const relativeFile of files) {
  const file = path.join(sourcesDir, relativeFile);
  if (
    patchFile(file, [
      [/nonisolated\(unsafe\)\s+weak\s+let\s+runtime/g, "nonisolated(unsafe) weak var runtime"],
      [/nonisolated\(unsafe\)\s+weak\s+var\s+runtime/g, "nonisolated(unsafe) weak var runtime"],
      [/weak\s+let\s+runtime/g, "nonisolated(unsafe) weak var runtime"],
      [/(?<!nonisolated\(unsafe\)\s)weak\s+var\s+runtime/g, "nonisolated(unsafe) weak var runtime"],
    ])
  ) {
    patched += 1;
  }
}

if (
  patchFile(packageManifest, [
    [/swiftLanguageModes:\s*\[\.v5\]/, "swiftLanguageModes: [.v6]"],
    [/\n\s*\.unsafeFlags\(\["-enable-bare-slash-regex"\]\),\n/g, "\n"],
  ])
) {
  patched += 1;
}

if (patchFile(podspec, [[/s\.swift_version\s+=\s+'5\.0'/, "s.swift_version  = '6.0'"]])) {
  patched += 1;
}

console.log(
  patched > 0
    ? `Patched expo-modules-jsi Swift compatibility in ${patched} files.`
    : "expo-modules-jsi Swift compatibility already patched."
);
