*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Force Tags          acc_wc    smk_content

*** Test Cases ***
Verify Help Text Links
    Search Angle From Search Page And Execute Angle    Angle For General Test
    Click Add New Column To List
    Fill In Search Field Chooser  "Margin"
    Click Field Chooser Info  field-Margin
    Click Help Text Link  EA_PROPERTY_SalesValue    # 2nd window
    Click Help Text Link  EA_TOPIC_UserCurrency     # 3rd window
    ${windows}  Get Window Handles
    Length Should Be  ${windows}  3
    Close Window
    Switch Window  ${windows[1]}
    Close Window
    Switch Window  MAIN

Verify Web Client Link
    Open Web Client Help Page
    ${windows}  Get Window Handles
    Length Should Be  ${windows}  2
    Close Window
    Switch Window  MAIN