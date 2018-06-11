*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags          acceptance

*** Variables ***
${TEST_VERIFY_EXPORT_TO_PACKAGE}     Angle For General Test
${PACKAGE_NAME}     Test_Export_Angle_To_Package

*** Test Cases ***
Verify Export Package From Action Menu
    Search By Text And Expect In Search Result    ${TEST_VERIFY_EXPORT_TO_PACKAGE}
    Check Existing Angle From Search Result    ${TEST_VERIFY_EXPORT_TO_PACKAGE}
    Check First Angle From Search Result Is Public
    Click Search Filter Model
    Click Select First Item From Search Result
    Wait Until Element Contains    ${lblSearchResult}    1 item(s) selected
    Click Search Action Create EA Package
    Select Export As Package
    Input Package Name    ${PACKAGE_NAME}
    Click Export Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}
