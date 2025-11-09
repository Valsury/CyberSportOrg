@echo off
REM Wrapper script for npx that ensures correct Node.js path
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=%NODE_PATH%;%PATH%"

REM Execute npx with all arguments
"%NODE_PATH%\npx.cmd" %*

REM Exit with the same code as npx
exit /b %ERRORLEVEL%

