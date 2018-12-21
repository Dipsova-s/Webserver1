*** Variables ***
#General tab
${tabDisplayGeneral}    css=#DisplayGeneral
${ddlDisplayType}    css=#tempDisplayType_ddlWrapper
${txtDisplayId}           DisplayId
${btnAddLanguageDisplay}    css=.btnAddLanguage
${displayLanguageAvailableList}    jquery=#DisplayDescriptionSection .languageAvailableList .Item
${displayLanguageItem}    jquery=.LanguageItem a
${txtDisplayName}     css=#DisplayGeneralArea .languageName
${txtDisplayDescription}     css=#DisplayGeneralArea .languageDescription
${chkDisplayExecuteAtLogin}      css=#ExecuteDisplayAtLogin
${chkDefaultDisplay}             css=#IsDefaultDisplay

#Filters & Jumps
${tabDisplayFilterAndJumps}         DisplayFilter
${btnAddDisplayFilter}              DisplayAddfilter
${btnAddDisplayJump}                AddFollowUp
${divExpandedFilters}               .FilterHeader.Expand
${divMoveToAngleDefinitionArea}     DisplayFilterMoveArea
${popupMoveFilterNotification}      css=#popupNotification
${btnCloseFilterNotification}       btn-popupNotification0
${btnSubmitFilterConfirmation}      btn-popupNotification1

#Statistics
${tabDisplayStatistic}     css=#DisplayStatistic

#Generic
${btnSaveDisplay}    btn-popupDisplayDetail2
${btnSaveDisplayAs}    btn-popupDisplayDetail1
${btnCloseDisplayDetailPopup}    css=.popupDisplayDetail .k-i-close
${btnCloseJumpNotification}       btn-popupNotification0
${btnSubmitJumpConfirmation}      btn-popupNotification1

*** Keywords ***
Wait Display Detail Document Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains    Display details
    Wait Until Page Contains    Save
    Wait Until Page Contains    Cancel
    Wait Until Element Is Visible    ${tabDisplayGeneral}
    Wait Until Element Is Visible    ${tabDisplayFilterAndJumps}

Close Display Detail Popup
    Wait Until Element Is Visible    ${btnCloseDisplayDetailPopup}
    Click Element    ${btnCloseDisplayDetailPopup}

Input Display Name
    [Arguments]    ${displayName}
    Wait Until Element Is Visible    ${txtDisplayName}
    Input Text    ${txtDisplayName}    ${displayName}

Input Display Description
    [Arguments]    ${displayDescription}
    Input kendo Text Editor    ${txtDisplayDescription}     ${displayDescription}

Click Checkbox Execute At Login
    Select Checkbox      ${chkDisplayExecuteAtLogin}

Click Checkbox Default Display
    Select Checkbox      ${chkDefaultDisplay}

Click Add Language Button on Display
    Wait Until Element Is Visible    ${btnAddLanguageDisplay}
    Click Element    css=.btnAddLanguage

Selct Dutch Language From Language List on Display
    Wait Until Element Is Visible    ${displayLanguageAvailableList}:contains(Dutch)
    Click Element    ${displayLanguageAvailableList}:contains(Dutch)

Selct French Language From Language List on Display
    Wait Until Element Is Visible    ${displayLanguageAvailableList}:contains(French)
    Click Element    ${displayLanguageAvailableList}:contains(French)

Select English Language On Display
    Click Element    ${displayLanguageItem}:contains(English)

Select Dutch Language On Display
    Click Element    ${displayLanguageItem}:contains(Dutch)

Select French Language On Display
    Click Element    ${displayLanguageItem}:contains(French)

Display Name Should Be Equal
    [Arguments]    ${DisplayName}
    ${compareDisplayName}    Get Value    ${txtDisplayName}
    Should Be Equal    ${compareDisplayName}    ${DisplayName}

