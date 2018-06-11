*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Power User
Suite Teardown      Logout WC Then Close Browser
Test Setup          Empty Download Directory
Test Teardown       Go to Search Page
Force Tags        	acceptance_notnow

*** Variables ***
${TEST_DATETIME_FIELD}    _prop_moment

*** Test Cases ***
Verify Datetime Field Type
    Search Filter By Item IDS    EA_SCM_Object_Material
    Check Existing Angle From Search Result    Material
    Open Angle From First Angle in Search Page    Material
    Wait Angle Detail Document Loaded
    Close Angle Detail Popup
    Change Display By Name    Basic List
    Add Column By Search And Add To List Display If Not Exist    ${TEST_DATETIME_FIELD}    ${TEST_DATETIME_FIELD}

    ${expect} =    Get Cell Value From List Display    ${TEST_DATETIME_FIELD}    datetime

    Click Header by Data Field Angle Grid List Display    ${TEST_DATETIME_FIELD}
    Click Show Add Filter Popup From List Header Column
    Choose Dropdown Filter Operator Via Add Filter Popup    is before or on
    Input First Input Datetime Picker Via Add Filter Popup    ${expect}:00
    Click OK Add Filter to List

    List Filter Datetime Result Should Be True    ${TEST_DATETIME_FIELD}    <=    ${expect}

    Click Angle Dropdown To Export Excel
    Click Export Excel Button
    ${file}    Wait Until Keyword Succeeds    1 min    2 sec    Download should be done    ${DOWNLOAD_DIRECTORY}