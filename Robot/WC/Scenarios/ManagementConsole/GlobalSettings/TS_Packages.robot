*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Packages/Packages.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/Packages/ExportPackages.robot

*** Keywords ***
Go To Package Page
    Go To MC Page    /Global%20settings/Packages/
    Wait Until Packages Page Loaded

Verify Package Page Is Ready
    Page Should Contain Element    ${btnReload}
    Page Should Contain Element    ${addNewPackage}

Verify Filter Not Found
    Input Filter Package    PackageNotFound
    Element Should Not Contain    ${tbGridPackage}    PackageNotFound

Verify Upload Package And Filter The Package
    [Arguments]    ${packageName}    ${packageFilePath}
    Click Upload New Package    ${packageFilePath}
    Input Filter Package    ${packageName}
    Element Should Contain    ${tbGridPackage}    ${packageName}

Delete Uploaded Package
    [Arguments]     ${packageName}
    Click Delete Package By Package Name    ${packageName}
    Click Confirm Delete Package

Verify GUI Export Package Popup
    # all UI exist
    Select Radio Button     packageCreationBy       Selection
    Page Should Contain Radio Button    ${rdoExportPackageMode}
    Page Should Contain Checkbox    ${chkFacetAngleItem}
    Page Should Contain Checkbox    ${chkFacetTemplateItem}
    Page Should Contain Checkbox    ${chkFacetDashboardItem}
    Page Should Contain Checkbox    ${chkPrivateItems}
    Page Should Contain Checkbox    ${chkPublishedItems}
    Page Should Contain Checkbox    ${chkValidatedItems}
    Page Should Contain Checkbox    ${chkLabelItems}
   
    # checkboxes are checked by default
    Checkbox Should Be Selected    ${chkFacetAngleItem}
    Checkbox Should Be Selected    ${chkFacetTemplateItem}
    Checkbox Should Be Selected    ${chkFacetDashboardItem}
    Checkbox Should Be Selected    ${chkPrivateItems}
    Checkbox Should Be Selected    ${chkPublishedItems}
    Checkbox Should Be Selected    ${chkValidatedItems}
    Checkbox Should Be Selected    ${chkLabelItems}

    # checkboxes are enabled by default
    Element Should Be Enabled    ${chkFacetAngleItem}
    Element Should Be Enabled    ${chkFacetTemplateItem}
    Element Should Be Enabled    ${chkFacetDashboardItem}
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

Edit the GUI Export Package options
    [Arguments]     ${packageName}
    Input Text    ${txtPackageName}             ${packageName}
    Input Text    ${txtPackageId}               ${packageName}
    Input Text    ${txtPackageVersion}          2.0
    Input Text    ${txtPackageDescription}      Robot_automation package description

Verify Filtering The Package
    [Arguments]     ${filteredPackageName}
    Input Filter Package    ${filteredPackageName}
    Element Should Contain    ${tbGridPackage}    ${filteredPackageName}

Verify the package data in packages grid
    [Arguments]     ${packageModelName}     ${packageName}
    Verify Package data in Packages grid  ${packageName}  ${packageName}  2.0  model  angles, labels, model_authorizations

Verify Uploaded Package And Filter The Package
    [Arguments]     ${packageName}
    Click Upload New Package and upload downloaded package  ${packageName}
    Input Filter Package    ${packageName}
    Element Should Contain    ${tbGridPackage}    ${packageName}

Verify Selecting Package Content Using Copy And Paste Query Url
    Check The Existence Of Package Export Url Input Field And Enter The Url
    Click On Check Button
    Textfield Should Contain      ${txtPackageExportUrl}      ${exportPackageUrl}
 