*** Variables ***
${rdoShowActivePackage}                                          jquery=input[name=FilterPackages][value=active]
${rdoShowInactivePackage}                                        jquery=input[name=FilterPackages][value=inactive]
${rdoShowAllPackage}                                             jquery=input[name=FilterPackages][value=all]
${gridModelPackages}                                             css=#PackageGrid .k-loading-mask
${tbGridModelPackage}                                            css=#PackageGrid
${trRowInModelPackagesGrid}                                      jquery=#PackageGrid .k-grid-content tr
${btnActivatePackage}                                            .btnSetActive
${btnDeactivatePackage}                                          .btnSetInactive
${btnOkActivateConfirmationPopup}                                css=#ImportPackagePopup .btnSubmit
${btnOkDeactivateConfirmationPopup}                              css=#popupConfirmation .btnSubmit
${btnReload}                                                     css=.btnReload
${txtFilterModelPackage}                                         PackagesGridFilterBox

*** Keywords ***
Click Inactive Radio Button
    Wait Until Page Contains Element    ${rdoShowInactivePackage}
    Click Element    ${rdoShowInactivePackage}

Wait Until Model Packages Loaded
    Wait Until Page Contains    Packages history    ${TIMEOUT_MC_LOAD}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Model Package Grid Loaded

Click on packages link for the model
    [Arguments]     ${ModelName}
    Wait Until Element Is Visible    xpath=//a[@href="#/Models/${ModelName}/Packages/"]
    Wait MC Progress Bar Closed
    Click Link    xpath=//a[@href="#/Models/${ModelName}/Packages/"]
    Wait Until Model Packages Loaded

Input Filter Model Package
    [Arguments]    ${filter}
    Input Text    ${txtFilterModelPackage}    ${filter}
    Wait Until Model Package Grid Loaded

Wait Until Model Package Grid Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${gridModelPackages}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}

Verify the Model Packages data in Model Packages grid
    [Arguments]     ${packageGridName}      ${packageGridId}    ${packageGridVersion}   ${packageGridSource}     ${packageGridContent}  ${packageGridStatus}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridName}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridId}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridVersion}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridSource}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridContent}
    Element Should Contain    ${tbGridModelPackage}    ${packageGridStatus}

Click Activate Model Package By Package Name
    [Arguments]    ${modelPackageName}
    Click Action In Grid By Name     ${modelPackageName}    ${trRowInModelPackagesGrid}    ${btnActivatePackage}
    Wait Until Page Contains    Activate package

Click Deactivate Model Package By Package Name
    [Arguments]    ${modelPackageName}
    Click Action In Grid By Name     ${modelPackageName}    ${trRowInModelPackagesGrid}    ${btnDeactivatePackage}
    Wait Until Page Contains    Deactivate Package

Click OK on Activate Package Confirmation popup
    Wait Until Page Contains Element    ${btnOkActivateConfirmationPopup}
    Click Element    ${btnOkActivateConfirmationPopup}
    Wait Until Model Packages Loaded
    Wait Until Model Package Grid Loaded

Click OK on Deactivate Package Confirmation popup
    Wait Until Page Contains Element    ${btnOkDeactivateConfirmationPopup}
    Click Element    ${btnOkDeactivateConfirmationPopup}
    Wait Until Model Packages Loaded
    Wait Until Model Package Grid Loaded

Click on Reload Button
    Wait Until Element Is Visible    ${btnReload}
    Click Element  ${btnReload}
    Wait Until Model Packages Loaded
    Wait Until Model Package Grid Loaded

Click All Radio Button
    Wait Until Page Contains Element    ${rdoShowAllPackage}
    Click Element    ${rdoShowAllPackage}