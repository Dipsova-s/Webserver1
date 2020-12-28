@echo off
set PythonPath=C:\Python38
set PATH=%PythonPath%;%PythonPath%\Scripts;%PATH%

ECHO ###### Checking Framework ######
set logFolder=%~dp0python
if not exist "%logFolder%" md "%logFolder%"

if exist "%PythonPath%" echo %date% %time% "%PythonPath%" found. &goto python_installed
	ECHO ###### Setup Robot Framework  ######
	ECHO  %date% %time% %PythonPath% not found, downloading and installing python
	bitsadmin.exe /transfer "Download Python" https://www.python.org/ftp/python/3.8.0/python-3.8.0.exe "%~dp0python-3.8.0.exe" >> "%logFolder%\bitsadmin.log" 2>&1
	if not exist "%~dp0python-3.8.0.exe" Echo Download "%~dp0python-3.8.0.exe" failed& exit /b
	ECHO  %date% %time% Successfully Downloaded Python-3.8.0.exe....
	start /wait "" %~dp0python-3.8.0.exe /quiet InstallAllUsers=1 DefaultAllUsersTargetDir=%PythonPath%  >> "%logFolder%\python-3.8.0.exe.log" 2>&1
	if not exist "%PythonPath%" Echo Installing python failed& exit /b
	ECHO  %date% %time% Successfully Installed Python 3.8.0....
	del  %~dp0python-3.8.0.exe >nul 2>&1
	ECHO %date% %time% Finished installing Robot Framework....
:python_installed

echo Check pip version...
python -m pip install pip==20.0.2

echo Check Robot Framework version...
set updateRobot=yes
set updateRobotVersion="robotframework==3.0.4"
set updateSeleniumLibrary=yes
set updateSeleniumLibraryVersion="robotframework-seleniumlibrary==4.0.0"
set updateSelenium2screenshots=yes
set updateSelenium2screenshotsVersion="robotframework-selenium2screenshots==0.8.1"
set updatePabot=yes
set updatePabotVersion="robotframework-pabot==1.2.1"
set updateHttpLibrary=yes
set updateHttpLibraryVersion="robotframework-httplibrary==0.4.2"
set updatePillow=yes
set updatePillowVersion="Pillow==7.0.0"
set updateExcelLibrary=yes
set updateExcelLibraryVersion="robotframework-excellib==1.1.0"
set updateRequestsModule=yes
set updateRequestsModuleVersion="requests==2.23.0"
set updatelxml=yes
set updatelxmlVersion="lxml==4.5.0"
set updateShield34=yes
set updateShield34Version="shield34==1.0.342"
for /F %%i in ('pip freeze --local') do (
	if "%%i"==%updateRobotVersion% set updateRobot=no
	if "%%i"==%updateSeleniumLibraryVersion% set updateSeleniumLibrary=no
	if "%%i"==%updatePabotVersion% set updatePabot=no
	if "%%i"==%updateHttpLibraryVersion% set updateHttpLibrary=no
	if "%%i"==%updateSelenium2screenshotsVersion% set updateSelenium2screenshots=no
	if "%%i"==%updatePillowVersion% set updatePillow=no
	if "%%i"==%updateExcelLibraryVersion% set updateExcelLibrary=no
	if "%%i"==%updateRequestsModuleVersion% set updateRequestsModule=no 
	if "%%i"==%updatelxmlVersion% set updatelxml=no
	if "%%i"==%updateShield34Version% set updateShield34=no
)
if "%updateRobot%"=="yes" pip install %updateRobotVersion%
if "%updateSeleniumLibrary%"=="yes" pip install %updateSeleniumLibraryVersion%
if "%updatePabot%"=="yes" pip install %updatePabotVersion%
if "%updateHttpLibrary%"=="yes" pip install %updateHttpLibraryVersion%
if "%updateSelenium2screenshots%"=="yes" pip install %updateSelenium2screenshotsVersion%
if "%updatePillow%"=="yes" pip install %updatePillowVersion%
if "%updateExcelLibrary%"=="yes" pip install %updateExcelLibraryVersion%
if "%updateRequestsModule%"=="yes"  pip install %updateRequestsModuleVersion%
if "%updatelxml%"=="yes" pip install %updatelxmlVersion%
if "%updateShield34%"=="yes" pip install %updateShield34Version%

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
set "CURRENT=%~dp0%"
python %CURRENT%python\FetchServerTags.py  %TestCategory%
:: **************** WC Setting ***********************
::chrome,firefox,ie,phantomjs
::Mandatory-First letter capital for all browsers 
set BROWSER=Chrome

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
set ReportFolderSetup=%ReportFolder%_1
set ReportFolderParallel=%ReportFolder%_2
set ReportFolderSingle=%ReportFolder%_3

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
		--pabotlib ^
		--listener shield34_reporter.RobotListener ^
		-i %TestCategory%_i ^
		-d %ReportFolderSetup% ^
		%parameters% ^
		 %TestPath%

	:: **************** Run parallel ***********************
	ECHO Executing "%TestCategory%" tests
	call pabot --processes 4 ^
		--pabotlib ^
		--listener shield34_reporter.RobotListener ^
		-i %TestCategory% ^
		-d %ReportFolderParallel% ^
		%parameters% ^
		--randomize test %TestPath%

	:: **************** Run single ***********************
	ECHO Executing "%TestCategory%_s" tests	
    call pabot --processes 1 ^
		--pabotlib ^
		--listener shield34_reporter.RobotListener ^
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
	call :AddRobotResultToTestrail
exit /b 0

:downloadChromeDriver
	call powershell -file "%~dp0%download.ps1"
exit /b 0

:cleanupChromeDriver
	call powershell -file "%~dp0%cleanup.ps1"
exit /b 0

:: **************** Add robot result to testrail  ***********************
:AddRobotResultToTestrail
	ECHO  Adding robot result to testrail....
	python %CURRENT%python\TRITS.py %ReportPath%\output.xml
	 
exit /b 0