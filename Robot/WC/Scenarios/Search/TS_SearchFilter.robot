*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Set Facet Filter
    [Arguments]    ${facetName}    ${lblCountItem}
    Run Keyword If    '${facetName}' == 'Angle'    Click Search Filter Angle
    Run Keyword If    '${facetName}' == 'Template'    Click Search Filter Template
    Run Keyword If    '${facetName}' == 'Dashboard'    Click Search Filter Dashboard
    Run Keyword If    '${facetName}' == 'IsPrivate'    Click Search Filter Is Private
    Run Keyword If    '${facetName}' == 'PrivateDisplay'    Click Search Filter Private Display
    Run Keyword If    '${facetName}' == 'IsValidated'    Click Search Filter Is Validated
    Run Keyword If    '${facetName}' == 'IsStarred'    Click Search Filter Is Starred
    Run Keyword If    '${facetName}' == 'Created'    Click Search Filter Created
    Run Keyword If    '${facetName}' == 'CanValidate'    Click Search Filter Can Validate
    Run Keyword If    '${facetName}' == 'CanManage'    Click Search Filter Can Manage
    Run Keyword If    '${facetName}' == 'Model'    Click Search Filter Model
    Wait Progress Bar Search Closed
    Wait Until Ajax Complete
    ${expectedResult}    Get Text     ${lblSearchTotal}
    ${lblLabelResult}    Get Text     ${lblCountItem}>.filter-name
    ${lblCountResult}    Get Text     ${lblCountItem}>.filter-count
    Should Contain    ${lblCountResult}    ${expectedResult}
    Element Should Contain    ${divSearchFilterView}    ${lblLabelResult}
