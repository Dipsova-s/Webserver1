*** Variables ***
${popupCreatePackagePopup}      popupCreateEaPackagePopup
${rdoExportType}                AngleExportType
${rdoExportTypeDownload}        AngleExportTypeDownload
${rdoExportTypePackage}         AngleExportTypePackage
${txtName}                      css=#PackageName
${txtId}                        css=#PackageID
${txtVersion}                   css=#PackageVersion
${txtDescription}               css=#PackageDescription
${btnCancelExportPackage}       btn-popupCreateEaPackagePopup0
${btnOKExportPackage}           btn-popupCreateEaPackagePopup1

*** Keywords ***
Wait Until Export To Angle Popup Loaded
    Wait Until Page Contains Element    ${popupCreatePackagePopup}
    Wait Until Page Contains Element    ${btnOKExportPackage}
    Wait Until Element Is Visible    ${btnOKExportPackage}

Wait Until Export To Package Popup Loaded
    Wait Until Page Contains Element    ${rdoExportType}
    Wait Until Page Contains Element    ${btnOKExportPackage}
    Wait Until Element Is Visible    ${btnOKExportPackage}

Close Export Angle Popup
    Wait Until Element Exist And Visible    ${btnCancelExportPackage}
    Click Element    ${btnCancelExportPackage}

Select Export As Download
    Select Radio Button    ${rdoExportType}    download
    Sleep   ${TIMEOUT_GENERAL}

Select Export As Package
    Select Radio Button    ${rdoExportType}    package
    Sleep   ${TIMEOUT_GENERAL}

Select Export As Package Should Not Visible
    Element Should Not Be Visible    ${rdoExportTypePackage}

Input Package Name
    [Arguments]    ${name}
    Input Text    ${txtName}    ${name}

Input Package ID
    [Arguments]    ${id}
    Input Text    ${txtId}    ${id}

Input Package Version
    [Arguments]    ${version}
    Input Text    ${txtVersion}    ${version}

Input Package Description
    [Arguments]    ${description}
    Input Text    ${txtDescription}    ${description}

Click Export Button
    Click Element    ${btnOKExportPackage}
    Wait Progress Bar Closed

Click Cancel Button
    Click Element    ${btnCancelExportPackage}
