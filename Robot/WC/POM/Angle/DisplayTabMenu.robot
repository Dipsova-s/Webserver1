*** Variables ***
${divDisplayTab}                        jquery=#DisplayTabs
${divDisplayTabMenus}                   jquery=#DisplayTabs .tab-menu
${divActiveDisplayTabMenu}              jquery=#DisplayTabs .tab-menu.active
${btnAddNewDisplay}                     jquery=#DisplayTabs .btn-new-display
${displayPopup}                         jquery=#DisplayTabs .new-display-popup

*** Keywords ***
Wait Until Display Tab Is Ready
    Wait Until Page Contains Element    ${divDisplayTab}.active
    Wait Until Page Contains Element    ${divDisplayTabMenus}

Select Display Tab By Index
    [Arguments]  ${index}
    Select Display Tab    ${divDisplayTabMenus}:eq(${index})

Select Display Tab By Name
    [Arguments]  ${name}
    Select Display Tab    ${divDisplayTabMenus}[data-title="${name}"]

Select Display Tab
    [arguments]    ${tabMenuElement}
    Wait Until Display Tab Is Ready
    Click Element    ${tabMenuElement}
    Wait Display Executed

Click To Remove Display
    [arguments]    ${tabMenuElement}
    Wait Until Display Tab Is Ready
    Mouse Over    ${tabMenuElement}
    Click Element    ${tabMenuElement} .icon-close

Click To Remove Active Display
    Click To Remove Display    ${divActiveDisplayTabMenu}

Active Display Should Mark As UnSaved
    Page Should Contain Element  ${divActiveDisplayTabMenu} .sign-unsaved

All Displays Should Mark As Saved
    Page Should Not Contain Element  ${divDisplayTabMenus} .sign-unsaved
    
Display Should Mark As UnSaved
    [Arguments]  ${name}
    Page Should Contain Element    ${divDisplayTabMenus}[data-title="${name}"] .sign-unsaved

Active Display Should Be Visible
    Element Should Be Visible  ${divActiveDisplayTabMenu}  

Active Display Should Be
    [arguments]    ${name}
    Page Should Contain Element  ${divActiveDisplayTabMenu}[data-title="${name}"]

Wait Display Type Popup Loaded
    Wait Until Page Contains Element    ${displayPopup}
    Wait Until Element Is Visible       ${displayPopup}

Display Tab Should Be Visible By Name
    [Arguments]  ${name}
    Element Should Be Visible    ${divDisplayTabMenus}[data-title="${name}"]
    
Display Tab Should Not Be Visible By Name
    [Arguments]  ${name}
    Element Should Not Be Visible    ${divDisplayTabMenus}[data-title="${name}"]