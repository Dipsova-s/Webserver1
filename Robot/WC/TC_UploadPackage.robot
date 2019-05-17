*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags        	acc_wc

*** Test Cases ***
Upload Valid Package
    Back To Search And Delete Angle Are Created    [ROBOT] angle dashboard
    Upload Item  Robot-Test-ExportWebClient-1.eapackage  EA2_800

    # 6 items were imported
    Upload Item Report Should Contain     Robot-Test-ExportWebClient-1.eapackage
    Number Of Search Results Should Be    6

    # 2 items cannot be imported
    Upload Item Report Should Contain     [ROBOT] angle dashboard 3
    Upload Item Report Should Contain     [ROBOT] angle dashboard fail #1
    Upload Item Report Should Contain     invalid_label doesn't exist

    Close Upload Item Report Popup

    [Teardown]    Delete All Search Result Items

Upload Invalid Package
    Search By Text    [ROBOT] angle dashboard
    Upload Item  Robot-Test-ExportWebClient-bad-1.eapackage  EA2_800
    Upload Item Report Should Contain     Invalid package source
    Close Upload Item Report Popup