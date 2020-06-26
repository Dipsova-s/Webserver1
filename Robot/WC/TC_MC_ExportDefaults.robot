*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To Export Defaults Link With Admin User
Suite Teardown      Logout MC Then Close Browser
Force Tags          acc_mc

*** Test Cases ***
Verify Export Defaults
    [Documentation]     This test case deals with verifying presence of Export Defaults sub-tabs
    ...                 and navigation to Exports Defaults pages for CSV & Excel
    [Tags]      TC_C229573
    Check Count And Names of Export Defaults Link    Export to CSV   Export to Excel
    Check Export Defaults Page      csv     Export defaults     Export to CSV
    Check Export Defaults Page      msexcel     Export defaults     Export to Excel