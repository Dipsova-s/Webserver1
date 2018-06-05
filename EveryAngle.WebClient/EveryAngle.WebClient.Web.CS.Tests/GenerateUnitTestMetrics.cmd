@ECHO off

REM Create a 'GeneratedReports' folder if it does not exist
if not exist "%~dp0bin\Debug\_CodeCoverageReport" mkdir "%~dp0bin\Debug\_CodeCoverageReport"

REM Create a Reports folder(s) if it doesn't exist.
if not exist "%~dp0\bin\Debug\history" (
	mkdir "%~dp0\bin\Debug\history"
)

@ECHO --------------------------------------------------------------------------------
@ECHO Running Open Cover test 
@ECHO --------------------------------------------------------------------------------
..\..\..\..\..\..\..\General\Components\DotNet\OpenCover4.6.519\tools\OpenCover.Console.exe ^
-target:"..\..\..\..\..\..\..\General\Components\DotNet\NUnit.Runners.Net4.2.6.4\tools\nunit-console.exe" ^
-targetargs:"/nologo bin\Debug\EveryAngle.WebClient.Web.CS.Tests.dll /noshadow" ^
-filter:"+[EveryAngle.*]EveryAngle* -[*.Test*]EveryAngle*" ^
-skipautoprops ^
-excludebyattribute:"System.CodeDom.Compiler.GeneratedCodeAttribute" ^
-register:user -output:"%~dp0\bin\Debug\_CodeCoverageResult.xml"

@ECHO --------------------------------------------------------------------------------
@ECHO Running Report generator
@ECHO --------------------------------------------------------------------------------
"..\..\..\..\..\..\..\General\Components\DotNet\ReportGenerator2.4.5.0\tools\ReportGenerator.exe" ^
-reports:"%~dp0\bin\Debug\_CodeCoverageResult.xml" ^
-targetdir:"%~dp0\bin\Debug\_CodeCoverageReport" ^
-historydir:"%~dp0\bin\Debug\history" ^
-verbosity:Error

@ECHO Finished EACoverage processes -------------------------------------------------

REM Launch the report
if %errorlevel% equ 0 (
  call :RunLaunchReport
)
exit /b %errorlevel%
 
:RunLaunchReport
start "report" "%~dp0bin\Debug\_CodeCoverageReport\index.htm"
exit /b %errorlevel%