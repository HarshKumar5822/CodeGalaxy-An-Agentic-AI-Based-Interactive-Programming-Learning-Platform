const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dirCodes = path.join(__dirname, '..', 'temp_codes');
const dirOutputs = path.join(__dirname, '..', 'temp_outputs');

if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}
if (!fs.existsSync(dirOutputs)) {
    fs.mkdirSync(dirOutputs, { recursive: true });
}

const generateFile = async (format, content) => {
    const jobId = uuidv4();
    const filename = `${jobId}.${format}`;
    const filepath = path.join(dirCodes, filename);
    await fs.promises.writeFile(filepath, content);
    return filepath;
};

// Shared exec runner. IMPORTANT: presence of stderr output does NOT mean the program failed —
// compilers routinely emit warnings on stderr for perfectly valid programs, and some languages
// (Node included) log diagnostics there too. The only reliable failure signal from `exec` is a
// non-null `error` (which `child_process` sets when the command exits with a non-zero code, is
// killed by the timeout, or fails to spawn at all). We still surface stderr text to the caller
// (as part of the rejection) so it can be shown in the terminal/diagnosed by the AI repair bot,
// but we no longer treat "wrote something to stderr" as "the run failed".
const runShell = (command, options = {}) => {
    return new Promise((resolve, reject) => {
        exec(command, { timeout: 8000, maxBuffer: 1024 * 1024 * 10, ...options }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed || error.signal === 'SIGTERM') {
                    reject({ error, stderr: stderr || 'Execution timed out (exceeded 8s time limit).' });
                    return;
                }
                reject({ error, stderr: stderr || error.message });
                return;
            }
            // Success: resolve with stdout even if stderr has warnings, and surface those
            // warnings alongside the output so the user can still see them in the terminal.
            resolve(stderr ? `${stdout}${stdout && stderr ? '\n' : ''}${stderr}` : stdout);
        });
    });
};

const executeCpp = (filepath, inputFilePath) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outPath = path.join(dirOutputs, `${jobId}.exe`);
    const inputRedirect = inputFilePath ? ` < "${inputFilePath}"` : '';
    return runShell(`g++ "${filepath}" -o "${outPath}" && cd "${dirOutputs}" && "${jobId}.exe"${inputRedirect}`);
};

const executeC = (filepath, inputFilePath) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outPath = path.join(dirOutputs, `${jobId}.exe`);
    const inputRedirect = inputFilePath ? ` < "${inputFilePath}"` : '';
    return runShell(`gcc "${filepath}" -o "${outPath}" && cd "${dirOutputs}" && "${jobId}.exe"${inputRedirect}`);
};

const executePython = (filepath, inputFilePath) => {
    const inputRedirect = inputFilePath ? ` < "${inputFilePath}"` : '';
    // Prefer `python3` when available (most non-Windows environments only ship python3);
    // fall back to `python` (typical on Windows) if that command isn't found.
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3';
    return runShell(`${pythonBin} "${filepath}"${inputRedirect}`).catch((err) => {
        if (pythonBin === 'python3') {
            return runShell(`python "${filepath}"${inputRedirect}`);
        }
        throw err;
    });
};

const executeJavaScript = (filepath, inputFilePath) => {
    const inputRedirect = inputFilePath ? ` < "${inputFilePath}"` : '';
    return runShell(`node "${filepath}"${inputRedirect}`);
};

const getJavaPaths = () => {
    const localJdkDir = path.join(__dirname, '..', 'jdk');
    if (fs.existsSync(localJdkDir)) {
        // Find the bin directory inside the local JDK dir recursively
        const findBinDir = (dir) => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    if (file === 'bin') {
                        return fullPath;
                    } else {
                        const bin = findBinDir(fullPath);
                        if (bin) return bin;
                    }
                }
            }
            return null;
        };

        const binDir = findBinDir(localJdkDir);
        if (binDir) {
            const javac = path.join(binDir, 'javac.exe');
            const java = path.join(binDir, 'java.exe');
            if (fs.existsSync(javac) && fs.existsSync(java)) {
                return { javac: `"${javac}"`, java: `"${java}"` };
            }
        }
    }
    // Fallback to global commands if local JDK is not set up
    return { javac: 'javac', java: 'java' };
};

const executeJava = async (filepath, inputFilePath) => {
    // Java requires the public class name to match the file name. We detect the declared
    // public class name from the source instead of forcing everything to be named "Main",
    // so AI-generated or user-written code using other class names (e.g. "Solution") still runs.
    const content = await fs.promises.readFile(filepath, 'utf8');
    const classMatch = content.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
    const className = classMatch ? classMatch[1] : 'Main';

    const jobId = uuidv4();
    const jobDir = path.join(dirCodes, jobId);
    await fs.promises.mkdir(jobDir, { recursive: true });
    const newFilepath = path.join(jobDir, `${className}.java`);
    await fs.promises.writeFile(newFilepath, content);

    const inputRedirect = inputFilePath ? ` < "${inputFilePath}"` : '';
    const paths = getJavaPaths();

    try {
        return await runShell(`cd "${jobDir}" && ${paths.javac} ${className}.java && ${paths.java} ${className}${inputRedirect}`);
    } finally {
        // Java leaves compiled .class files + a per-job directory behind; clean it up.
        setTimeout(() => {
            fs.promises.rm(jobDir, { recursive: true, force: true }).catch(() => {});
        }, 1000);
    }
};


const runCode = async (language, code, expectedInput = "") => {
    let format = language;
    if (language === 'javascript') format = 'js';
    if (language === 'python') format = 'py';
    if (language === 'c++' || language === 'cpp') format = 'cpp';
    if (language === 'c') format = 'c';
    if (language === 'java') format = 'java';

    const filepath = await generateFile(format, code);

    let inputFilePath = null;
    if (expectedInput && expectedInput.trim().length > 0) {
        inputFilePath = await generateFile('txt', expectedInput);
    }

    let result = '';
    let isError = false;
    let timeTaken = 0;

    const startTime = Date.now();
    try {
        if (format === 'cpp') {
            result = await executeCpp(filepath, inputFilePath);
        } else if (format === 'c') {
            result = await executeC(filepath, inputFilePath);
        } else if (format === 'py') {
            result = await executePython(filepath, inputFilePath);
        } else if (format === 'js') {
            result = await executeJavaScript(filepath, inputFilePath);
        } else if (format === 'java') {
            result = await executeJava(filepath, inputFilePath);
        } else {
            throw new Error(`Unsupported language: ${language}`);
        }
    } catch (err) {
        isError = true;
        result = err.stderr || err.error?.message || err.message;
    }
    const endTime = Date.now();
    timeTaken = (endTime - startTime) / 1000;

    // Cleanup files in bg (source, stdin file, and any compiled binary for C/C++)
    setTimeout(() => {
        try { fs.unlinkSync(filepath); } catch (e) { }
        if (inputFilePath) {
            try { fs.unlinkSync(inputFilePath); } catch (e) { }
        }
        if (format === 'cpp' || format === 'c') {
            const jobId = path.basename(filepath).split('.')[0];
            const outPath = path.join(dirOutputs, `${jobId}.exe`);
            try { fs.unlinkSync(outPath); } catch (e) { }
        }
    }, 1500);

    return {
        output: result,
        success: !isError,
        time: timeTaken
    };
};

module.exports = {
    runCode
};
