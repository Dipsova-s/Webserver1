*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Open Browser in Sandbox Mode
Suite Teardown      Close Browser
Test Setup          Go To               ${URL_MC}
Test Teardown       Logout MC
Force Tags          MC   smk_mc

*** Variables ***
${fileImagePath}                           ${EXECDIR}/resources/test.png
${filePath}                                ${EXECDIR}/resources/Robot-Test-1.eapackage

*** Test Cases ***
Test Welcome Page
    [Documentation]    This test case deals with entering welcome note/message and uploading customer logo in Welcome page of ITMC. It also verifies the same in Search page of WC.
    [Tags]      TC-625      TC-628
    Login To MC By Admin User
    Wait Until Overview Page Loaded
    Go To Welcome Page
    Assert Welcome Page Available Languages
    Select Language, Input Welcome page Textbox 1 And Message Textbox 2    English   Test Textbox 1 English Language   This for News text
    Select Language, Input Welcome page Textbox 1 And Message Textbox 2    Dutch   Test Textbox 1 Dutch Languange   This for News text    
    Click Upload Customer Logo      ${fileImagePath}
    Click Save Welcome Page
    Assert Welcome Page Textbox 1       English   Test Textbox 1 English Language
    Assert Welcome Page Textbox 1       Dutch   Test Textbox 1 Dutch Languange
    Assert Welcome Page Textbox 2    This for News text
    Check Upload success of Customer Logo

    # switch to WC window and check Customer logo
    Click User Menu
    Click Open Web Client on User Menu    
    Assert Search Page Text    Get Search Page Text 1   Test Textbox 1 English Language
    Assert Search Page Text    Get Search Page Text 2    This for News text
    Check and Verify Customer Logo exists
    Close Window
    Switch Window    IT Management Console

