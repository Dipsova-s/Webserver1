@echo off
set PythonPath=C:\Python27
set PATH=%PythonPath%;%PythonPath%\Scripts;%PATH%

ECHO ###### Checking Framework ######
set logFolder=%~dp0python
if not exist "%logFolder%" md "%logFolder%"

if exist "%PythonPath%" echo %date% %time% "%PythonPath%" found. &goto python_installed
	ECHO ###### Setup Robot Framework  ######
	ECHO  %date% %time% %PythonPath% not found, downloading and installing python
	bitsadmin.exe /transfer "Download Python" https://www.python.org/ftp/python/2.7.10/python-2.7.10.msi "%~dp0python-2.7.10.msi" >> "%logFolder%\bitsadmin.log" 2>&1
	if not exist "%~dp0python-2.7.10.msi" Echo Download "%~dp0python-2.7.10.msi" failed& exit /b
	ECHO  %date% %time% Successfully Downloaded Python-2.7.10.msi....
	start /wait "" %~dp0python-2.7.10.msi /passive  >> "%logFolder%\python-2.7.10.msi.log" 2>&1
	if not exist "%PythonPath%" Echo Installing python failed& exit /b
	ECHO  %date% %time% Successfully Installed Python 2.7.10....
	del  %~dp0python-2.7.10.msi >nul 2>&1
	ECHO %date% %time% Finished installing Robot Framework....
:python_installed

echo Check pip version...
python -m pip install pip==10.0.0

echo Check Robot Framework version...
set updateRobot=yes
set updateRobotVersion="robotframework==3.0.4"
set updateSeleniumLibrary=yes
set updateSeleniumLibraryVersion="robotframework-seleniumlibrary==4.0.0"
set updateSelenium2screenshots=yes
set updateSelenium2screenshotsVersion="robotframework-selenium2screenshots==0.8.1"
set updatePabot=yes
set updatePabotVersion="robotframework-pabot==0.31"
set updateHttpLibrary=yes
set updateHttpLibraryVersion="robotframework-httplibrary==0.4.2"
set updatePillow=yes
set updatePillowVersion="Pillow==5.2.0"
set updateExcelLibrary=yes
set updateExcelLibraryVersion="robotframework-excellib==1.1.0"
for /F %%i in ('pip freeze --local') do (
	if "%%i"==%updateRobotVersion% set updateRobot=no
	if "%%i"==%updateSeleniumLibraryVersion% set updateSeleniumLibrary=no
	if "%%i"==%updatePabotVersion% set updatePabot=no
	if "%%i"==%updateHttpLibraryVersion% set updateHttpLibrary=no
	if "%%i"==%updateSelenium2screenshotsVersion% set updateSelenium2screenshots=no
	if "%%i"==%updatePillowVersion% set updatePillow=no
	if "%%i"==%updateExcelLibraryVersion% set updateExcelLibrary=no
)
if "%updateRobot%"=="yes" pip install %updateRobotVersion%
if "%updateSeleniumLibrary%"=="yes" pip install %updateSeleniumLibraryVersion%
if "%updatePabot%"=="yes" pip install %updatePabotVersion%
if "%updateHttpLibrary%"=="yes" pip install %updateHttpLibraryVersion%
if "%updateSelenium2screenshots%"=="yes" if "%7"=="webhelp" pip install %updateSelenium2screenshotsVersion%
if "%updatePillow%"=="yes" if "%7"=="webhelp" pip install %updatePillowVersion%
if "%updateExcelLibrary%"=="yes" pip install %updateExcelLibraryVersion%

ECHO ###### Checking Chrome Driver  ######
call :downloadChromeDriver

ECHO.
ECHO ###### Running Robot Framework Information  ######
ECHO Server: %1
ECHO Branch: %2
ECHO Tag: %3
ECHO QueryString: %5
ECHO CompareBranch: %6

:: **************** Global Setting ***********************
SET URL=%1
if not defined URL set URL=nl-webmb01.everyangle.org

SET QueryString=%5

::* or specific testcase filename
set TestCaseFile=*

