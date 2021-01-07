*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Test Template       Set Facet Filter
Force Tags          acc_wc  acc_wc_aci

*** Test Cases ***                          Name                Element
Search angle by filter Angle                Angle               ${lblCountAngle}
    [Documentation]     This test is to verify if angle filter is being applied to filter through the angles
    [Tags]      TC_C143822
Search angle by filter Template             Template            ${lblCountTemplate}
    [Documentation]     This test is to verify if template filter is being applied to filter through the templates
    [Tags]      TC_C143822
Search angle by filter Dashboard            Dashboard           ${lblCountDashboard}
    [Documentation]     This test is to verify if dashboard filter is being applied to filter through the dashboards
    [Tags]      TC_C143822
Search angle by filter Is Private           IsPrivate           ${lblCountIsPrivate}
    [Documentation]     This test is to verify if private filter is being applied to filter through the private items
    [Tags]      TC_C143822
Search angle by filter Is Validated         IsValidated         ${lblCountIsValidated}
    [Documentation]     This test is to verify if validated filter is being applied to filter through the validated items
    [Tags]      TC_C143822
Search angle by filter Is Starred           IsStarred           ${lblCountIsStarred}
    [Documentation]     This test is to verify if starred filter is being applied to filter through the starred items
    [Tags]      TC_C143822
Search angle by filter Created              Created             ${lblCountCreated}
    [Documentation]     This test is to verify if created filter is being applied to filter through the items created by logged in user
    [Tags]      TC_C143822
Search angle by filter Can Validate         CanValidate         ${lblCountCanValidate}
    [Documentation]     This test is to verify if can validate filter is being applied to filter through the items that can be validated by logged in user
    [Tags]      TC_C143822
Search angle by filter Can Manage           CanManage           ${lblCountCanManage}
    [Documentation]     This test is to verify if can manage filter is being applied to filter through the items that can be managed by logged in user
    [Tags]      TC_C143822
Search angle by filter Model                Model               ${lblCountModel}
    [Documentation]     This test is to verify if model filter is being applied to filter through the items in that particular model
    [Tags]      TC_C143822