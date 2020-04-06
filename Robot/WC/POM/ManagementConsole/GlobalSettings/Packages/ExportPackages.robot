*** Variables ***
${btnOpenExportPackagePopup}                                    jquery=#ExportPackagePopup
${btnExportPackagePopup}                                        jquery=#ExportPackageButton
${btnCloseExportPackagePopup}                                   jquery=#ExportPackageForm a[data-role=popup-close]

${pgPopupExportPackage}                                         jquery=#PopupExportPackage .k-loading-image

${rdoModelList}                                                 jquery=#ExportPackageForm .packageModel input[type=radio]
${ddlItemTypeList}                                              jquery=#ExportPackageForm .packageFilter select#ItemExportSelector
${chkPrivateItems}                                              jquery=#ExportPackageForm .packageFilter input[name="has_private"]
${chkPublishedItems}                                            jquery=#ExportPackageForm .packageFilter input[name="has_published"]
${chkValidatedItems}                                            jquery=#ExportPackageForm .packageFilter input[name="has_validated"]
${chkLabelItems}                                                jquery=#ExportPackageForm .packageFilter input[name="has_label_categories_and_labels"]
${txtPackageName}                                               jquery=#ExportPackageForm .packageInfo input[name=package_name]
${txtPackageId}                                                 jquery=#ExportPackageForm .packageInfo input[name=package_id]
${txtPackageVersion}                                            jquery=#ExportPackageForm .packageInfo input[name=package_version]
${txtPackageDescription}                                        jquery=#ExportPackageForm .packageInfo textarea[name=package_description]

${dpdItemTypeList}                                              xpath=//span[@aria-owns='ItemExportSelector_listbox']/span/span/span

${txtAngleExportValue}                                          AngleExport
${txtVersionValue}                                              1.0

*** Keywords ***
Wait Until Export Package Popup Is Ready
    Wait Until Page Contains    Create package
    Wait Until Page Contains Element    ${btnExportPackagePopup}
    Wait Until Element Is Visible    ${btnExportPackagePopup}
    Wait Until Ajax Complete
    Wait Until Page Does Not Contain Element    ${pgPopupExportPackage}

Click To Open Export Package Popup
    Wait Until Element Is Visible    ${btnOpenExportPackagePopup}
    Click Element    ${btnOpenExportPackagePopup}
    Wait Until Export Package Popup Is Ready

Click To Close Export Package Popup
    Click Element    ${btnCloseExportPackagePopup}
    Wait Until Element Is Not Visible    ${btnCloseExportPackagePopup}

Select Checkbox In Export Package Popup
    [Arguments]    ${checkbox}
    Select Checkbox    ${checkbox}
    Wait Until Export Package Popup Is Ready

Unselect Checkbox In Export Package Popup
    [Arguments]    ${checkbox}
    Unselect Checkbox    ${checkbox}
    Wait Until Export Package Popup Is Ready

Select Content drop down value in Export Package Popup
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdItemTypeList}   ${dpdValue}
    Wait Until Export Package Popup Is Ready

Click on OK button in Create Package popup
    Click Element    ${btnExportPackagePopup}
    Wait Until Element Is Not Visible    ${btnExportPackagePopup}
    Wait MC Progress Bar Closed
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}