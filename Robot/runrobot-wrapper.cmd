@echo off

:: load configuration
call runrobot-config.cmd
set "CURRENT=%~dp0%"

:: check TAG
if not defined TAG echo please input TAG &pause &exit

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
if exist "%COPYTO%report*" for /d %%x in ("%COPYTO%report*") do rd /s /q "%%x"
if exist "%COPYTO%resources" rd "%COPYTO%resources" /s /q
if exist "%COPYTO%WC" rd "%COPYTO%WC" /s /q

:: copy all
xcopy * %COPYTO% /E /S /Y /Q

:run_test
::::::::::::::::::::::::::::::::
:: run robot
::::::::::::::::::::::::::::::::
cls
call %COPYTO%runrobot "%SERVER%" "%BRANCH%" %TAG% "WS" "%QUERY%" "%COMPARE_BRANCH%" webhelp
if not "%CURRENT%"=="%COPYTO%" xcopy "%COPYTO%chromedriver.exe" "%CURRENT%" /E /S /Y /Q
call :open_report
exit /b 0

:open_report
    ::::::::::::::::::::::::::::::::
    :: open report file
    ::::::::::::::::::::::::::::::::
    echo Opening report...
    start chrome "%COPYTO%report\%TAG%\report.html"
exit /b 0
