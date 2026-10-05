const axios = require('axios');

const COMPILER_API_URL = 'https://wandbox.org/api/compile.json';
const LIST_API_URL = 'https://wandbox.org/api/list.json';

let cachedCompilers = null;

const getStableCompilers = async () => {
  if (cachedCompilers) return cachedCompilers;

  try {
    const response = await axios.get(LIST_API_URL);
    const allCompilers = response.data;

    const findCompiler = (langName, prefix) => {
      const matches = allCompilers.filter(
        (c) => c.language === langName && c.name.startsWith(prefix) && !c.name.includes('head')
      );
      return matches.length > 0 ? matches[matches.length - 1].name : `${prefix}head`;
    };

    cachedCompilers = {
      cpp: { language: 'c++', compiler: findCompiler('C++', 'gcc-'), version: 'GCC Stable' },
      python: { language: 'python', compiler: findCompiler('Python', 'cpython-'), version: 'Python Stable' },
      javascript: { language: 'javascript', compiler: findCompiler('JavaScript', 'nodejs-'), version: 'Node.js Stable' },
      java: { language: 'java', compiler: findCompiler('Java', 'openjdk-'), version: 'Java Stable' },
    };

    console.log('✅ Fetched stable Wandbox compilers:', Object.values(cachedCompilers).map(c => c.compiler));
    return cachedCompilers;
  } catch (error) {
    console.error('⚠️ Failed to fetch compiler list. Using safe fallbacks.');
    return {
      cpp: { language: 'c++', compiler: 'gcc-13.2.0', version: 'GCC 13.2' },
      python: { language: 'python', compiler: 'cpython-3.11.4', version: 'Python 3.11' },
      javascript: { language: 'javascript', compiler: 'nodejs-18.16.0', version: 'Node.js 18' },
      java: { language: 'java', compiler: 'openjdk-jdk-21.0.1+12', version: 'Java 21' },
    };
  }
};

const executeCode = async (language, sourceCode, stdin = '') => {
  const compilers = await getStableCompilers();
  const runtimeConfig = compilers[language.toLowerCase()];

  if (!runtimeConfig) {
    const error = new Error(`Unsupported language: ${language}`);
    error.statusCode = 400;
    throw error;
  }

  const processedCode =
    language.toLowerCase() === 'java'
      ? sourceCode.replace(/public\s+class\s+/g, 'class ')
      : sourceCode;

  try {
    const response = await axios.post(
      COMPILER_API_URL,
      {
        compiler: runtimeConfig.compiler,
        code: processedCode,
        stdin: stdin,
      },
      { timeout: 15000 }
    );

    const data = response.data;

    return {
      language: runtimeConfig.language,
      version: runtimeConfig.version,
      compileError: data.compiler_error || null,
      stdout: data.program_output || '',
      stderr: data.program_error || '',
      output: data.program_message || data.compiler_message || '',
      exitCode: data.status !== undefined ? Number(data.status) : 0,
    };
  } catch (error) {
    const customError = new Error(
      error.response?.data?.message || 'Failed to execute code on compiler server'
    );
    customError.statusCode = 502;
    throw customError;
  }
};

module.exports = {
  executeCode,
};