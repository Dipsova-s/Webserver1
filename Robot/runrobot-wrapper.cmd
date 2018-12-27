@echo off

:: load configuration
call runrobot-config.cmd

:: check chromedriver.exe
if not exist "chromedriver.exe" echo chromedriver.exe does not exists in %cd%, download from https://sites.google.com/a/chromium.org/chromedriver/downloads &pause &exit

:: check TAG
if not defined TAG echo please input TAG &pause &exit

:: check LANGUAGES
if not defined LANGUAGES set LANGUAGES=en

:: check COPYTO
if not defined COPYTO goto show_warning
if defined COPYTO goto copy_test

:show_warning
::::::::::::::::::::::::::::::::
:: show warning if empty
::::::::::::::::::::::::::::::::
set "COPYTO=%~dp0%"
cls
echo You might get command too long exception, see "report" directory if failed.
goto run_test

:copy_test
::::::::::::::::::::::::::::::::
:: copy test to specify directory
::::::::::::::::::::::::::::::::
:: make sure that path end withs "\"
if not "%COPYTO:~-1%"=="\" set "COPYTO=%COPYTO%\"

:: clean up directory
if not exist "%COPYTO%" mkdir "%COPYTO%"
if exist "%COPYTO%report" rmdir "%COPYTO%report" /s /q
if exist "%COPYTO%resources" rmdir "%COPYTO%resources" /s /q
if exist "%COPYTO%WC" rmdir "%COPYTO%WC" /s /q

:: copy all
xcopy * %COPYTO% /E /S /Y /Q
cls

:run_test
::::::::::::::::::::::::::::::::
:: run robot
::::::::::::::::::::::::::::::::
for %%a in ("%LANGUAGES:,=" "%") do (
    call %COPYTO%runrobot "%SERVER%" "%BRANCH%" %TAG% "WS" "%QUERY%" "%COMPARE_BRANCH%" "%%~a"
)

:open_report
::::::::::::::::::::::::::::::::
:: open report file
::::::::::::::::::::::::::::::::
echo Opening report...
start chrome "%COPYTO%report\%TAG%\report.html"