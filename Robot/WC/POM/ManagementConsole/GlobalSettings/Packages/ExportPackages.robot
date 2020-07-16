*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Variables ***
${btnOpenExportPackagePopup}                                    jquery=#ExportPackagePopup
${btnExportPackagePopup}                                        jquery=#ExportPackageButton
${btnCloseExportPackagePopup}                                   jquery=#ExportPackageForm a[data-role=popup-close]

${pgPopupExportPackage}                                         jquery=#PopupExportPackage .k-loading-image

${rdoExportPackageMode}                                         jquery=#ExportPackageForm .packageSelection input[type=radio]
${chkFacetAngleItem}                                            jquery=#ExportPackageForm .packageFilter input[name="has_facet_angle"]
${chkFacetTemplateItem}                                         jquery=#ExportPackageForm .packageFilter input[name="has_facet_template"]
${chkFacetDashboardItem}                                        jquery=#ExportPackageForm .packageFilter input[name="has_facet_dashboard"]
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

${radioBtnCreatePkgByUrl}                                      xpath=//div[@class='packageSelection']/div/p/label/input[@value='URL']
${txtPackageExportUrl}                                         xpath=//input[@name='package_export_url']
${chkExportPackageCheck}                                       xpath=//a[@id='ExportPackageCheckButton']
${exportPackageUrl}                                            https://nl-vrushali.eatestad.local/vrushali_master/en/search/searchpage#/?sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20facetcat_itemtype:(facet_angle)%20AND%20facetcat_models:(EA2_800)
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
    Select Radio Button     packageCreationBy       Selection
    Wait Until Export Package Popup Is Ready

Click on OK button in Create Package popup
    Click Element    ${btnExportPackagePopup}
    Wait Until Element Is Not Visible    ${btnExportPackagePopup}
    Wait MC Progress Bar Closed
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done

Check The Existence Of Package Export Url Input Field And Enter The Url
    ${urlInputField}    Run Keyword And Return Status    Page Should Contain Element    ${txtPackageExportUrl}
    Run Keyword If    ${urlInputField} == True    Enter Package Export Url Into Input Field     ${exportPackageUrl}

Enter Package Export Url Into Input Field
    [Arguments]     ${url}
    Wait Until Element Is Visible    ${txtPackageExportUrl}
    Input Text      ${txtPackageExportUrl}      ${url}

Click On Check Button
    ${value}     Run Keyword And Return Status    Page Should Contain Element      ${chkExportPackageCheck}
    Run Keyword If    ${value} == True      Click Element       ${chkExportPackageCheck}

