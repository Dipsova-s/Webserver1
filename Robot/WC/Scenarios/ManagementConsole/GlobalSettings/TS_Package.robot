*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Packages.robot

*** Keywords ***
Go To Package Page
    Wait Side Menu Ready
    Click Side Menu Global Settings
    Click Side Menu Packages
    Wait Until Packages Page Loaded

Verify Package Page Is Ready
    Page Should Contain Element    ${btnReload}
    Page Should Contain Element    ${addNewPackage}

Verify Filter Not Found
    Input Filter Package    PackageNotFound
    Element Should Not Contain    ${tbGridPackage}    PackageNotFound

Verify Upload Package And Filter The Package
    Click Upload New Package
    Input Filter Package    Robot
    Element Should Contain    ${tbGridPackage}    Robot

Delete Uploaded Package
    Click Delete Package By Package Name    Robot_Test_1
    Click Confirm Delete Package