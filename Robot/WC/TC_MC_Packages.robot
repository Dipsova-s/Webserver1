*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login MC With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Setup          Go To Package Page
Test Teardown       Empty Download Directory
Force Tags          acc_mc_s

*** Test Cases ***
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
    Verify the package data in packages grid    EA2_800     ${packageName}      angles, labels, model_authorizations
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
