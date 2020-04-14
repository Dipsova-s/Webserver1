*** Variables ***
${btnOpenWebClient}    css=.btnWC

${btnHideMenu}    css=.textHideMenu
${btnShowMenu}    css=.textShowMenu

${btnReload}      css=#pageToolbarButton .btnReload

${scrollBarGrid}            css=.k-scrollbar
${scrollBarHorizontalGrid}  css=.k-virtual-scrollable-wrap
${btnAction}                .btnGroupContainer a:first
${btnView}                  .btn btnInfo.first
${btnDelete}                .btnDelete.first


*** Keywords ***
Go To MC Page
    [Arguments]    ${location}
    ${targetLocation}    Set Variable    ${URL_MC}/home/index#${location}
    ${currentLocation}    Get Location
    Run Keyword If    '${currentLocation}'=='${targetLocation}'    Reload Page
    ...        ELSE    Go To    ${targetLocation}
    Wait MC Progress Bar Closed

Click User Menu MC
    Wait MC Progress Bar Closed
    Wait Until Element Is Visible    ${btnUserMenuMC}
    Click Element    ${btnUserMenuMC}

Click Open Web Client
    Wait Until Element Is Visible    ${btnOpenWebClient}
    Click Element    ${btnOpenWebClient}

Click Hide Menu
    Wait Until Element Is Visible    ${textHideMenu}
    Click Element    ${textHideMenu}

Click Show Menu
    Wait Until Element Is Visible    ${textShowMenu}
    Click Element    ${textShowMenu}

Click Reload MC Page
    Wait Until Element Is Visible    ${btnReload}
    Click Element    ${btnReload}

#Grid Action Utility
Click Show Action Dropdown In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Scroll Horizontal  ${scrollBarHorizontalGrid}  2000
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:contains(${name})
    Click Element At Coordinates   ${trRowInGrid}:contains(${name}) ${btnAction}    10    0

Click Show Action Dropdown In Grid By Index
    [Arguments]    ${index}    ${trRowInGrid}
    Wait Until Page Contains Element    ${trRowInGrid}:eq(${index}) ${btnAction}
    Scroll Horizontal  ${scrollBarHorizontalGrid}  2000
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:eq(${index})
    Click Element At Coordinates   ${trRowInGrid}:eq(${index}) ${btnAction}    10    0

Click Main Action In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Scroll Horizontal  ${scrollBarHorizontalGrid}  2000
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:contains(${name})
    Click Element    ${trRowInGrid}:contains(${name}) ${btnAction}

Click Action In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}    ${btnAction}
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Sleep    ${TIMEOUT_GENERAL}
    Click Element    ${trRowInGrid}:contains(${name}) ${btnAction}

Click More Action In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Sleep    ${TIMEOUT_GENERAL}
    Click Element At Coordinates    ${trRowInGrid}:contains(${name}) ${btnAction}    10     5

Click Action In Grid By Index
    [Arguments]    ${index}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:eq(${index}) ${btnAction}
    Click Element    ${trRowInGrid}:eq(${index}) ${btnAction}