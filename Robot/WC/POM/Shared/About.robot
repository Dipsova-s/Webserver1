*** Variables ***
#help menu
${btnHelp}                           Help
${divHelpMenu}                       HelpMenu
${btnAbout}                          css=.btnAbout
${btnWebClientHelp}                  css=.btnHelp

#about popup
${divCommon}                         css=.aboutCommon
${linkCopyRight}                     css=.copyRight a
${btnCloseAboutPopup}                css=.k-i-close

#copyright
${copyrightRow}                    css=.licensetable tr
${clientVersionValue}              xpath=//div[@data-bind='text: web_client_version']
*** Keywords ***
Open Copyright Page
    Click Element                       ${linkCopyRight}

Open About Popup
    Click Help Menu
    Wait Until Element Is Visible       ${btnAbout}
    Click Element                       ${btnAbout}
    Wait Until Ajax Complete
    Wait Until Page Contains Element     ${divCommon}

Click Help Menu
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${btnHelp}
    Click Element                       ${btnHelp}
    Wait Until Element Is Visible       ${divHelpMenu}

Open Web Client Help Page
    Click Help Menu
    Click Element  ${btnWebClientHelp}
    Switch Window  NEW
    Wait Until Keyword Succeeds  1 min  2 sec  Title Should Be  Introduction

Close About Popup
    Click Element                       ${btnCloseAboutPopup}
    Sleep                               ${TIMEOUT_GENERAL}

Wait Until License and Copyright Loaded
    Wait Until Page Contains    License and Copyright

Get Number of License
    ${count} =  Get Element Count   ${copyrightRow}      
    [Return]    ${count} 

