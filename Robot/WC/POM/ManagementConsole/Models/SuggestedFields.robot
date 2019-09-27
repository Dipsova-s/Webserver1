*** Variables ***
${btnSuggestedSingleObject}              jquery=.contentSectionInfoItem [data-target="#popupClassesChooser"]:eq(0)
${btnSuggestedBasicList}                 jquery=.contentSectionInfoItem [data-target="#popupClassesChooser"]:eq(1)
${btnSuggestedDefaultTemplate}           jquery=.contentSectionInfoItem [data-target="#popupClassesChooser"]:eq(2)
${btnSuggestedAllTemplate}               jquery=.contentSectionInfoItem [data-target="#popupClassesChooser"]:eq(3)
${btnSuggestedClearAll}                  jquery=.contentSectionInfoItem [data-target="#popupClassesChooser"]:eq(4)

${btnSuggestedBusinessProcess}           jquery=#CreateAngleByObjectBusinessProcess
${btnContinue}                           ButtonContinue
${divFacetFieldType}                     fieldtype
${divFacetSourceObject}                  source

${chkSulf}                               1
${chkCurrency}                           currency
${chkSuggested}                          suggested

${FieldMargin}                           field-Margin
${FieldMarginValue}                      field-MaterialValue
${FieldCompanyCode}                      field-CompanyCode__CompanyCode
${FieldID}                               field-ID
${FieldVendor}                           field-Vendor__Vendor

${btnSaveSuggestedField}                 jquery=#popupFieldChooser .btnAddProperty
${btnConfirmSuggestedField}              jquery=#popupSelectedClasses .btnPrimary
${btnClearAll}                           jquery=#popupFieldChooser .btnClearAll
${btnSelectAll}                          jquery=#popupFieldChooser .btnSelectAll
${btnCancelPopup}                        jquery=#popupFieldChooser .btnPropertyCancel

${btnCloseSuggestedReport}               jquery=#loading .loadingClose
${txtSuggestedResult}                    jquery=#loading .fail

${txtSuccess}                            jquery=.loadingContentText .success

#Amount of Items
${txtSelectedItem}                       selectedItems
${txtTotalItem}                          css=#totalDisplayFieldsDatarow
${txtUndefined}                          jquery=.loadingContent li.success:contains("Valueundefined")

*** Keywords ***
Wait Until Suggested Fields Page Loaded
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Element Is Visible    ${btnSuggestedSingleObject}

Click Set Fields Button For Single Object
    Click Element    ${btnSuggestedSingleObject}

Wait Popup Set Suggested Fields Object Loaded
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Element Is Visible    ${txtFitlerObjects}
    Wait Until Element Is Visible    ${btnFitlerObjects}
    Wait Until Element Is Visible    ${divObjectListDescriptionSection}
    Wait Until Element Is Visible    ${gridObjectList}
    Wait Until Element Is Visible    ${divObjectListBusinessProcessBarSection}

Select Business Process On Suggested Popup
    [Arguments]    ${BusinessProcess}
    Click Element    ${btnSuggestedBusinessProcess} .${BusinessProcess}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Page Contains Element     ${gridObjectList}

Fill In Search Object
    [Arguments]    ${ObjectName}
    Fill In Search Create Angle By Object List Popup    ${ObjectName}
    Wait Until Ajax Complete

Click Continue
    Sleep    ${TIMEOUT_GENERAL}
    Click Element    ${btnContinue}
    Wait Until Ajax Complete

Click Facet Fields Type
    Sleep    1s
    Click Element    ${divFacetFieldType}
    Sleep    ${TIMEOUT_GENERAL}

Click Facet Source Object
    Click Element    ${divFacetSourceObject}
    Wait Until Ajax Complete

Select Filter (Self)
    Select Checkbox    ${chkSulf}
    Wait Until Ajax Complete

Click Select All Items
    Click Element    ${btnSelectAll}
    Wait Until Ajax Complete

Select Filter Currency
    Select Checkbox    ${chkCurrency}
    Wait Until Ajax Complete

Click Save Suggested Field
    Click Element    ${btnSaveSuggestedField}
    Sleep    ${TIMEOUT_GENERAL}

Click Save Confirm Suggestion Field
    Wait Until Page Contains Element    ${btnConfirmSuggestedField}
    Click Element    ${btnConfirmSuggestedField}
    Wait Until Suggested Report Loaded

Wait Until Suggested Report Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains    Manage suggested fields report
    Page Should Contain Element      ${txtSuccess}   
    Wait Until Element Is Visible    ${btnCloseSuggestedReport}

Verify "undefined" Word On SuggestedFields Report
    Page Should Not Contain Element    ${txtUndefined}

Click Close Suggested Field Report
    Get Suggested Report When Failed
    Click Element    ${btnCloseSuggestedReport}
    Wait Until Suggested Fields Page Loaded

Get Suggested Report When Failed
    Capture Page Screenshot
    ${SuggestedResult}    Get Element Count    ${txtSuggestedResult}
    Run Keyword If    ${SuggestedResult} > 1    Show Message IF Failed Suggested

Show Message IF Failed Suggested
    Log    There is Failed Setting Suggested Field!!!

Select Filter Suggested
    Select Checkbox    ${chkSuggested}
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_LARGEST}

Click Clear All Button
    Sleep    ${TIMEOUT_LARGEST}
    Click Element    ${btnClearAll}
    Wait Until Ajax Complete

Click Set Fields Button For Basic List
    Click Element    ${btnSuggestedBasicList}
    Sleep    1s
    Wait Until Ajax Complete

Click Set Fields Button For Default Template
    Click Element    ${btnSuggestedDefaultTemplate}
    Sleep    1s
    Wait Until Ajax Complete

Click Set Fields Button For All Template
    Click Element    ${btnSuggestedAllTemplate}
    Sleep    1s
    Wait Until Ajax Complete

Click Set Fields Button For Clear All Suggestion
    Click Element    ${btnSuggestedClearAll}
    Sleep    1s
    Wait Until Ajax Complete

Compare Amount Of Items
    ${Result}    Get Amount Of Selected Item
    ${Expected}    Get Amount Of Total Item
    Should Be Equal    ${Result}    ${Expected}
    Click Close Selected Popup

Get Amount Of Selected Item
    Sleep    1s
    ${text}    Get Text    jquery=#${txtSelectedItem}
    ${expectItem} =    Execute Javascript    return '${text}'.split(' i')[0]
    [Return]    ${expectItem}

Get Amount Of Total Item
    ${totalItem}    Get Text    ${txtTotalItem}
    [Return]    ${totalItem}

Click Close Selected Popup
    Wait Until Element Is Visible    ${btnCancelPopup}
    Click Element    ${btnCancelPopup}