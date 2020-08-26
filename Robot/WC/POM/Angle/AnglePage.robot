*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/FiltersPanel.robot
Resource            ${EXECDIR}/WC/POM/Shared/EditDescriptionPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleSidePanel.robot
Resource            ${EXECDIR}/WC/POM/Angle/AnglePublishingPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleValidatingPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleExecuteParametersPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleWarningPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AddFilterPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayDetailPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayList.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayChart.Robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayPivot.Robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleStatisticPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayStatisticPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.Robot
Resource            ${EXECDIR}/WC/POM/Angle/SaveAngleAsPopup.Robot
Resource            ${EXECDIR}/WC/POM/Angle/SaveDisplayAsPopup.Robot
Resource            ${EXECDIR}/WC/POM/Angle/AddJumpPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/ExportToExcelPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/ExportToCSVPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayTabMenu.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayOverview.robot
Resource    		${EXECDIR}/WC/POM/Angle/ScheduleAngle.robot

*** Variables ***
${divExecutionInfo}                     jquery=.display-execution-info
${tabCurrentDisplay}                    jquery=#DisplayTabs .tab-menu.active
${tabCurrentDisplayIcon}                jquery=#DisplayTabs .tab-menu.active .display-icon
${tabCurrentDisplayName}                jquery=#DisplayTabs .tab-menu.active .name
${icoDisplayWarningItems}               jquery=#DisplayTabs .tab-menu .validWarning
${icoDisplayErrorItems}                 jquery=#DisplayTabs .tab-menu .validError

${btnSaveMain}              css=#AngleSavingWrapper .btn-main-saving
${btnSaveOptions}           css=#AngleSavingWrapper .btn-saving-options
${btnSaveAll}               css=#AngleSavingWrapper .action-save-all
${btnSaveAngle}             css=#AngleSavingWrapper .action-save-angle
${btnSaveDisplay}           css=#AngleSavingWrapper .action-save-display
${btnSaveangleAs}           css=#AngleSavingWrapper .action-save-angle-as
${btnSaveDisplayAs}         css=#AngleSavingWrapper .action-save-display-as
${btnSetToTemplate}         css=#AngleSavingWrapper .action-set-template
${btnSetToAngle}            css=#AngleSavingWrapper .action-set-angle
${iconTemplate}             css=#SectionInfo .icon-template

${btnAngleActionMeatBalls}                          css=#ActionDropdownList
${ddlAngleActionDropdownListCopyDisplay}            css=#ActionDropdownListPopup .copydisplay
${ddlAngleActionDropdownListPasteDisplay}           css=#ActionDropdownListPopup .pastedisplay
${ddlAngleActionDropdownListExportToExcel}          css=#ActionDropdownListPopup .exportToExcel
${ddlAngleActionDropdownListExportToCSV}            css=#ActionDropdownListPopup .exportToCSV
${ddlAngleActionDropdownListAddToDashboard}         css=#ActionDropdownListPopup .addToDashboard
${ddlAngleActionDropdownListCreateList}             css=#ActionDropdownListPopup .createList
${ddlAngleActionDropdownAddJump}                    css=#ActionDropdownListPopup .addFollowup
${ddlAngleActionDropdownListEditDisplay}            css=#ActionDropdownListPopup .editDisplay
${ddlAngleActionDropdownListExecuteDisplay}         css=#ActionDropdownListPopup .exitEditMode
${ddlAngleActionDropdownDownload}                   css=#ActionDropdownListPopup .download
${ddlAngleActionDropdownScheduleAngle}              css=#ActionDropdownListPopup .scheduleAngle
${chkDisplaysSection}                               jquery=.publish-displays .accordion-body .listview-item    

${btnNewDisplay}                                    css=.btn-new-display
${btnConfirmDeleteDisplay}              btn-popupNotification1

${btnShowPublishSettings}           css=#ShowPublishSettingsButton
${btnShowValidateButton}            css=#ShowValidateButton

${popupNotification}         css=#popupNotification
${btnCancelConfirmation}     css=#btn-popupNotification0

*** Keywords ***
Get Angle Uri
    ${uri}  Execute JavaScript  return WC.Utility.UrlParameter('angle');
    [Return]  ${uri}

Get Display Uri
    ${uri}  Execute JavaScript  return WC.Utility.UrlParameter('display');
    [Return]  ${uri}

Is Adhoc Angle
    ${isAdhoc}  Execute JavaScript
    ...    var uri=WC.Utility.UrlParameter('angle');
    ...    return WC.ModelHelper.IsAdhocUri(uri);
    [Return]  ${isAdhoc}

