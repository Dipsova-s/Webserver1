*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC    acc_mc_s

*** Test Cases ***
Test Global Packages
    [Documentation]     Verify the user is able to upload package in global packages page. High Criticality
    [Tags]  TC_C586  
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Verify Package Page Is Ready
    Verify Filter Not Found
    Verify Upload Package And Filter The Package
    Delete Uploaded Package     Robot_Test_1

GUI Testing For Export Package Popup
    [Documentation]     Verify the create package popup options are not persisted while selecting the options in global packages page. Medium Criticality
    [Tags]  TC_586
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
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
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Click To Open Export Package Popup
    Select Content drop down value in Export Package Popup  Both
    Edit the GUI Export Package options     ${packageName}
    Click on OK button in Create Package popup
    Verify Uploaded Package And Filter The Package  ${packageName}
    Verify the package data in packages grid    model   ${packageName}
    Delete Uploaded Package     ${packageName}

Activate and Deactivate the uploaded package in models
    [Documentation]     Verify the user is able to activate/deactivate the uploaded package in Global packages page to model packages. High criticality
    [Tags]      TC_C9067    acc_mc_aci_s
    ${randomString}     Generate Random String   8    [LETTERS]
    ${packageName}   catenate  ${randomString}_Robot_Package
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Package Page
    Click To Open Export Package Popup
    Select Content drop down value in Export Package Popup  Both
    Edit the GUI Export Package options     ${packageName}
    Click on OK button in Create Package popup
    Verify Uploaded Package And Filter The Package      ${packageName}
    Go To MC Page  Overview
    Go To EA2_800 Models Page
    Go To Models Package Page  EA2_800
    Click Inactive Radio Button
    Verify the Model Package data in Model Packages grid    Deactivated     ${packageName}
    Activate Package in Model package grid  ${packageName}
    Verify the Model Package data in Model Packages grid    Active      ${packageName}
    Go To MC Page  Overview
    Go To Package Page
    Verify Filtering The Package    ${packageName}
    Verify the package data in packages grid    EA2_800     ${packageName}
    Go To MC Page  Overview
    Go To EA2_800 Models Page
    Go To Models Package Page  EA2_800
    Verify the Model Package data in Model Packages grid    Active  ${packageName}
    Deactivate Package in Model package grid    ${packageName}
    Click Inactive Radio Button
    Verify the Model Package data in Model Packages grid    Deactivated     ${packageName}
    Go To MC Page  Overview
    Go To Package Page
    Verify Filtering The Package    ${packageName}
    Delete Uploaded Package  ${packageName}
    Go To MC Page  Overview
    Go To EA2_800 Models Page
    Go To Models Package Page  EA2_800
    Click All Radio Button
    Verify Model Package not found in Model Packages grid   ${packageName}  