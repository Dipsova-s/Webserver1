*** Variables ***
${txtFilterPackage}                 GlobalPackagesGridFilterBox
${tbGridPackage}                    css=#PackageGrid
${pgbGridPackage}                   css=#PackageGrid .k-loading-mask
${trRowInPackagesGrid}              jquery=#PackageGrid .k-grid-content tr

${addNewPackage}                    css=#file
${btnDeletePackage}                 .btnDelete
${btnDownloadPackage}               .btnDownload

${scrollBarPackageGrid}             .k-scrollbar
${downloadedPackageFileName}        ManagementConsole-Robot_automation_package-2.0.eapackage
#Delete Custom Icons Popup
${btnConfirmDeletePackage}          css=#popupConfirmation .btnSubmit
${btnCancelDeletePackage}           css=#popupConfirmation .btnConfirmCancel

*** Keywords ***
Wait Until Packages Page Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Contains Element    ${tbGridPackage}
    Wait Until Page Contains    All uploaded packages
    Wait Until Package Grid Loaded

Wait Until Package Grid Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element    ${pgbGridPackage}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}

Input Filter Package
    [Arguments]    ${filter}
    Input Text    ${txtFilterPackage}    ${filter}
    Wait Until Package Grid Loaded

Click Package Action Dropdown By Package Name
    [Arguments]    ${packageName}
    Click Show Action Dropdown In Grid By Name    ${packageName}    ${trRowInPackagesGrid}
    Wait Until Page Contains    Delete Package

Click Delete Package By Package Name
    [Arguments]    ${packageName}
    Click Action In Grid By Name     ${packageName}    ${trRowInPackagesGrid}    ${btnDeletePackage}
    Wait Until Page Contains    Delete Package

Click Download Package By Package Name
    [Arguments]    ${packageName}
    Click Action In Grid By Name     ${packageName}    ${trRowInPackagesGrid}    ${btnDownloadPackage}

Click Upload New Package
    [Arguments]    ${packageFilePath}
    Sleep   ${TIMEOUT_LARGEST}
    Wait Until Page Contains Element    ${addNewPackage}
    Choose File     ${addNewPackage}    ${packageFilePath}
    Wait MC Progress Bar Closed
    Wait Until Packages Page Loaded

Click Confirm Delete Package
    Wait Until Page Contains Element    ${btnConfirmDeletePackage}
    Click Element    ${btnConfirmDeletePackage}
    Wait Until Packages Page Loaded

Click Cancel Delete Package
    Wait Until Page Contains Element    ${btnCancelDeletePackage}
    Click Element    ${btnCancelDeletePackage}

Verify Package data in Packages grid
    [Arguments]     ${packageGridName}      ${packageGridId}    ${packageGridVersion}   ${packageGridModel}     ${packageGridContent}
    Element Should Contain    ${tbGridPackage}    ${packageGridName}
    Element Should Contain    ${tbGridPackage}    ${packageGridId}
    Element Should Contain    ${tbGridPackage}    ${packageGridVersion}
    Element Should Contain    ${tbGridPackage}    ${packageGridModel}
    Element Should Contain    ${tbGridPackage}    ${packageGridContent}

Click Upload New Package and upload downloaded package
    [Arguments]     ${packageName}
    Sleep   ${TIMEOUT_LARGEST}
    Wait Until Page Contains Element    ${addNewPackage}
    Choose File     ${addNewPackage}    ${DOWNLOAD_DIRECTORY}\\ManagementConsole-${packageName}-2.0.eapackage
    Wait MC Progress Bar Closed
    Wait Until Packages Page Loaded