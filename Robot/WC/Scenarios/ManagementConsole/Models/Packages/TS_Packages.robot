*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Packages/Packages.robot

*** Keywords ***
Go To Models Package Page
    [Arguments]     ${modelName}
    Go To MC Page    /Models/${modelName}/Packages/
    Wait Until Model Packages Loaded

Verify the Model Package data in Model Packages grid
    [Arguments]     ${packageStatus}    ${packageName}
    Input Filter Model Package  ${packageName}
    Wait Until Keyword Succeeds    2 min    10 s    Wait Until Package Status Ready    ${packageName}     ${packageStatus}

Activate Package in Model package grid
    [Arguments]     ${packageName}
    Click on Reload Button
    Click Activate Model Package By Package Name    ${packageName}
    Click OK on Activate Package Confirmation popup
    Click on Reload Button

Deactivate Package in Model package grid
    [Arguments]     ${packageName}
    Click on Reload Button
    Click Deactivate Model Package By Package Name  ${packageName}
    click ok on Deactivate Package Confirmation popup
    Click on Reload Button

Verify Model Package not found in Model Packages grid
    [Arguments]     ${packageName}
    Input Filter Model Package    ${packageName}
    Element Should Not Contain    ${tbGridModelPackage}    ${packageName}