*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags          acc_wc_s

*** Variables ***
${TEST_SEARCH_TERM_1}      Example text for search terms 1
${TEST_SEARCH_TERM_2}      Example text for search terms 2
${TEST_SEARCH_TERM_3}      Example text for search terms 3
${TEST_SEARCH_TERM_4}      Example text for search terms 4
${TEST_SEARCH_TERM_5}      Example text for search terms 5
${TEST_SEARCH_TERM_6}      Example text for search terms 6

*** Test Cases ***
Verify Search Terms
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_1}
    Blur Search Input
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_2}
    Blur Search Input
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_3}
    Blur Search Input
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_4}
    Blur Search Input
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_5}
    Blur Search Input
    Search By Text Without Double Quote     ${TEST_SEARCH_TERM_6}
    Blur Search Input

    Sleep    ${TIMEOUT_GENERAL}
    Click Search Input
    Search Terms Should Visible
    Search Terms Should Not Contain         ${TEST_SEARCH_TERM_1}
    Search Terms Should Contain             ${TEST_SEARCH_TERM_2}
    Search Terms Should Contain             ${TEST_SEARCH_TERM_3}
    Search Terms Should Contain             ${TEST_SEARCH_TERM_4}
    Search Terms Should Contain             ${TEST_SEARCH_TERM_5}
    Search Terms Should Contain             ${TEST_SEARCH_TERM_6}

    Blur Search Input
    Sleep    ${TIMEOUT_GENERAL}
    Click Search Input
    Click Last Item Search Term
    Wait Progress Bar Search Closed
    Wait Search Terms Closed
    Search Input Should Be                  ${TEST_SEARCH_TERM_2}
