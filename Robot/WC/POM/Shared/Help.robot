*** Variables ***
${HelpIconWC}              id=HelpIcon
${HelpIconITMC}            id=HelpMenuControl
${SupportButtonText}     xpath=//a/span[text()='Support']
${SupportButton}         //a[@class='actionDropdownItem btnSupport']

*** Keywords ***
Click on Help icon in WC
    Wait Until Ajax Complete
    Custom click element  ${HelpIconWC}

Click on Help icon in ITMC
    Wait Until Ajax Complete
    Custom click element  ${HelpIconITMC}

Validate Support button Should be displayed in WC
    Wait Until Ajax Complete
    # validate Support button is displayed
    page should contain element   ${SupportButtonText}   message=Support button is not displayed
    
Click on Support Button
    Custom click element  ${SupportButton}

Validate user is redirected to online support portal
    Select Window   title=Welcome to Magnitude’s Support Community | Magnitude Software   timeout=15s
    Wait Until Ajax Complete
    ${SupportUrl}=  Get Location
    should contain  ${SupportUrl}   https://magnitude.com/online-support/

Validate Support button Should be displayed in ITMC
    Wait Until Ajax Complete
    # validate Support button is displayed
    page should contain element   ${SupportButtonText}   message=Support button is not displayed