Is Adhoc Display
    ${isAdhoc}  Execute JavaScript
    ...    var uri=WC.Utility.UrlParameter('display');
    ...    return WC.ModelHelper.IsAdhocUri(uri);
    [Return]  ${isAdhoc}

Get Angle Name
    ${name}  Get Text  css=#SectionInfo .name
    [Return]  ${name}

Angle Name Should Be
    [Arguments]    ${expected}
    ${name}  Get Angle Name
    Should Be Equal  ${name}  ${expected}

Wait Angle Page Document Loaded
    Wait Until Page Initialized
    Wait Until Page Contains Element    ${tabCurrentDisplay}    60s
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Wait Display Executed
    Wait Progress Bar Closed
    Check If Angle Or Display Has Execute Parameters Then Execute The Popup
    Check If Angle Or Display Has A Warning Then Close The Popup
    ${displayType}    Get Current Display Type
    Run Keyword If    '${displayType}' == 'list'     Wait Until List Display Loaded
    ...    ELSE IF    '${displayType}' == 'pivot'    Wait Until Pivot Display Loaded
    ...    ELSE IF    '${displayType}' == 'chart'    Wait Until Chart Display Loaded

Reload Angle Page
    Reload Page
    Wait Angle Page Document Loaded

Is Angle Executed
    ${selector}   Get JQuery Selector  ${divExecutionInfo}
    ${executed}   Execute JavaScript  var text=$.trim($('${selector}').text());return text && text!=='Angle is not executed';
    [Return]  ${executed}

Click Main Save
    Click Element  ${btnSaveMain}

Main Save Button Should Be Available
    Page Should Contain Element  ${btnSaveMain}

Main Save Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveMain}

Main Save Button Should Be Enable
    Page Should Contain Element  ${btnSaveMain}:not(.disabled)

Main Save Button Should Be Disabled
    Page Should Contain Element  ${btnSaveMain}.disabled

Main Save Button Is Save All
    Element Text Should Be  ${btnSaveMain}  Save all

Main Save Button Is Save Angle
    Element Text Should Be  ${btnSaveMain}  Save

Main Save Button Is Save Display
    Element Text Should Be  ${btnSaveMain}  Save Display

Main Save Button Is Save Angle As
    Element Text Should Be  ${btnSaveMain}  Save Angle as...

Main Save Button Is Save Display As
    Element Text Should Be  ${btnSaveMain}  Save Display as...

Main Save Button Is Download Angle
    Element Text Should Be  ${btnSaveMain}  Download Angle

Click Option Save
    [Arguments]    ${element}
    Click Caret Of Save Button
    Click Element  ${element}

Click Caret Of Save Button
    Click Element  ${btnSaveOptions}
    Sleep  ${TIMEOUT_LARGEST}

Click Save All
    ${hasButton}  Is Element Exist  ${btnSaveAll}
    Run Keyword If  ${hasButton}  Click Option Save  ${btnSaveAll}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Display Executed

Save All Button Should Be Available
    Page Should Contain Element  ${btnSaveAll}

Save All Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveAll}

Save All Button Should Be Enable
    Page Should Contain Element  ${btnSaveAll}:not(.disabled)

Save All Button Should Be Disabled
    Page Should Contain Element  ${btnSaveAll}.disabled

Click Save Angle
    ${hasButton}  Is Element Exist  ${btnSaveAngle}
    Run Keyword If  ${hasButton}  Click Option Save  ${btnSaveAngle}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Display Executed

Click Save Angle And Expect Warning
    ${hasButton}  Is Element Exist  ${btnSaveAngle}
    Run Keyword If  ${hasButton}  Click Option Save  ${btnSaveAngle}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Element Should Be Visible   ${popupNotification}

Save Angle Button Should Be Available
    Page Should Contain Element  ${btnSaveAngle}

Save Angle Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveAngle}

Save Angle Button Should Be Enable
    Page Should Contain Element  ${btnSaveAngle}:not(.disabled)

Save Angle Button Should Be Disabled
    Page Should Contain Element  ${btnSaveAngle}.disabled

Click Save Display
    ${hasButton}  Is Element Exist  ${btnSaveDisplay}
    Run Keyword If  ${hasButton}  Click Option Save  ${btnSaveDisplay}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Display Executed

Save Display Button Should Be Available
    Page Should Contain Element  ${btnSaveDisplay}

Save Display Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveDisplay}

Save Display Button Should Be Enable
    Page Should Contain Element  ${btnSaveDisplay}:not(.disabled)

Save Display Button Should Be Disabled
    Page Should Contain Element  ${btnSaveDisplay}.disabled

