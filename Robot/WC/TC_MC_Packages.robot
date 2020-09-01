*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login MC With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Setup          Go To Package Page
Test Teardown       Empty Download Directory
Force Tags          acc_mc_s

*** Test Cases ***
Test Global Packages
    [Documentation]     Verify the user is able to upload package in global packages page. High Criticality
    [Tags]  TC_C586  
    Verify Package Page Is Ready
    Verify Filter Not Found
    Verify Upload Package And Filter The Package    Robot_Test_1    ${EXECDIR}\\resources\\Robot-Test-1.eapackage
    Delete Uploaded Package     Robot_Test_1

GUI Testing For Export Package Popup
    [Documentation]     Verify the create package popup options are not persisted while selecting the options in global packages page. Medium Criticality
    [Tags]  TC_C586
    Click To Open Export Package Popup
    Verify GUI Export Package Popup
    Change GUI Export Package options
    Click To Close Export Package Popup
    Click To Open Export Package Popup
    Verify GUI Export Package Popup   # make sure that GUI reset correctly on 2nd time opening
    Click To Close Export Package Popup

Create new package and verify the package is created successfully
    [Documentation]     Verify the user is able to create new package with given options and upload the same into Global packages successfully. High criticality
    [Tags]  TC_C9070
    ${randomString}     Generate Random String   8    [LETTERS]
    ${packageName}   catenate  ${randomString}_Robot_Package
    Click To Open Export Package Popup
    Select Content drop down value in Export Package Popup
    Edit the GUI Export Package options     ${packageName}
    Click on OK button in Create Package popup
    Verify Uploaded Package And Filter The Package  ${packageName}
    Verify the package data in packages grid    model   ${packageName}
    Delete Uploaded Package     ${packageName}

Activate and Deactivate the uploaded package in models
    [Documentation]     Verify the user is able to activate/deactivate the uploaded package in Global packages page to model packages. High criticality
    [Tags]      TC_C9067    acc_mc_aci_s
    ${packageName}   catenate  Robot_Migration_Test
    Verify Upload Package And Filter The Package    ${packageName}    ${EXECDIR}\\resources\\ManagementConsole-${packageName}-2.0.eapackage
    Go To Models Package Page  EA2_800
    Click Inactive Radio Button
    Verify the Model Package data in Model Packages grid    Inactive     ${packageName}
    Activate Package in Model package grid  ${packageName}
    Verify the Model Package data in Model Packages grid    Active      ${packageName}
    Go To Package Page
    Verify Filtering The Package    ${packageName}
    Verify the package data in packages grid    EA2_800     ${packageName}
    Go To Models Package Page  EA2_800
    Deactivate Package in Model package grid    ${packageName}
    Click Inactive Radio Button
    Verify the Model Package data in Model Packages grid    Deactivated     ${packageName}
    Go To Package Page
    Verify Filtering The Package    ${packageName}
    Delete Uploaded Package  ${packageName}
    Go To Models Package Page  EA2_800
    Click All Radio Button
    Verify Model Package not found in Model Packages grid   ${packageName}

Verify selecting package content using copy and paste query url into input field on create package page
    [Documentation]    Verifying user is able to copy and paste webclient url to Input field to select package content
    ...                on create package page and check the existence of "Check" buttton.
    [Tags]         TC_C229221
    Click To Open Export Package Popup
    Verify Selecting Package Content Using Copy And Paste Query Url
