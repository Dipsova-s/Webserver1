*** Variables ***
${divClassChooser}                       popupClassesChooser
${divSelectedClass}                      popupSelectedClasses
${divFieldChooser}                       popupFieldChooser

${btnSuggestedSingleObject}              jquery=.contentSectionInfoItem [data-target="#${divClassChooser}"]:eq(0)
${btnSuggestedBasicList}                 jquery=.contentSectionInfoItem [data-target="#${divClassChooser}"]:eq(1)
${btnSuggestedDefaultTemplate}           jquery=.contentSectionInfoItem [data-target="#${divClassChooser}"]:eq(2)
${btnSuggestedAllTemplate}               jquery=.contentSectionInfoItem [data-target="#${divClassChooser}"]:eq(3)
${btnSuggestedClearAll}                  jquery=.contentSectionInfoItem [data-target="#${divClassChooser}"]:eq(4)

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

${btnSaveSuggestedField}                 jquery=#${divFieldChooser} .btnAddProperty
${btnConfirmSuggestedField}              jquery=#${divSelectedClass} .btnPrimary
${btnClearAll}                           jquery=#${divFieldChooser} .btnClearAll
${btnSelectAll}                          jquery=#${divFieldChooser} .btnSelectAll

${btnCloseSuggestedReport}               jquery=#LoaderContainer .loader-cancel-button:visible
${txtSuggestedResult}                    jquery=#LoaderContainer .fail

${txtSuccess}                            jquery=#LoaderContainer .success

#Amount of Items
${txtSelectedItem}                       selectedItems
${txtTotalItem}                          totalDisplayFieldsDatarow
${txtUndefined}                          jquery=.loadingContent li.success:contains("Valueundefined")

${LocatorAllSuggestedBusinessProcess}   xpath=//div[@class='businessProcesses flat businessProcessesCompact flexible']/div[@title]/a
${LocatorGeneralInformationText}        xpath=//div[@class='contentSection contentSectionDescription']/p
${btnSelectAllLocator}                  xpath=//a[@class='btn btnLarge btnLeft btnSelectAll']   
${btnCloseSuggestedReportLocator}       xpath=//div[contains(@class,'typeInfo')]//a
${btnClearFields}                       xpath=//a[@class='btn clearSuggestedFieldsbtn']
${btnWindowMaximize}                    xpath=//span[@id='popupSelectedClasses_wnd_title']/..//a[@aria-label='window-Maximize']
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
    Sleep    ${TIMEOUT_GENERAL}

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

Click Clear Fields Button For Clear All Suggestion
    Click Element    ${btnClearFields}
    Sleep    1s
    Wait Until Ajax Complete

Compare Amount Of Items
    ${Result}    Get Amount Of Selected Item
    ${Expected}    Get Amount Of Total Item
    Should Be Equal    ${Result}    ${Expected}
    Close Suggested Field Popups

Get Amount Of Selected Item
    Sleep    1s
    ${text}    Get Text    jquery=#${txtSelectedItem}
    ${expectItem} =    Execute Javascript    return '${text}'.split(' i')[0]
    [Return]    ${expectItem}

Get Amount Of Total Item
    ${totalItem}    Get Text    ${txtTotalItem}
    [Return]    ${totalItem}

Close Suggested Field Popups
    Execute Javascript    $('#${divFieldChooser}').data('handler').close();
    ...                   $('#${divClassChooser}').data('handler').close();

Select All Business Process On Suggested Popup
    ${AllSuggestedBusinessProcess}=  Get Webelements   ${LocatorAllSuggestedBusinessProcess}   
    :For  ${EachBusinessProcess}   IN   @{AllSuggestedBusinessProcess}
    \    ${Business Process has Other}=  Run keyword and return status  Element Should Contain  ${EachBusinessProcess}  Other
    \   Run keyword if  ${Business Process has Other}==False  Custom click element    ${EachBusinessProcess} 
    \   Wait Until Ajax Complete
    \   Wait Until Page Contains Element     ${gridObjectList}

Click button Select All 
    Custom click element  ${btnSelectAllLocator}
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}

Click Button Save for clearing Suggestion Field
    Wait Until Page Contains Element    ${btnConfirmSuggestedField}
    Click Element    ${btnConfirmSuggestedField}
    Wait Until Ajax Complete
    Wait Until Page Contains    Manage suggested fields report
    Page Should Contain      Task Success.   
    
Click Close on Suggested Field Report
    Get Suggested Report When Failed
    Click Element    ${btnCloseSuggestedReportLocator}
    Wait Until Suggested Fields Page Loaded

Validate Total number of suggested fields in the model should be "${number}"
    Page Should Contain   Total number of suggested fields in the model: ${number}