Click Save Angle As
    ${hasButton}  Is Element Exist  ${btnSaveAngleAs}
    Run Keyword If  ${hasButton}  Click Option Save   ${btnSaveAngleAs}
    ...    ELSE                   Click Main Save
    Wait Until Save Angle As Popup Loaded

Save Angle As Button Should Be Available
    Page Should Contain Element  ${btnSaveAngleAs}

Save Angle As Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveAngleAs}

Save Angle As Button Should Be Enable
    Page Should Contain Element  ${btnSaveAngleAs}:not(.disabled)

Save Angle As Button Should Be Disabled
    Page Should Contain Element  ${btnSaveAngleAs}.disabled

Click Save Display As
    ${hasButton}  Is Element Exist  ${btnSaveDisplayAs}
    Run Keyword If  ${hasButton}  Click Option Save  ${btnSaveDisplayAs}
    ...    ELSE                   Click Main Save
    Wait Until Save Display As Popup Loaded

Save Display As Button Should Be Available
    Page Should Contain Element  ${btnSaveDisplayAs}

Save Display As Button Should Not Be Available
    Page Should Not Contain Element  ${btnSaveDisplayAs}

Save Display As Button Should Be Enable
    Page Should Contain Element  ${btnSaveDisplayAs}:not(.disabled)

Save Display As Button Should Be Disabled
    Page Should Contain Element  ${btnSaveDisplayAs}.disabled

Click Set Angle To Template
    ${hasButton}    Is Element Exist    ${btnSetToTemplate}  
    Run Keyword If  ${hasButton}  Click Option Save    ${btnSetToTemplate}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Display Executed

Set To Template Button Should Available
    Page Should Contain Element    ${btnSetToTemplate}

Set To Template Button Should Not Available
    Page Should Not Contain Element    ${btnSetToTemplate}

Set To Template Buttom Should Be Disabled
    Page Should Contain Element    ${btnSetToTemplate}.disabled

Set To Template Buttom Should Be Enable
    Page Should Contain Element    ${btnSetToTemplate}:not(.disabled)

Click Set Template To Angle
    ${hasButton}    Is Element Exist    ${btnSetToAngle}  
    Run Keyword If  ${hasButton}  Click Option Save    ${btnSetToAngle}
    ...    ELSE                   Click Main Save
    Wait Progress Bar Closed
    Wait Until Ajax Complete
    Page Should Contain Toast Success
    Wait Display Executed

Set To Angle Button Should Be Available
    Page Should Contain Element    ${btnSetToAngle}

Set To Angle Button Should Not Be Available
    Page Should Not Contain Element    ${btnSetToAngle}

Set To Angle Buttom Should Be Disabled
    Page Should Contain Element    ${btnSetToAngle}.disabled

Set To Angle Buttom Should Be Enable
    Page Should Contain Element    ${btnSetToAngle}:not(.disabled)

Click Angle Action
    [Arguments]    ${actionSelector}
    ${isMeatBallsVisibled}=  Run Keyword And Return Status    Element Should Be Visible    ${btnAngleActionMeatBalls}
    Run keyword if    ${isMeatBallsVisibled}    Click Element    ${btnAngleActionMeatBalls}
    Wait Until Page Contains Element    ${actionSelector}
    Click Element    ${actionSelector}

Check Template Icon Is Visible
    Element Should Be Visible    ${iconTemplate} 

Check Template Icon Is Not Visible
    Page Should Not Contain Element    ${iconTemplate}

Click To Create New Display
    Click Angle Action    ${btnNewDisplay}

Click Angle Dropdown Actions Copy Display
    Click Angle Action    ${ddlAngleActionDropdownListCopyDisplay}
	
Click Angle Dropdown Actions Paste Display
    Click Angle Action    ${ddlAngleActionDropdownListPasteDisplay}

Click Angle Dropdown Actions Edit Display
    Click Angle Action    ${ddlAngleActionDropdownListEditDisplay}
    Wait Display Detail Document Loaded

Click Angle Dropdown Actions Create List
    Click Angle Action    ${ddlAngleActionDropdownListCreateList}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Click Angle Dropdown Add Jump
    Click Angle Action    ${ddlAngleActionDropdownAddJump}
    Wait Until Add Jump Popup Loaded

Click Angle Dropdown Actions Add To Dashboard
    Click Angle Action    ${ddlAngleActionDropdownListAddToDashboard}
    Wait Add To Dashboard Popup Load

Click Angle Dropdown To Export Excel
    Click Angle Action    ${ddlAngleActionDropdownListExportToExcel}
    Wait Until Export To Excel Popup Loaded

Click Angle Dropdown To Export CSV
    Click Angle Action    ${ddlAngleActionDropdownListExportToCSV}
    Wait Until Export To CSV Popup Loaded

