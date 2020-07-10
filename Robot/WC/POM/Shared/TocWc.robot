*** Variables ***
${iconHelpWc}              id=HelpIcon
${optionHelpPage}        //a[@class='actionDropdownItem btnHelp']/span[contains(text(),'Help page')]
${titleHelpPages}        //div[@class='titlepage']/div/div[2]/h3[contains(text(),'Help pages')]
${leftPanelHelpPage}      //aside[@class='site-sidebar']



*** Keywords ***
Click Help icon in WC
    Wait Until Ajax Complete
    Custom click element  ${HelpIconWC}

Click On Help Page Option In WC Help
    Wait Until Element Is Visible      ${optionHelpPage}
    Click Element     ${optionHelpPage}

