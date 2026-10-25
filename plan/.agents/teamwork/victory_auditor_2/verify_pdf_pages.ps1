param(
    [string]$PdfPath = "D:\.gemini\WebApps Projects\Dahmer html\plan\Dahmer Part 01.pdf",
    [string]$Pages = "28,29"
)
$PageNumbers = $Pages.Split(',') | ForEach-Object { [int]$_.Trim() }

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function Await($WinRtOp, $ResultType) {
    $m = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $m.Invoke($null, @($WinRtOp))
    $netTask.Wait(-1) | Out-Null
    return $netTask.Result
}

function AwaitAction($WinRtOp) {
    $asTaskAction = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction'
    })[0]
    $netTask = $asTaskAction.Invoke($null, @($WinRtOp))
    $netTask.Wait(-1) | Out-Null
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($PdfPath)) ([Windows.Storage.StorageFile])
$pdfDoc = Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument])

Write-Output ("Total pages in " + $PdfPath + ": " + $pdfDoc.PageCount)

$ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

foreach ($p in $PageNumbers) {
    $pageIdx = $p - 1
    if ($pageIdx -lt 0 -or $pageIdx -ge $pdfDoc.PageCount) {
        Write-Output "Page $p is out of bounds!"
        continue
    }
    $page = $pdfDoc.GetPage($pageIdx)
    $stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $renderOptions = New-Object Windows.Data.Pdf.PdfPageRenderOptions
    # Render at higher resolution for OCR
    $renderOptions.DestinationWidth = [uint32]($page.Size.Width * 2)
    $renderOptions.DestinationHeight = [uint32]($page.Size.Height * 2)
    
    AwaitAction ($page.RenderToStreamAsync($stream, $renderOptions))
    $stream.Seek(0)
    
    $decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $softwareBitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    
    $ocrResult = Await ($ocr.RecognizeAsync($softwareBitmap)) ([Windows.Media.Ocr.OcrResult])
    
    Write-Output "=================================================="
    Write-Output "=== OCR OUTPUT FOR PHYSICAL PAGE $p ==="
    Write-Output "=================================================="
    Write-Output $ocrResult.Text
}