Click Angle Dropdown To Export Drilldown To Excel
    Click Angle Action    ${ddlAngleActionDropdownListExportToExcel}
    Wait Until Export Drilldown To Excel Popup Loaded

Click Angle Dropdown To Execute Display
    Click Angle Action    ${ddlAngleActionDropdownListExecuteDisplay}
    Wait Display Executed

Click Download Angle
    Click Element  ${ddlAngleActionDropdownDownload}

Click On Schedule Angle
    Wait Until Page Contains Element    ${ddlAngleActionDropdownScheduleAngle}
    Click Element    ${ddlAngleActionDropdownScheduleAngle}
    Wait Until Schedule Angle Popup Ready

Download Button Should Be Available
    Element Should Be Visible  ${ddlAngleActionDropdownDownload}

Download Button Should Not Be Available
    Element Should Not Be Visible  ${ddlAngleActionDropdownDownload}

Angle Downloading Should Get A Confirmation Popup
    Click Download Angle
    Page Should Contain Element  ${popupNotification} .confirm
    Click Element   ${btnCancelConfirmation}

Get Display Type
    [Arguments]    ${item}
    ${selector}    Get JQuery Selector    ${item}
    ${displayType}    Execute JavaScript
    ...    var element = $('${selector}');
    ...    var displayType = '';
    ...    if (element.hasClass('icon-list')) displayType = 'list';
    ...    else if (element.hasClass('icon-chart')) displayType = 'chart';
    ...    else if (element.hasClass('icon-pivot')) displayType = 'pivot';
    ...    return displayType;
    [Return]    ${displayType}

Get Display Type By Index
    [Arguments]    ${index}
    ${displayType}    Get Display Type    ${divDisplayTabMenus}:eq(${index}) .display-icon
    [Return]    ${displayType}

Get Current Display Type
    ${displayType}    Get Display Type  ${tabCurrentDisplayIcon}
    [Return]    ${displayType}

Display Type Should Be Equal To
    [Arguments]    ${displayType}
    ${currentDisplayType}    Get Current Display Type
    Should Be True    '${currentDisplayType}'=='${displayType}'

Click Confirm Delete Display
    Wait Until Page Contains    Delete Display:
    Click Element    ${btnConfirmDeleteDisplay}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Get Display Warning Count
    ${count}    Get Element Count    ${icoDisplayWarningItems}
    [Return]    ${count}

Get Display Error Count
    ${count}    Get Element Count    ${icoDisplayErrorItems}
    [Return]    ${count}

Is Angle From Template
    ${isAngleTemplate}    Execute Javascript    return angleInfoModel.IsTemporaryAngle()!='' && angleInfoModel.GetTemplateAngle()!=null
    [Return]    ${isAngleTemplate}

Click Edit Display
    Click Element   ${ddlAngleActionDropdownListEditDisplay}
    Wait Display Detail Document Loaded

Wait Until Notification Popup Show
    Wait Until Element Is Visible     ${popupNotification}

Get Display Name By Index
    [Arguments]    ${index}
    ${ddlSelectDisplaySelector}    Get JQuery Selector    ${divDisplayTabMenus} .name:eq(${index})
    ${displayName}    Execute JavaScript    return $('${ddlSelectDisplaySelector}').text().trim()
    [Return]    ${displayName}

Get Current Display Name
    ${currentDsplaySelector}    Get JQuery Selector    ${tabCurrentDisplayName}
    ${displayName}    Execute JavaScript    return $('${currentDsplaySelector}').text().trim()
    [Return]    ${displayName}

Check All Display Are Checked
    Page Should Contain Element     ${chkDisplaysSection} input:checkbox(:checked)
    Page Should Not Contain Element     ${chkDisplaysSection} input:checkbox:not(:checked)

Open Angle Publishing Popup
    Click Element   ${btnShowPublishSettings}
    Wait Angle Publishing Popup Loaded

Angle Publishing Should Get A Confirmation Popup
    Click Element   ${btnShowPublishSettings}
    Page Should Contain Element  ${popupNotification} .confirm
    Click Element   ${btnCancelConfirmation}

Check Angle Is Published
    Page Should Contain Element    ${btnShowPublishSettings}.btn-primary

Check Angle Is Unpublished
    Page Should Contain Element    ${btnShowPublishSettings}.btn-light

Open Angle Validating Popup
    Click Element   ${btnShowValidateButton}
    Wait Angle Validating Popup Loaded

Check Angle Is Validated
    Page Should Contain Element    ${btnShowValidateButton}.btn-success

Check Angle Is Unvalidated
    Page Should Contain Element    ${btnShowValidateButton}.btn-light