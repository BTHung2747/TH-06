param(
    [ValidateSet('x86_64', 'arm64-v8a', 'armeabi-v7a', 'x86')]
    [string]$Architecture = 'x86_64',
    [switch]$AllowNetwork,
    [switch]$Run
)

$ErrorActionPreference = 'Stop'
$taskProjectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskJava = if ($env:JAVA_HOME) {
    Join-Path $env:JAVA_HOME 'bin\java.exe'
} else {
    (Get-Command java -ErrorAction Stop).Source
}

if (-not (Test-Path -LiteralPath $taskJava)) {
    throw 'Khong tim thay Java. Kiem tra JAVA_HOME truoc khi build.'
}
$taskVersion = & $taskJava --version | Out-String
if ($taskVersion -notmatch '(openjdk|java) 17\.') { throw 'Du an yeu cau OpenJDK 17.' }
$taskWrapper = Get-Content -LiteralPath (Join-Path $taskProjectRoot 'android/gradle/wrapper/gradle-wrapper.properties') -Raw
if ($taskWrapper -notmatch 'gradle-9\.4\.1-bin.zip') { throw 'Gradle phai giu o 9.4.1.' }
$taskOriginalGradle = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { Join-Path $env:USERPROFILE '.gradle' }
$taskInstalledGradle = Get-ChildItem -Path (Join-Path $taskOriginalGradle 'wrapper/dists/gradle-9.4.1-bin/*/gradle-9.4.1/lib/gradle-gradle-cli-main-9.4.1.jar') -ErrorAction SilentlyContinue | Select-Object -First 1
$taskSavedEnvironment = @{}
foreach ($taskKey in @('GRADLE_USER_HOME', 'GRADLE_RO_DEP_CACHE', 'TEMP', 'TMP')) {
    $taskSavedEnvironment[$taskKey] = [Environment]::GetEnvironmentVariable($taskKey, 'Process')
}

# SUBST gives Android/CMake an ASCII path without copying or moving the project.
$taskDrive = @('R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:') |
    Where-Object { -not (Test-Path -LiteralPath "$_\") } |
    Select-Object -First 1
if (-not $taskDrive) {
    throw 'Khong co ky tu o dia trong de tao duong dan build tam.'
}

& subst.exe $taskDrive $taskProjectRoot
if ($LASTEXITCODE -ne 0) {
    throw 'Khong tao duoc duong dan build tam bang SUBST.'
}

$taskExitCode = 1
try {
    foreach ($taskFolder in @('.cache/gradle', '.cache/tmp')) {
        New-Item -ItemType Directory -Path (Join-Path $taskProjectRoot $taskFolder) -Force | Out-Null
    }
    $env:GRADLE_USER_HOME = "$taskDrive\.cache\gradle"
    $env:GRADLE_RO_DEP_CACHE = Join-Path $taskOriginalGradle 'caches'
    $env:TEMP = "$taskDrive\.cache\tmp"
    $env:TMP = $env:TEMP
    Push-Location "$taskDrive\android"
    try {
        $taskLaunchArgs = if ($taskInstalledGradle) {
            @('-jar', $taskInstalledGradle.FullName)
        } else {
            @('-classpath', 'gradle\wrapper\gradle-wrapper.jar', 'org.gradle.wrapper.GradleWrapperMain')
        }
        $taskBuildArgs = @('-Dfile.encoding=UTF-8', "-Djava.io.tmpdir=$env:TEMP") + $taskLaunchArgs + @(':app:assembleDebug', '--console=plain', '--no-daemon', '--max-workers=2',
            "-PreactNativeArchitectures=$Architecture")
        if (-not $AllowNetwork) { $taskBuildArgs += '--offline' }
        & $taskJava @taskBuildArgs
        $taskExitCode = $LASTEXITCODE
    } finally {
        Pop-Location
    }
} finally {
    foreach ($taskKey in $taskSavedEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($taskKey, $taskSavedEnvironment[$taskKey], 'Process')
    }
    & subst.exe $taskDrive /D
}

if ($taskExitCode -ne 0) {
    throw "Build that bai (ma $taskExitCode). AllowNetwork=$AllowNetwork"
}

Write-Host "APK: $taskProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
if ($Run) {
    $taskSdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
    $taskAdb = Join-Path $taskSdk 'platform-tools/adb.exe'
    & $taskAdb -e get-state
    if ($LASTEXITCODE -ne 0) { throw 'Hay mo may ao Pixel_7 co san roi chay lai lenh.' }
    & $taskAdb -e install -r (Join-Path $taskProjectRoot 'android/app/build/outputs/apk/debug/app-debug.apk')
    if ($LASTEXITCODE -ne 0) { throw 'Khong cai duoc APK.' }
    & $taskAdb -e reverse tcp:8081 tcp:8081
    & $taskAdb -e shell am start -n com.myfirstapp/.MainActivity
}
