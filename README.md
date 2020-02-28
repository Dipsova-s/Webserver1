# Introduction 
EveryAngle.WebClient
- contains 2 apps, WebClient and Management console (MC)
- MC will deploy as subdirectory  of EveryAngle.WebClient, e.g. c:\inetpub\wwwroot\web\admin\

EveryAngle.ODataService
- contains odata service
- it will deploy as subdirectory of EveryAngle.WebClient, e.g. c:\inetpub\wwwroot\web\odata\<model_id>\

Robot
- contains automation test using [Robot framework](https://robotframework.org/)
- documentations [Standard](http://robotframework.org/robotframework/#built-in-tools), [SeleniumLibrary](http://robotframework.org/SeleniumLibrary/SeleniumLibrary.html)

SetupFiles
- contains innosetup files
- Innosetup is required [Download](http://files.jrsoftware.org/is/5/innosetup-5.6.1-unicode.exe)

# Getting Started
1.	Install Visual studio extensions
    1.  NUnit 2 Test Adapter
    2.  Chutzpah Test Runner Context MEnu Extension
    3.  Chutzpah Test Adapter for the Test Explorer
    4.  SonarLint for Visual Studio 2017+
    5.  Web Compiler
2.	Add/Clone repo - you must include submodule
3.	Commit code
    1.  Create a new branch by using following format
        - **feature/\<id>_\<short title>** for feature type
        - **bugfix/\<id>_\<short title>** for issue type
    2.  After commited/pushed, Azure DevOps will start a build process

# Work with JavaScript unit test
WebClient uses Jasmine as unit test tool and Chutzpah is the test runner.
- Javascript unit test project located at /EveryAngle.WebClient/EveryAngle.WebClient.Web.CS.Tests/ folder
- Right click on file or folder to run the unit testing.
- Test resources are linked from WebClient project, you don't need to link it manually.
  - Build the test project will copy/update linked files.
  - In case editing a javascript file in WebClient project, you must build the test project again.
  - In case adding a new javascript file in WebClient project, you must re-open Visual studio and build the test project again.

# Work with font icon
WebClient and MC store icons in font and use [IcoMoon](https://icomoon.io/) to generate it.
1. Only SVG icon with single color can be generated
2. Download and install [Chrome extension](https://chrome.google.com/webstore/detail/icomoon/kppingdhhalimbaehfmhldppemnmlcjd?hl=en)
3. Open the app and import **WebClient.json** file from **/EveryAngle.WebClient/EveryAngle.Shared.EmbeddedViews/Resource/Shared/fonts/** folder
4. Click **Generate Font** tab at bottom, click setting/gear icon and make sure that they are set as below
   -  Font name **WebClientIco**
   -  Class prefix **icon-**
   -  Only "Support IE 8" is checked
   -  CSS Selector > Use a class **.icon**
5. After updated then you must export **WebClient.json** file
   - At **Selection** tab, click hamburger icon on right side
   - Click **Download JSON**
   - Replace the source file with the downloaded file
   
# Work with SCSS
We try to migrate all CSS to SCSS, they are in progress!
We use Web compiler extension as a generate tool.
1. Folder structure, it is the 7-1 Pattern
2. All **scss** files must set "Build Action" to "None"
3. Main css is **common.scss**, it will be renamed to main.scss later
4. scss files will be compiled after changed or built, see compilerconfig.json and sub-files