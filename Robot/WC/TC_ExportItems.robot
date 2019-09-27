*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Test Cases ***
Verify Export Item From Action Menu
    ${angleName}  Set Variable  Angle For General Test
    Search By Text And Expect In Search Result    ${angleName}
    Check Existing Angle From Search Result    ${angleName}
    Check First Angle From Search Result Is Public
    Click Search Filter Model
    Click Select First Item From Search Result
    Wait Until Element Contains    ${lblSearchResult}    1 item(s) selected
    Click Search Action Download Items
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
