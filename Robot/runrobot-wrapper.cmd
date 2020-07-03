@echo off

:: load configuration
call runrobot-config.cmd
set "CURRENT=%~dp0%"

:: check TAG
if not defined TAG echo please input TAG &pause &exit

:: check COPYTO
if defined COPYTO goto copy_test

:: set path
set "COPYTO=%~dp0%"
goto run_test

:copy_test
::::::::::::::::::::::::::::::::
:: copy test to specify directory
::::::::::::::::::::::::::::::::
:: make sure that path end withs "\"
if not "%COPYTO:~-1%"=="\" set "COPYTO=%COPYTO%\"

:: clean up directory
if exist "%COPYTO%resources" rd "%COPYTO%resources" /s /q
if exist "%COPYTO%WC" rd "%COPYTO%WC" /s /q

:: copy all
xcopy * %COPYTO% /E /S /Y /Q

:run_test
::::::::::::::::::::::::::::::::
:: run robot
::::::::::::::::::::::::::::::::
if exist "%COPYTO%report" rd "%COPYTO%report" /s /q
cls
set WebHelpMode=webhelp
If %SILENCE%==1 set WebHelpMode=silence
call %COPYTO%runrobot "%SERVER%" "%BRANCH%" %TAG% "WS" "%QUERY%" "%COMPARE_BRANCH%" %WebHelpMode%
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
