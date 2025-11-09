# Wrapper script for npx that ensures correct Node.js path
$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;$env:PATH"

# Get all arguments and pass them to npx
$arguments = $args

# Execute npx with all arguments
& "$nodePath\npx.cmd" @arguments

# Exit with the same code as npx
exit $LASTEXITCODE

