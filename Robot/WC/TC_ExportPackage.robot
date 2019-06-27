*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags          acc_wc

*** Variables ***
${TEST_VERIFY_EXPORT_TO_ANGLE}     Angle For General Test

*** Test Cases ***
Verify Export Angle From Action Menu
    Search By Text And Expect In Search Result    ${TEST_VERIFY_EXPORT_TO_ANGLE}
    Check Existing Angle From Search Result    ${TEST_VERIFY_EXPORT_TO_ANGLE}
    Check First Angle From Search Result Is Public
    Click Search Filter Model
    Click Select First Item From Search Result
    Wait Until Element Contains    ${lblSearchResult}    1 item(s) selected
    Click Search Action Download Angle
	Click Export Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
