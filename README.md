- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Work with Robot test](#work-with-robot-test)
- [Work with JavaScript unit test](#work-with-javascript-unit-test)
- [Work with font icon](#work-with-font-icon)
- [Work with SCSS](#work-with-scss)
- [Add a new license](#add-a-new-license)
- [Troubleshoot](#troubleshoot)

# Introduction 
EveryAngle.WebClient
- contains 2 apps, WebClient (WC) and Management console (MC)
- MC will be deployed as subdirectory  of EveryAngle.WebClient, e.g. C:\inetpub\wwwroot\web\admin\

EveryAngle.ODataService
- contains odata service
- it will be deployed as subdirectory of EveryAngle.WebClient, e.g. C:\inetpub\wwwroot\web\odata\\<model_id>\

Robot
- contains automation test using [Robot framework](https://robotframework.org/)
- documentations [Standard](http://robotframework.org/robotframework/#built-in-tools), [SeleniumLibrary](http://robotframework.org/SeleniumLibrary/SeleniumLibrary.html)

SetupFiles
- contains innosetup files
- Innosetup is required [Download](http://files.jrsoftware.org/is/5/innosetup-5.6.1-unicode.exe)

# Getting Started
1.	Install Visual studio extensions
    1.  NUnit 2 Test Adapter
    2.  Chutzpah Test Runner Context Menu Extension
    3.  Chutzpah Test Adapter for the Test Explorer
    4.  SonarLint for Visual Studio
    5.  Web Compiler
2.  Add EAPackages feed to NuGet Package Manager in Visual studio
    * Name: EAPackages
    * Source: https://everyangle.pkgs.visualstudio.com/_packaging/EAPackages/nuget/v3/index.json
3.  Add/Clone repo - you must include submodule
4.	Add missing files
    * Run this [script](/check-missing-files.ps1) 
5.	Commit code
    1.  Creating a new branch by using following format
        - feature/\<id>_\<short title> for feature type
        - bugfix/\<id>_\<short title> for issue type
    2.  Creating a pull request is mandatory
    3.  Azure DevOps will start a build of your pull request automatically
6.  Running locally
    1. Set "Configuration=DEVMODE" in Visual studio
    2. Update **WebServerBackendUrl** and **WebServiceBackendNOAPort** in the Web.config file to target environment
    3. Update trust IP address to AppServer in MC > Global settings > Authentication page or using API, e.g.
```javascript
    PUT https://<WebServerBackendUrl>:<WebServiceBackendNOAPort>/system/settings
    {
        "trusted_webservers": [
            "127.0.0.1",
            "::1",
            "192.168.2.*"   // your IP address
        ]
    }
```

# Work with Robot test
We use Visual studio code as editor with **Robot Framework Intellisense** extension.

There are 2 files for running Robot test locally.
1. runrobot-config.cmd is a setting file.
2. runrobot-wrapper.cmd uses for executing, this file will install prerequisite stuff at the first running.

Robot test also contains "webhelp" category, it is created for UE team in order to capture screenshots of WC and MC then uses them to create Webhelp page. You can run "webhelp" category via TestServer by using **r:webhelp_setup, r:webhelp**

# Work with JavaScript unit test
We uses Jasmine as unit test and Chutzpah is a test runner.
- Javascript unit test project located at /EveryAngle.WebClient/EveryAngle.WebClient.Web.CS.Tests/ folder.
- Right click on file or folder to run the unit testing.
  - Azure DevOps will run the closest **chutzpah.json** of your test files
- Test resources are linked from WebClient project, you don't need to link it manually.
  - Build the test project will copy/update linked files, you may need to re-open Visual studio and build the test project again in some cases.

# Work with font icon
We store icons in font and use [IcoMoon](https://icomoon.io/) to generate it.
1. Only SVG icon with single color can be generated
2. Download and install [Chrome extension](https://chrome.google.com/webstore/detail/icomoon/kppingdhhalimbaehfmhldppemnmlcjd?hl=en) ([backup](https://drive.google.com/file/d/1Pqo95mCiwgcAotR9Z1TTw8nmPyg-9HBs/view?usp=sharing))
3. Open the app and import **WebClient.json** file from **/EveryAngle.WebClient/EveryAngle.Shared.EmbeddedViews/Resource/Shared/fonts/** folder
4. Import SVG, at WebClient set, click hamburger menu and **Import to Set**.
   - Make sure that ordering is correct in descending
   
   ![](/help/images/ordering.png)

   - Removing color
   
   ![](/help/images/remove-color.png)

   - Alignment

   ![](/help/images/align-middle.png)

   - Make it fit

   ![](/help/images/fit-box.png)

5. Click **Generate Font** tab at bottom, click setting/gear icon and make sure that they are set as below

![](/help/images/download-settings.png)

6. You must update **WebClient.json** file after finished it
   - At **Selection** tab, click hamburger icon on right side
   - Click **Download JSON**
   - Replace the source file with the downloaded file
   
# Work with SCSS
We try to migrate all CSS to SCSS and use [Web compiler](https://marketplace.visualstudio.com/items?itemName=MadsKristensen.WebCompiler) extension as a generate tool.
1. Folder structure, it is the [7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern)
2. All **scss** files must set "Build Action" to "None"
3. Main css is **common.scss**, it will be renamed to main.scss later
4. scss files will be compiled after changed or built, see compilerconfig.json and sub-files

# Add a new license
You need to update license information if you have a new library.
This information will be shown at License and Copyright page (https://\<website>/en/sharedcomponent/copyright).

There are 2 ways for applying,
1. Nuget package, it contains license information in the nuspec file.
2. Add comment header to js file, this should be defined to a generic format, e.g.
```javascript
    /*!
    * jQuery JavaScript Library v2.1.1
    * http://jquery.com/
    *
    * Includes Sizzle.js
    * http://sizzlejs.com/
    *
    * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
    * Released under the MIT license
    * http://jquery.org/license
    *
    * Date: 2014-05-01T17:11Z
    */
```
After your PBI completed to master branch then you must to create a new PBI to Release Management team, they will verify and approve a new license.

# Troubleshoot
1. I cannot use POSTMAN thru AppServer api.
   - you need to turn off SSL verification in your POSTMAN's setting.

   ![](/help/images/postman.png)
2. I need a certificate for my local machine.
   - You can run this [script](/help/scripts/get-certificate.zip)
3. I get Javascript unit test failures on Azure DevOps but local machine.
   - Azure DevOps will run unit tests by using vstest adapter, you can use Test Explorer in Visual studio.
   - Alternatively, you just run test from chutzpah.json file
4. I have updated scss file but it does not generate css file
   - This can be happened on scss file in EveryAngle.Shared.EmbeddedViews project, you can update it manaully (Right click the scss file -> Web Compiler -> Re-compile file)
5. I need to upgrade Kendo UI to a new version
   - Go to https://www.telerik.com/account/, getting the account from IT support.
   - Download UI for ASP .NET MVC file (Telerik.UI.for.AspNet.Mvc5.####.#.###.nupkg)
   - Custom package
     1. rename Telerik.UI.for.AspNet.Mvc5 to Telerik.UI.for.AspNet.Mvc5.custom in nuspec file
     2. remove jQuery dependency in nuspec file
     3. move content/Content to resources/Content
     4. move content/Scripts to resources/Scripts
   - Name the new package as Telerik.UI.for.AspNet.Mvc5.####.#.###.custom.nupkg
   - Publish the new package to EAPackages feed https://everyangle.visualstudio.com/EveryAngle/_packaging?_a=connect&feed=EAPackages
   - js and css files are referred as linked file, you need to update path in csproj files of both WC and MC.
6. I need to upgrade DevExpress to a new version
   - Go to https://www.devexpress.com/MyAccount/LogIn/, getting the account from IT support.
   - Download DevExpress Component Installer or connect with DevExpress Nuget feed in the download page.
   - Create nuget packages for each dll files, you can filter with "devexpress" in [EAPackages page](https://everyangle.visualstudio.com/EveryAngle/_packaging?_a=feed&feed=EAPackages) to see the list
     - there is many tools in internet which can do this job
     - add one more minor version for each packages, e.g. DevExpress.Data.19.2.4 -> DevExpress.Data.19.2.4.1
   - Publish the new package to EAPackages feed https://everyangle.visualstudio.com/EveryAngle/_packaging?_a=connect&feed=EAPackages
7. My TestServer runs out of space.
   - You can run this [script](/help/scripts/cleanup-testserver.ps1) on your TestServer