Validate Number of objects that have suggested fields should be "${number}"
    Page Should Contain  Number of objects that have suggested fields: ${number}

Validate Number of objects that do not have suggested fields should be greater than zero
    ${GeneralInformationParagraph}=  Get Text   ${LocatorGeneralInformationText} 
    ${Pattern}=  set variable  Number of objects that do not have suggested fields:\\s[1-9]\\d*$
    ${GeneralInformationParagraphLinesCount}=   Get Line Count  ${GeneralInformationParagraph}
    set global variable   ${flag1}  False
    :For  ${i}  IN RANGE  0   ${GeneralInformationParagraphLinesCount}
    \   ${EachLine}=  Get Line  ${GeneralInformationParagraph}   ${i}
    \   ${Matching}=  Run keyword and return status   Should Match Regexp  ${EachLine}    ${Pattern}
    \   Run keyword if   ${Matching}==True   Run keywords    set global variable   ${flag1}  True     AND   Exit for loop
    
    log   ${flag1}
    Run keyword if  ${flag1}==True   Log   Number of objects that do not have suggested fields is greater than zero
    ...  ELSE    Fail   Number of objects that do not have suggested fields is not greater than zero

Validate Suggested fields settings last changed should have username, date and time
    ${GeneralInformationParagraph}=  Get Text   ${LocatorGeneralInformationText} 
    ${Pattern}=  set variable  Suggested fields settings last changed:\\s\\w*\\s\\d{1,2}/\\d{1,2}/\\d{4},\\s\\d{1,2}:\\d{1,2}:\\d{1,2}\\s[AP]M$
    ${GeneralInformationParagraphLinesCount}=   Get Line Count  ${GeneralInformationParagraph}
    set global variable   ${flag2}  False
    :For  ${i}  IN RANGE  0   ${GeneralInformationParagraphLinesCount}
    \   ${EachLine}=  Get Line  ${GeneralInformationParagraph}   ${i}
    \   ${Matching}=  Run keyword and return status   Should Match Regexp  ${EachLine}    ${Pattern}
    \   Run keyword if  ${Matching}==True   Run keywords    set global variable   ${flag2}  True     AND   Exit for loop

    log   ${flag2}
    Run keyword if  ${flag2}==True   Log   Suggested fields settings last changed has username, date and time
    ...  ELSE    Fail   Suggested fields settings last changed doesnot have username, date and time

Get Total number of suggested fields in the model
    ${GeneralInformationParagraph}=  Get Text   ${LocatorGeneralInformationText} 
    ${Pattern}=  set variable  Total number of suggested fields in the model:
    ${GeneralInformationParagraphLinesCount}=   Get Line Count  ${GeneralInformationParagraph}
    set global variable   ${NumberOfSuggestedFieldsInTheModel}  null
    :For  ${i}  IN RANGE  0   ${GeneralInformationParagraphLinesCount}
    \   ${EachLine}=  Get Line  ${GeneralInformationParagraph}   ${i}
    \   ${Matching}=  Run keyword and return status   Should Match Regexp  ${EachLine}    ${Pattern}
    \   Run keyword if   ${Matching}==True    Store SubString Using RegEx and exit for loop    \\d+  ${EachLine}
    
    ${NumberOfSuggestedFieldsInTheModel}=   Get From List  ${SubString}  0
    [Return]   ${NumberOfSuggestedFieldsInTheModel}

Store SubString Using RegEx and exit for loop
    [Arguments]   ${pattern}   ${string}
    ${SubString}=  Get Regexp Matches   ${string}  ${pattern}   
    set global variable   ${SubString}      ${SubString}
    Exit for loop
    

Get Number of objects that have suggested fields
    ${GeneralInformationParagraph}=  Get Text   ${LocatorGeneralInformationText} 
    ${Pattern}=  set variable  Number of objects that have suggested fields:
    ${GeneralInformationParagraphLinesCount}=   Get Line Count  ${GeneralInformationParagraph}
    set global variable   ${NumberOfobjectsHavingSuggestedFields}  null
    :For  ${i}  IN RANGE  0   ${GeneralInformationParagraphLinesCount}
    \   ${EachLine}=  Get Line  ${GeneralInformationParagraph}   ${i}
    \   ${Matching}=  Run keyword and return status   Should Match Regexp  ${EachLine}    ${Pattern}
    \   ${NumberOfobjectsHavingSuggestedFields}=  Run keyword if   ${Matching}==True   Store SubString Using RegEx and exit for loop    \\d+  ${EachLine}
    
     ${NumberOfobjectsHavingSuggestedFields}=   Get From List  ${SubString}  0
    [Return]   ${NumberOfobjectsHavingSuggestedFields}
    
Maximize popup window 
    Custom click element   ${btnWindowMaximize}
    wait Until Ajax Complete 