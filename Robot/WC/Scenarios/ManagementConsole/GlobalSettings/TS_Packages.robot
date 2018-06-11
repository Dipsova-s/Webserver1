*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Packages/Packages.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Packages/ExportPackages.robot

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

Verify GUI Export Package Popup
    # all UI exist
    Page Should Contain Radio Button    ${rdoModelList}
    Page Should Contain List    ${ddlItemTypeList}
    Page Should Contain Checkbox    ${chkPrivateItems}
    Page Should Contain Checkbox    ${chkPublishedItems}
    Page Should Contain Checkbox    ${chkValidatedItems}
    Page Should Contain Checkbox    ${chkLabelItems}

    # Angles, Templates and Both are in the list
    @{itemTypeList}    Get List Items    ${ddlItemTypeList}
    ${itemTypeListLength}    Get Length          ${itemTypeList}
    Should Be True    ${itemTypeListLength} == 3

    # checkboxes are checked by default
    Checkbox Should Be Selected    ${chkPrivateItems}
    Checkbox Should Be Selected    ${chkPublishedItems}
    Checkbox Should Be Selected    ${chkValidatedItems}
    Checkbox Should Be Selected    ${chkLabelItems}

    # checkboxes are enabled by default
    Element Should Be Enabled    ${chkPrivateItems}
    Element Should Be Enabled    ${chkPublishedItems}
    Element Should Be Enabled    ${chkValidatedItems}
    Element Should Be Enabled    ${chkLabelItems}

    # package info are corrected
    Textfield Value Should Be    ${txtPackageName}    ${txtAngleExportValue}
    Textfield Value Should Be    ${txtPackageId}    ${txtAngleExportValue}
    Textfield Value Should Be    ${txtPackageVersion}    ${txtVersionValue}
    Textarea Value Should Be    ${txtPackageDescription}    ${EMPTY}

Change GUI Export Package options
    Input Text    ${txtPackageName}             new_name
    Input Text    ${txtPackageId}               newname
    Input Text    ${txtPackageVersion}          2.0
    Input Text    ${txtPackageDescription}      new description
    Unselect Checkbox In Export Package Popup    ${chkPublishedItems}