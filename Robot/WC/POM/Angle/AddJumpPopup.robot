*** Variables ***
${divAddjumpPopup}          css=#popupFollowup
${btnCloseAddjumpPopup}     css=#popupFollowup_wnd_title + .k-window-actions .k-i-close
${btnSubmitAddJump}         css=.popupFollowup .btn-primary
${gridJumpReferences}       css=#popupFollowup .followupBlock.up
${gridJumpLists}            css=#popupFollowup .followupBlock.down
${gridJumpPrevious}         css=#popupFollowup .followupBlock.left
${gridJumpNext}             css=#popupFollowup .followupBlock.right
${tdJumpItem}               css=#popupFollowup .k-grid-content td

*** Keywords ***
Wait Until Add Jump Popup Loaded
    Wait Until Page Contains Element    ${gridJumpReferences}
    Wait Until Element Is Visible    ${gridJumpReferences}
    Wait Until Ajax Complete
    Sleep    ${TIMEOUT_GENERAL}     Waiting for animation

Click Select Jump by Name
    [Arguments]    ${name}
    # get classs name and covert to selector, e.g.
    # followupBlock up k-grid k-widget --> .followupBlock.up.k-grid.k-widget
    ${selectTarget}    Set Variable    ${divAddjumpPopup} td[title="${name}"]
    ${targetGrid}   Execute Javascript    return '.' + $('#popupFollowup td[title="${name}"]').closest('.k-grid').attr('class').replace(/ /g, '.')
    Scroll Vertical To Element    jquery=${targetGrid} .k-auto-scrollable    ${selectTarget}
    ${isSelected}    Execute JavaScript   return $('#popupFollowup td[title="${name}"]').parent().hasClass('k-state-selected');
    Run Keyword If   ${isSelected} == ${False}    Click Element    ${selectTarget}

Click Add Jump Button
    Click Element    ${btnSubmitAddJump}
    Wait Progress Bar Closed
    Wait Until List Display Loaded

Click Close Add Jump Popup
    Wait Until Element Is Visible    ${btnCloseAddjumpPopup}
    Click Element    ${btnCloseAddjumpPopup}

Jump Should Be Existed In Popup
    [Arguments]    ${jumpName}
    Page Should Contain Element    ${tdJumpItem}[title="${jumpName}"]