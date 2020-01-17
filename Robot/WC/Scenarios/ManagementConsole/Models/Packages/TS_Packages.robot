*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Packages/Packages.robot

*** Keywords ***
Go To Models Package Page
    [Arguments]     ${modelName}
    Click on packages link for the model    ${modelName} 
    Wait Until Model Packages Loaded

Verify the Model Package data in Model Packages grid
    [Arguments]     ${packageStatus}    ${packageName}
    Input Filter Model Package  ${packageName}
    Verify the Model Packages data in Model Packages grid  ${packageName}  ${packageName}  2.0  ManagementConsole  angles, labels, model_authorizations  Deactivated

Activate Package in Model package grid
    [Arguments]     ${packageName}
    Click Activate Model Package By Package Name    ${packageName}
    Click OK on Activate Package Confirmation popup
    Click on Reload Button

Deactivate Package in Model package grid
    [Arguments]     ${packageName}
    Click Deactivate Model Package By Package Name  ${packageName}
    click ok on Deactivate Package Confirmation popup
    Click on Reload Button

Verify Model Package not found in Model Packages grid
    [Arguments]     ${packageName}
    Input Filter Model Package    ${packageName}
    Element Should Not Contain    ${tbGridModelPackage}    ${packageName}