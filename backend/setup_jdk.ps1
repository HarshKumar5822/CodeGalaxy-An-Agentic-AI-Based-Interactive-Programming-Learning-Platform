$ErrorActionPreference = 'Stop'
$Url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse"
$ZipPath = "C:\Users\harsh\Desktop\codegalaxy\CodeGalaxy AD\backend\jdk.zip"
$DestPath = "C:\Users\harsh\Desktop\codegalaxy\CodeGalaxy AD\backend\jdk"

Write-Host "Downloading portable JDK 17 using curl..."
curl.exe -L $Url -o $ZipPath

Write-Host "Extracting JDK..."
if (Test-Path $DestPath) {
    Remove-Item $DestPath -Recurse -Force
}
New-Item -ItemType Directory -Path $DestPath -Force | Out-Null
Expand-Archive -Path $ZipPath -DestinationPath $DestPath -Force

Write-Host "Cleaning up zip file..."
Remove-Item $ZipPath -Force

Write-Host "Locating java and javac..."
$BinDir = Get-ChildItem -Path $DestPath -Filter "bin" -Recurse | Select-Object -First 1
if ($BinDir) {
    $Javac = Join-Path $BinDir.FullName "javac.exe"
    $Java = Join-Path $BinDir.FullName "java.exe"
    if ((Test-Path $Javac) -and (Test-Path $Java)) {
        Write-Host "JDK successfully setup!"
        Write-Host "JAVAC_PATH: $Javac"
        Write-Host "JAVA_PATH: $Java"
    } else {
        throw "Could not find java or javac executables in bin folder"
    }
} else {
    throw "Could not locate bin folder inside extracted JDK archive"
}
