[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$VencordPath,
    [switch]$Inject
)

$ErrorActionPreference = 'Stop'

function Test-VencordCheckout([string]$Path) {
    if (-not $Path -or -not (Test-Path -LiteralPath $Path -PathType Container)) { return $false }
    return (Test-Path -LiteralPath (Join-Path $Path 'src\Vencord.ts') -PathType Leaf) -and
        (Test-Path -LiteralPath (Join-Path $Path 'scripts\build\build.mjs') -PathType Leaf) -and
        (Test-Path -LiteralPath (Join-Path $Path 'pnpm-lock.yaml') -PathType Leaf)
}

function Find-VencordCheckouts {
    $directory = Get-Item -LiteralPath $PSScriptRoot
    while ($directory) {
        if (Test-VencordCheckout $directory.FullName) { return $directory.FullName }
        $directory = $directory.Parent
    }

    $documents = [Environment]::GetFolderPath('MyDocuments')
    $desktop = [Environment]::GetFolderPath('DesktopDirectory')
    $roots = @($PWD.Path, $PSScriptRoot, $env:LOCALAPPDATA, $env:APPDATA, $env:USERPROFILE, $documents, $desktop)
    $candidates = foreach ($root in $roots) {
        if (-not $root) { continue }
        $root
        Get-ChildItem -LiteralPath $root -Directory -Filter '*Vencord*' -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty FullName
    }
    $candidates | Where-Object { Test-VencordCheckout $_ } |
        ForEach-Object { (Resolve-Path -LiteralPath $_).Path } | Sort-Object -Unique
}

if (-not $VencordPath -and $env:VENCORD_DIR) { $VencordPath = $env:VENCORD_DIR }
if (-not $VencordPath) {
    $candidates = @(Find-VencordCheckouts)
    if ($candidates.Count -eq 1) { $VencordPath = $candidates[0] }
    elseif ($candidates.Count -gt 1) {
        $candidates | ForEach-Object { Write-Host "  $_" }
        throw 'Mais de um checkout encontrado. Use -VencordPath para escolher.'
    }
    else { throw 'Checkout do Vencord ausente. Use -VencordPath com a raiz da copia do codigo-fonte.' }
}
if (-not (Test-VencordCheckout $VencordPath)) { throw "Checkout invalido: $VencordPath" }
$VencordPath = (Resolve-Path -LiteralPath $VencordPath).Path
$source = Join-Path $PSScriptRoot 'src'
if (-not (Test-Path -LiteralPath (Join-Path $source 'index.ts') -PathType Leaf)) { throw 'Fonte ausente: src/index.ts' }

$plugins = Join-Path $VencordPath 'src\userplugins'
$destination = Join-Path $plugins 'AuraTool'
Write-Host "Vencord: $VencordPath"
Write-Host "Plugin:  $destination"
if (-not $PSCmdlet.ShouldProcess($destination, 'Instalar Aura Tool e compilar Vencord')) { return }

$pnpm = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpm) { throw 'pnpm nao encontrado no PATH. Instale a versao indicada no package.json do Vencord.' }
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { throw 'Node.js nao encontrado no PATH.' }
if (-not (Get-Command git.exe -ErrorAction SilentlyContinue)) { throw 'Git nao encontrado no PATH.' }

Push-Location -LiteralPath $VencordPath
try {
    if (-not (Test-Path -LiteralPath 'node_modules\esbuild\package.json' -PathType Leaf)) {
        & $pnpm.Source install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw "pnpm install falhou ($LASTEXITCODE)." }
    }
    New-Item -ItemType Directory -Path $plugins -Force | Out-Null
    $backup = $null
    if (Test-Path -LiteralPath $destination) {
        $currentEntry = Join-Path $destination 'index.ts'
        if (-not (Test-Path -LiteralPath $currentEntry -PathType Leaf) -or
            -not (Select-String -LiteralPath $currentEntry -Pattern "name: 'Aura Tool'" -SimpleMatch -Quiet)) {
            throw "A pasta $destination ja existe e nao foi reconhecida como Aura Tool."
        }
        $backupRoot = Join-Path $VencordPath '.git'
        if (-not (Test-Path -LiteralPath $backupRoot -PathType Container)) {
            $backupRoot = Join-Path $env:LOCALAPPDATA 'AuraTool'
            New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
        }
        $backup = Join-Path $backupRoot "AuraTool-backup-$([guid]::NewGuid())"
        Move-Item -LiteralPath $destination -Destination $backup
    }
    try {
        Copy-Item -LiteralPath $source -Destination $destination -Recurse
        & $pnpm.Source build --dev
        if ($LASTEXITCODE -ne 0) { throw "pnpm build falhou ($LASTEXITCODE)." }
        if (-not (Select-String -LiteralPath 'dist\renderer.js' -Pattern 'aura-tool-discord-badges' -SimpleMatch -Quiet)) {
            throw 'O bundle do Discord nao contem o Aura Tool.'
        }
    } catch {
        if (Test-Path -LiteralPath $destination) {
            $failed = Join-Path $VencordPath "AuraTool-failed-$([guid]::NewGuid())"
            Move-Item -LiteralPath $destination -Destination $failed
            Write-Warning "Copia da tentativa: $failed"
        }
        if ($backup) { Move-Item -LiteralPath $backup -Destination $destination }
        throw
    }

    if ($backup) { Write-Host "Backup da fonte anterior: $backup" }
    if ($Inject) {
        & $pnpm.Source inject
        if ($LASTEXITCODE -ne 0) { throw "Build instalado. O instalador oficial falhou ($LASTEXITCODE)." }
    }
    Write-Host 'Aura Tool compilado. Recarregue o Discord e abra Vencord Settings > Plugins.'
} finally {
    Pop-Location
}