::* or smoke,acceptance,dev,....
SET TestCategory=%3
if not defined TestCategory set TestCategory=allangles
if "%TestCategory%"=="*" set TestCategory=allangles

::\WC,\AppServer
set TestPath=WC/*.robot

::Test name
set TestName=Test_Suit_%TestCategory%

:: **************** WC Setting ***********************
::chrome,firefox,ie,phantomjs
set BROWSER=chrome

::Branch
set Branch=%2
if not defined Branch set Branch=master

::Timeout
Set Timeout=30s

::Username
Set Username=\EAPower

::Password
Set Password=P@ssw0rd

Set CompareBranch=%6
if not defined CompareBranch set CompareBranch=master

set DevMode=0
if "%7"=="webhelp" set DevMode=1

::Report folder
Set BaseReportFolder=report/
set ReportFolder=%BaseReportFolder%%TestCategory%
set ReportFolderParallel=%ReportFolder%_parallel
set ReportFolderSingle=%ReportFolder%_single
set ReportFolderSetup=%ReportFolder%_setup

ECHO ###### Running Robot Framework ######
call :executeRobot
call :cleanupChromeDriver
exit /b 0

::=========================================
:: Function
::=========================================
:executeRobot

	setlocal
	cd /d %~dp0

	set parameters=--name %TestName% ^
					--variable Username:%Username% ^
					--variable Password:%Password% ^
					--variable Branch:%Branch% ^
					--variable Timeout:%Timeout% ^
					--variable URL:%URL% ^
					--variable BROWSER:%BROWSER% ^
					--variable QueryString:%QueryString% ^
					--variable CompareBranch:%CompareBranch% ^
					--variable DevMode:%DevMode%

	:: **************** Run setup ***********************
	ECHO Executing "%TestCategory%_i" tests
	call pabot --processes 1 ^
		-i %TestCategory%_i ^
		-d %ReportFolderSetup% ^
		%parameters% ^
		%TestPath%

	:: **************** Run parallel ***********************
	ECHO Executing "%TestCategory%" tests
	call pabot --processes 4 ^
		-i %TestCategory% ^
		-d %ReportFolderParallel% ^
		%parameters% ^
		--randomize test %TestPath%

	:: **************** Run single ***********************
	ECHO Executing "%TestCategory%_s" tests
	call pabot --processes 1 ^
	    -i %TestCategory%_s ^
	    -d %ReportFolderSingle% ^
		%parameters% ^
		--randomize test %TestPath%

	:: **************** Report ***********************
	ECHO ###### Create Robot Framework Report ######

	:: Create a folder
	set "ReportPath=%~dp0%ReportFolder:/=\%"
	if not exist "%ReportPath%" md "%ReportPath%"

	set "ReportPathSetup=%~dp0%ReportFolderSetup:/=\%"
	set "ReportPathParallel=%~dp0%ReportFolderParallel:/=\%"
	set "ReportPathSingle=%~dp0%ReportFolderSingle:/=\%"

	:: Copy images
	if exist "%ReportPathSetup%\*.png" copy "%ReportPathSetup%\*.png" "%ReportPath%" /Y
	if exist "%ReportPathParallel%\*.png" copy "%ReportPathParallel%\*.png" "%ReportPath%" /Y
	if exist "%ReportPathSingle%\*.png" copy "%ReportPathSingle%\*.png" "%ReportPath%" /Y

	:: Reports to be merged
	set reports=
	if exist "%ReportPathSetup%" set "reports=%reports% %ReportFolderSetup%/output.xml"
	if exist "%ReportPathParallel%" set "reports=%reports% %ReportFolderParallel%/output.xml"
	if exist "%ReportPathSingle%" set "reports=%reports% %ReportFolderSingle%/output.xml"

	call rebot --merge -d %ReportFolder% ^
		--output output.xml ^
		%reports%

exit /b 0

:downloadChromeDriver
	call powershell -file "%~dp0%download.ps1"
exit /b 0

:cleanupChromeDriver
	call powershell -file "%~dp0%cleanup.ps1"
exit /b 0