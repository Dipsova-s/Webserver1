*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/FiltersPanel.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleDetailPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AnglePublishingPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleValidatingPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleExecuteParametersPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleWarningPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/AddFilterPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayDetailPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayList.robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayChart.Robot
Resource            ${EXECDIR}/WC/POM/Angle/DisplayPivot.Robot
Resource            ${EXECDIR}/WC/POM/Angle/AngleInfoPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.Robot
Resource            ${EXECDIR}/WC/POM/Angle/SaveDisplayAsPopup.Robot
Resource            ${EXECDIR}/WC/POM/Angle/AddJumpPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/ExportToExcelPopup.robot
Resource            ${EXECDIR}/WC/POM/Angle/ExportToCSVPopup.robot

*** Variables ***
${spanSelectedDisplay}                  css=.SelectedDisplayItem .name
${ddlSelectDisplay}                     SelectedDisplay
${ddlSelectDisplayHandle}               css=.SelectedDisplayPointer
${ddlSelectDisplayItemList}             jquery=#DisplayItemList
${ddlSelectDisplayItems}                jquery=#DisplayItemList .ItemList
${ddlSelectDisplayWarningItems}         jquery=#DisplayItemList .ItemList.validWarning
${ddlSelectDisplayErrorItems}           jquery=#DisplayItemList .ItemList.validError
${ddlSelectDisplaySelectedItem}         jquery=#DisplayItemList .ItemListSelected
${btnCurrentDisplayDelete}              jquery=#SelectedDisplay .ItemListSelected .btnDelete
${ddlCurrentDisplayIcon}                jquery=#SelectedDisplay .SelectedDisplayItem .icon:eq(1)
${btnConfirmDeleteDisplay}              btn-popupNotification1
${btnToggleAnglePanel}                  ToggleAngle
${divLastRemovableDisplayFilter}        jquery=#DisplayDescriptionWrapper li.removable:last .filter
${divPanelDisplayFilters}               jquery=#DisplayDescriptionWrapper
${divPanelDisplayFilterItems}           jquery=#DisplayDescriptionWrapper .detailDefinitionList li
${divPrivateNote}                       YourNote

${btnAngleActionMeatBalls}                          css=#ActionDropdownList
${ddlAngleActionDropdownListCreateNewDisplay}       css=#ActionDropdownListPopup .newDisplay
${ddlAngleActionDropdownListSaveDisplay}            css=#ActionDropdownListPopup .save
${ddlAngleActionDropdownListSaveDisplayAs}          css=#ActionDropdownListPopup .saveAs
${ddlAngleActionDropdownListCopyDisplay}            css=#ActionDropdownListPopup .copydisplay
${ddlAngleActionDropdownListPasteDisplay}           css=#ActionDropdownListPopup .pastedisplay
${ddlAngleActionDropdownListExportToExcel}          css=#ActionDropdownListPopup .exportToExcel
${ddlAngleActionDropdownListExportToCSV}            css=#ActionDropdownListPopup .exportToCSV
${ddlAngleActionDropdownListAddToDashboard}         css=#ActionDropdownListPopup .addToDashboard
${ddlAngleActionDropdownListCreateList}             css=#ActionDropdownListPopup .createList
${ddlAngleActionDropdownAddJump}                    css=#ActionDropdownListPopup .addFollowup
${ddlAngleActionDropdownListEditDisplay}            css=#ActionDropdownListPopup .editDisplay

${lnkEditAngle}    css=#AngleDescriptionWrapper .descriptionHeader a
${lnkEditDisplay}    css=#DisplayDescriptionWrapper .descriptionHeader a

${rdoExecuteParemeter}     AskValue-0
${btnShowPublishSettings}      css=#ShowPublishSettingsButton
${btnShowValidateButton}       css=#ShowValidateButton

*** Keywords ***
Wait Angle Page Document Loaded
    Wait Until Page Initialized
    Wait Until Page Contains Element    ${ddlSelectDisplay}    60s
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

Click Toggle Angle
    Click Element   ${btnToggleAnglePanel}
    Sleep    ${TIMEOUT_GENERAL}

Display Panel Should Not Have Filter
    Page Should Not Contain Element    ${divPanelDisplayFilterItems}

Get Filter Or Jump Name From Display Panel
    [Arguments]    ${index}
    ${text}    Get Text   ${divPanelDisplayFilterItems}:eq(${index})
    [Return]    ${text}

Filter Text Should Not Be In Display Panel
    [Arguments]    ${text}
    Element Should Not Contain    ${divPanelDisplayFilters}    ${text}

Filter Text Should Be In Display Panel
    [Arguments]    ${text}
    Element Should Contain    ${divPanelDisplayFilters}    ${text}

Click Remove Last Adhoc Filter
    Click Element   ${divLastRemovableDisplayFilter}
    Wait Progress Bar Closed

Click Angle Action
    [Arguments]    ${actionSelector}
    ${isMeatBallsVisibled}=  Run Keyword And Return Status    Element Should Be Visible    ${btnAngleActionMeatBalls}
    Run keyword if    ${isMeatBallsVisibled}    Click Element    ${btnAngleActionMeatBalls}
    Click Element    ${actionSelector}

Click Angle Dropdown Actions Create New Display
    Click Angle Action    ${ddlAngleActionDropdownListCreateNewDisplay}

Click Angle Dropdown Actions Save Display As
    Click Angle Action    ${ddlAngleActionDropdownListSaveDisplayAs}

Click Angle Dropdown Actions Copy Display
    Click Angle Action    ${ddlAngleActionDropdownListCopyDisplay}

