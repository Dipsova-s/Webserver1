*** Variables ***
${btnOpenWebClient}    css=.btnWC

${btnHideMenu}    css=.textHideMenu
${btnShowMenu}    css=.textShowMenu

${btnReload}      css=#pageToolbarButton .btnReload

${scrollBarGrid}            css=.k-scrollbar
${btnAction}                .btnGroupContainer a:first
${btnView}                  .btn btnInfo.first
${btnDelete}                .btnDelete.first

*** Keywords ***
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
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:contains(${name})
    Click Element At Coordinates   ${trRowInGrid}:contains(${name}) ${btnAction}    10    0

Click Show Action Dropdown In Grid By Index
    [Arguments]    ${index}    ${trRowInGrid}
    Wait Until Page Contains Element    ${trRowInGrid}:eq(${index}) ${btnAction}
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:eq(${index})
    Click Element At Coordinates   ${trRowInGrid}:eq(${index}) ${btnAction}    10    0

Click Main Action In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Scroll Vertical To Element    ${scrollBarGrid}    ${trRowInGrid}:contains(${name})
    Click Element    ${trRowInGrid}:contains(${name}) ${btnAction}

Click Action In Grid By Name
    [Arguments]    ${name}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:contains(${name}) ${btnAction}
    Sleep    ${TIMEOUT_GENERAL}
    Click Element    ${trRowInGrid}:contains(${name}) ${btnAction}

Click Action In Grid By Index
    [Arguments]    ${index}    ${trRowInGrid}    ${btnAction}
    Wait Until Page Contains Element    ${trRowInGrid}:eq(${index}) ${btnAction}
    Click Element    ${trRowInGrid}:eq(${index}) ${btnAction}