Display Description Should Be Equal
    [Arguments]    ${displayDescription}
    ${compareAngleDescription}    Get Value    ${txtDisplayDescription}
    Should Be Equal    ${compareAngleDescription}    ${displayDescription}

Display English Language Should Be Available
    Page Should Contain Element    ${displayLanguageItem}:contains(English)

Choose Display Type From Display Details Popup
    [Arguments]    ${choosevalue}
    Select Dropdown By Selector    ${ddlDisplayType}    jquery=#tempDisplayType_listbox .${choosevalue}

Save Display Detail From Popup
    Click Element    ${btnSaveDisplay}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Save Display Detail From Popup With Jump
    Click Element    ${btnSaveDisplay}
    Wait Until Page Contains    Confirmation
    Wait Until Element Is Visible    ${btnSubmitJumpConfirmation}
    Click Element    ${btnSubmitJumpConfirmation}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Save Display As On Display Detail From Popup
    Click Element    ${btnSaveDisplayAs}

Click Display Detail General Tab
    Wait Until Element Is Visible    ${tabDisplayGeneral}
    Click Element    ${tabDisplayGeneral}

Click Display Detail Filter And Jumps Tab
    Wait Until Element Is Visible    ${tabDisplayFilterAndJumps}
    Click Element    ${tabDisplayFilterAndJumps}

Click Add Filter In Display Filter And Jumps Tab
    Wait Until Element Is Visible    ${btnAddDisplayFilter}
    Click Element    ${btnAddDisplayFilter}

Click Add Jump In Display Filter And Jumps Tab
    Wait Until Element Is Visible    ${btnAddDisplayJump}
    Click Element    ${btnAddDisplayJump}
    Wait Until Add Jump Popup Loaded

Get Filter Or Jump Name From Display Details Popup
    [Arguments]    ${index}
    ${text}    Get Text   css=#FilterHeader-${index} .filterText
    [Return]    ${text}

Set Enum Filter In List Value From Display Details Popup
    [Arguments]    ${index}
    Execute JavaScript    $('#ValueList-${index} :checkbox').click()

Collapse All Display Filters
    Execute Javascript    $('${divExpandedFilters}').click();
    Sleep    ${TIMEOUT_GENERAL}

Move Display Filter By Index
    [Arguments]    ${moveFilterIndex}    ${targetFilterIndex}
    Collapse All Display Filters
    ${offsetY}    Execute JavaScript    return (function(){var x=(${targetFilterIndex} - ${moveFilterIndex}) * 44; return x < 0 ? x - 5 : x + 5 })()
    Drag And Drop By Offset    FilterHeader-${moveFilterIndex}    0    ${offsetY}
    #Drag And Drop    FilterHeader-${moveFilterIndex}    FilterHeader-${targetFilterIndex}
    Sleep    ${TIMEOUT_GENERAL}

Move Display Filter To Angle Definition By Index
    [Arguments]    ${moveFilterIndex}
    Collapse All Display Filters
    ${offsetY}    Execute JavaScript    return -44 * (${moveFilterIndex}+1)
    Drag And Drop By Offset    FilterHeader-${moveFilterIndex}    0    ${offsetY}
    Sleep    ${TIMEOUT_GENERAL}

Confirm To Move Filter To Angle Definition
    Wait Until Page Contains    Confirmation
    Wait Until Element Is Visible    ${btnSubmitFilterConfirmation}
    Click Element    ${btnSubmitFilterConfirmation}

Page Should Display Move Filter Warning Popup
    Sleep    ${TIMEOUT_GENERAL}
    Element Should Be Visible    ${popupMoveFilterNotification}

Close Move Filter Warning Popup
    Wait Until Element Is Visible    ${btnCloseFilterNotification}
    Click Element    ${btnCloseFilterNotification}

Click Display Detail DisplayStatistic Tab
    Wait Until Element Is Visible    ${tabDisplayStatistic}
    Click Element    ${tabDisplayStatistic}
