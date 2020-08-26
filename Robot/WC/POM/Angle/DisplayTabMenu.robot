*** Variables ***
${divDisplayTab}                        jquery=#DisplayTabs
${divDisplayTabMenus}                   ${divDisplayTab} .tab-menu
${divActiveDisplayTabMenu}              ${divDisplayTab} .tab-menu.active
${divDisplayGroupPublic}                ${divDisplayTab} .tab-menu-header:contains(Public)
${divDisplayGroupPrivate}               ${divDisplayTab} .tab-menu-header:contains(Private)
${divDisplayGroupOther}                 ${divDisplayTab} .tab-menu-header:contains(Other)

*** Keywords ***
Wait Until Display Tab Is Ready
    Wait Until Page Contains Element    ${divDisplayTab}.active
    Wait Until Page Contains Element    ${divDisplayTabMenus}

Open Display Group
    [Arguments]  ${element}
    ${closed}  Is Element Has CssClass  ${element}  close
    Run Keyword If  ${closed}  Click Element  ${element}
    Sleep  ${TIMEOUT_GENERAL}

Close Display Group
    [Arguments]  ${element}
    ${closed}  Is Element Has CssClass  ${element}  open
    Run Keyword If  ${closed}  Click Element  ${element}
    Sleep  ${TIMEOUT_GENERAL}

Page Should Contain Display Group Public
    Page Should Contain Element  ${divDisplayGroupPublic}
Page Should Not Contain Display Group Public
    Page Should Not Contain Element  ${divDisplayGroupPublic}
Open Display Group Public
    Open Display Group  ${divDisplayGroupPublic}
Close Display Group Public
    Close Display Group  ${divDisplayGroupPublic}
Display Group Public Should Be Opened
    Page Should Contain Element  ${divDisplayGroupPublic}.open
Display Group Public Should Be Closed
    Page Should Contain Element  ${divDisplayGroupPublic}.close

Page Should Contain Display Group Private
    Page Should Contain Element  ${divDisplayGroupPrivate}
Page Should Not Contain Display Group Private
    Page Should Not Contain Element  ${divDisplayGroupPrivate}
Open Display Group Private
    Open Display Group  ${divDisplayGroupPrivate}
Close Display Group Private
    Close Display Group  ${divDisplayGroupPrivate}
Display Group Private Should Be Opened
    Page Should Contain Element  ${divDisplayGroupPrivate}.open
Display Group Private Should Be Closed
    Page Should Contain Element  ${divDisplayGroupPrivate}.close

Page Should Contain Display Group Other
    Page Should Contain Element  ${divDisplayGroupOther}
Page Should Not Contain Display Group Other
    Page Should Not Contain Element  ${divDisplayGroupOther}
Open Display Group Other
    Open Display Group  ${divDisplayGroupOther}
Close Display Group Other
    Close Display Group  ${divDisplayGroupOther}
Display Group Other Should Be Opened
    Page Should Contain Element  ${divDisplayGroupOther}.open
Display Group Other Should Be Closed
    Page Should Contain Element  ${divDisplayGroupOther}.close

Open All Display Groups
    Open Display Group Public
    Open Display Group Private
    Open Display Group Other

Select Display Tab By Index
    [Arguments]  ${index}
    Select Display Tab    ${divDisplayTabMenus}:eq(${index})

Select Display Tab By Name
    [Arguments]  ${name}
    Select Display Tab    ${divDisplayTabMenus}[data-title="${name}"]

Select Display Tab
    [arguments]    ${tabMenuElement}
    Wait Until Display Tab Is Ready
    Open All Display Groups
    Click Element    ${tabMenuElement}
    Wait Display Executed

Click To Remove Display
    [arguments]    ${tabMenuElement}
    Wait Until Display Tab Is Ready
    Open All Display Groups
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

Display Tab Should Be Visible By Name
    [Arguments]  ${name}
    Element Should Be Visible    ${divDisplayTabMenus}[data-title="${name}"]
    
Display Tab Should Not Be Visible By Name
    [Arguments]  ${name}
    Element Should Not Be Visible    ${divDisplayTabMenus}[data-title="${name}"]