Click Angle Dropdown Actions Paste Display
    Click Angle Action    ${ddlAngleActionDropdownListPasteDisplay}

Click Angle Dropdown Actions Save Adhoc Display
    Click Angle Action    ${ddlAngleActionDropdownListSaveDisplay}
    Wait Until Page Contains    Save Display as...
    Wait Until Page Contains Element    ${txtSaveAsDisplayName}
    Wait Until Page Contains Element    ${btnSubmitSaveAsDisplay}

Click Angle Dropdown Actions Save Existing Display
    Click Angle Action    ${ddlAngleActionDropdownListSaveDisplay}
    Wait Progress Bar Closed

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

Get Display Type
    [Arguments]    ${index}
    ${ddlSelectDisplayIconSelector}    Get JQuery Selector    ${ddlSelectDisplayItems} .icon:eq(1)
    ${displayType}    Execute JavaScript    return $.trim($('${ddlSelectDisplayIconSelector}').attr('class').replace('icon ', '').replace(' default', ''));
    [Return]    ${displayType}

Get Current Display Type
    ${ddlCurrentDisplayIconSelector}    Get JQuery Selector    ${ddlCurrentDisplayIcon}
    ${displayType}    Execute JavaScript    return $.trim($('${ddlCurrentDisplayIconSelector}').attr('class').replace('icon ', '').replace(' default', ''));
    [Return]    ${displayType}

Display Type Should Be Equal To
    [Arguments]    ${displayType}
    ${currentDisplayType}    Get Current Display Type
    Should Be True    '${currentDisplayType}'=='${displayType}'

#Display Dropdown
Open Display Dropdown
    Sleep    ${TIMEOUT_LARGEST}
    ${isDropdownVisible} =    Is Element Visible    ${ddlSelectDisplayItemList}
    Run Keyword If    ${isDropdownVisible} == False    Click Element    ${ddlSelectDisplayHandle}
    Run Keyword If    ${isDropdownVisible} == False    Sleep            ${TIMEOUT_DROPDOWN}

Close Display Dropdown
    ${isDropdownVisible} =    Is Element Visible    ${ddlSelectDisplayItemList}
    Run Keyword If    ${isDropdownVisible} == True    Click Element    ${ddlSelectDisplayHandle}
    Run Keyword If    ${isDropdownVisible} == True    Sleep            ${TIMEOUT_DROPDOWN}

Select Display From Display Dropdown
    [Arguments]  ${displayItem}
    Open Display Dropdown
    ${isVisible}    Is Element Visible    ${displayItem}
    Run Keyword If    ${isVisible} == False    Scroll Vertical To Element    ${ddlSelectDisplayItemList}    ${displayItem}
    ${itemSelector}    Get Jquery Selector    ${displayItem}
    Execute JavaScript    $('${itemSelector}').trigger('click');
    #Wait Until Element Is Visible    ${displayItem}
    #Click Element    ${displayItem}
    Sleep            ${TIMEOUT_DROPDOWN}

Click Delete Current Display
    Mouse Over    ${ddlSelectDisplaySelectedItem}
    Click Element    ${btnCurrentDisplayDelete}

Click Confirm Delete Display
    Wait Until Page Contains    Delete Display:
    Click Element    ${btnConfirmDeleteDisplay}
    Wait Progress Bar Closed

Click Delete Display
    [Arguments]  ${displayName}
    Mouse Over    ${ddlSelectDisplayItems}[title="${displayName}"]
    Click Element    ${ddlSelectDisplayItems}[title="${displayName}"] .btnDelete

Get Display Warning Count
    ${count}    Get Elements Count    ${ddlSelectDisplayWarningItems}
    [Return]    ${count}

Get Display Error Count
    ${count}    Get Elements Count    ${ddlSelectDisplayErrorItems}
    [Return]    ${count}
#End Display Dropdown

Is Adhoc Angle
    ${isAdhoc} =    Execute Javascript    return angleInfoModel.IsTemporaryAngle()!=''
    [Return]    ${isAdhoc}

Is Angle From Template
    ${isAngleTemplate} =    Execute Javascript    return angleInfoModel.IsTemporaryAngle()!='' && angleInfoModel.GetTemplateAngle()!=null
    [Return]    ${isAngleTemplate}

Check If Angle Is A Template Then Close The Popup
    ${statusTemplate} =  Is Angle From Template
    Run Keyword If    ${statusTemplate} == True    Wait Angle Detail Document Loaded
    Run Keyword If    ${statusTemplate} == True    Close Angle Popup Detail

Click Edit Angle
    Click Element   ${lnkEditAngle}
    Wait Angle Detail Document Loaded
    Wait Until Element Is Visible    ${tabAngleGeneral}

Click Edit Display
    Click Element   ${lnkEditDisplay}
    Wait Display Detail Document Loaded

Wait Until Notification Popup Show
    Wait Until Element Is Visible     ${popupNotification}

Get Selected Display Name
    ${ddlSelectDisplaySelector}    Get JQuery Selector    ${spanSelectedDisplay}
    ${displayName}    Execute JavaScript    return $('${ddlSelectDisplaySelector}').text()
    [Return]    ${displayName}

Get Display Name By Index
    [Arguments]    ${index}
    ${ddlSelectDisplaySelector}    Get JQuery Selector    ${ddlSelectDisplayItems} .name:eq(${index})
    ${displayName}    Execute JavaScript    return $('${ddlSelectDisplaySelector}').text()
    [Return]    ${displayName}

Open Angle Publishing Popup
    Click Element   ${btnShowPublishSettings}
    Wait Angle Publishing Popup Loaded

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
