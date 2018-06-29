@echo off
set PATH=%PATH%;C:\Python27;C:\Python27\Scripts
ECHO ###### Checking Framework  ######

set logFolder=%~dp0python
if not exist "%logFolder%" md "%logFolder%"

if exist "C:\Python27\" echo %date% %time% "C:\Python27" found. &goto python_installed
	ECHO ###### Setup Robot Framework  ######
	ECHO  %date% %time% c:\python27 not found, downloading and installing python


	bitsadmin.exe /transfer "Download Python" https://www.python.org/ftp/python/2.7.10/python-2.7.10.msi "%~dp0python-2.7.10.msi" >> "%logFolder%\bitsadmin.log" 2>&1
	if not exist "%~dp0python-2.7.10.msi" Echo Download "%~dp0python-2.7.10.msi" failed& exit /b

	ECHO  %date% %time% Successfully Downloaded Python-2.7.10.msi....

	start /wait "" %~dp0python-2.7.10.msi /passive  >> "%logFolder%\python-2.7.10.msi.log" 2>&1

	if not exist "C:\Python27\" Echo Installing python failed& exit /b

	ECHO  %date% %time% Successfully Installed Python 2.7.10....

	pip install robotframework >> "%logFolder%\pip_robotframework.log" 2>&1
	Echo "pip install robotframework" finished [%errorlevel%]

	pip install robotframework-selenium2library >> "%logFolder%\pip_robotframework-selenium2library.log" 2>&1
	Echo "pip install robotframework-selenium2library" finished [%errorlevel%]

	pip install robotframework-pabot >> "%logFolder%\pip_robotframework-pabot.log" 2>&1
	Echo "pip install robotframework-pabot" finished [%errorlevel%]

	pip install robotframework-httplibrary >> "%logFolder%\pip_robotframework-httplibrary.log" 2>&1
	Echo "pip install robotframework-httplibrary" finished [%errorlevel%]

	del  %~dp0python-2.7.10.msi >nul 2>&1

	ECHO %date% %time% Finished installing Robot Framework....

:python_installed

echo Check Robot Framework version...
set updateRobot=yes
set updateRobotVersion="robotframework==3.0"
set updateSelenium2Library=yes
set updateSelenium2LibraryVersion="robotframework-selenium2library==1.8.0"
set updatePabot=yes
set updatePabotVersion="robotframework-pabot==0.31"
set updateHttpLibrary=yes
set updateHttpLibraryVersion="robotframework-httplibrary==0.4.2"
for /F %%i in ('pip freeze --local') do (
	if "%%i"==%updateRobotVersion% set updateRobot=no
	if "%%i"==%updateSelenium2LibraryVersion% set updateSelenium2Library=no
	if "%%i"==%updatePabotVersion% set updatePabot=no
	if "%%i"==%updateHttpLibraryVersion% set updateHttpLibrary=no
)
if "%updateRobot%"=="yes" pip install %updateRobotVersion%
if "%updateSelenium2Library%"=="yes" pip install %updateSelenium2LibraryVersion%
if "%updatePabot%"=="yes" pip install %updatePabotVersion%
if "%updateHttpLibrary%"=="yes" pip install %updateHttpLibraryVersion%

ECHO.
ECHO ###### Running Robot Framework Information  ######
ECHO Server: %1
ECHO Branch: %2
ECHO Tag: %3
ECHO QueryString: %4

:: **************** Global Setting ***********************
SET URL=%1
if not defined URL set URL=th-eatst02.theatst.org

SET QueryString=%4

::* or specific testcase filename
set TestCaseFile=*

::* or smoke,acceptance,dev,....
SET TestCategory=%3
if not defined TestCategory set TestCategory=*

::Report folder
if "%TestCategory%"=="*" goto :set_dev_report
if "%3"=="" goto :set_dev_report

:set_prod_report
	set ReportFolder=\report\%TestCategory%
	set ReportFolderParallel=%ReportFolder%_parallel
	set ReportFolderSingle=%ReportFolder%_single
	set ReportFolderSetup=%ReportFolder%_setup
	goto exit_set_report

:set_dev_report
	set ReportFolder=\report
	set ReportFolderParallel=%ReportFolder%\_parallel
	set ReportFolderSingle=%ReportFolder%\_single
	set ReportFolderSetup=%ReportFolder%\_setup

:exit_set_report


::\WC,\AppServer
set RunTestCaseFolder=\WC

::Test name
set TestName=Test_Suit_%TestCategory%


:: **************** WC Setting ***********************
::chrome,firefox,ie,phantomjs
set BROWSER=chrome

::Branch
set Branch=%2
if not defined Branch set Branch=sub10

::Timeout
Set Timeout=30s

::Username
Set Username=\EAPower

::Password
Set Password=P@ssw0rd

Set PrefServerCurrent=%5
Set PrefServerBase=%6

ECHO ###### Running Robot Framework ######
call :executeRobot 
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
					--variable PREF_SERVER_CURRENT:%PrefServerCurrent% ^
					--variable PREF_SERVER_BASE:%PrefServerBase%

	:: **************** Run setup ***********************
	ECHO Executing "%TestCategory%_i" tests
	call pabot --processes 1 ^
		-i %TestCategory%_i ^
		-d %~dp0%ReportFolderSetup% ^
		%parameters% ^
		%~dp0%RunTestCaseFolder%/%TestCaseFile%.robot

	:: **************** Run parallel ***********************
	ECHO Executing "%TestCategory%" tests
	call pabot --processes 4 ^
		-i %TestCategory% ^
		-d %~dp0%ReportFolderParallel% ^
		%parameters% ^
		--randomize test %~dp0%RunTestCaseFolder%/%TestCaseFile%.robot

	:: **************** Run single ***********************
	ECHO Executing "%TestCategory%_s" tests
	call pabot --processes 1 ^
	    -i %TestCategory%_s ^
	    -d %~dp0%ReportFolderSingle% ^
		%parameters% ^
		--randomize test %~dp0%RunTestCaseFolder%/%TestCaseFile%.robot

	:: **************** Report ***********************
	:createReport
	ECHO ###### Create Robot Framework Report ######

	:: Create a folder
	if not exist "%~dp0%ReportFolder%" md "%~dp0%ReportFolder%"

	:: Copy images
	if exist "%~dp0%ReportFolderSetup%\*.png" copy "%~dp0%ReportFolderSetup%\*.png" "%~dp0%ReportFolder%" /Y
	if exist "%~dp0%ReportFolderParallel%\*.png" copy "%~dp0%ReportFolderParallel%\*.png" "%~dp0%ReportFolder%" /Y
	if exist "%~dp0%ReportFolderSingle%\*.png" copy "%~dp0%ReportFolderSingle%\*.png" "%~dp0%ReportFolder%" /Y

	:: Reports to be merged
	set reports=
	if exist "%~dp0%ReportFolderSetup%" set "reports=%reports% %~dp0%ReportFolderSetup%/output.xml"
	if exist "%~dp0%ReportFolderParallel%" set "reports=%reports% %~dp0%ReportFolderParallel%/output.xml"
	if exist "%~dp0%ReportFolderSingle%" set "reports=%reports% %~dp0%ReportFolderSingle%/output.xml"

	call rebot --merge -d %~dp0%ReportFolder% ^
		--output %~dp0%ReportFolder%/output.xml ^
		%reports%

exit /b 0