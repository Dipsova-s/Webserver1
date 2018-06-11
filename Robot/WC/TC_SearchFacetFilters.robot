*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Go to Search Page
Test Template       Set Facet Filter
Force Tags          acceptance    acc_wc

*** Test Cases ***                          Name                Element
Search angle by filter Angle                Angle               ${lblCountAngle}
Search angle by filter Template             Template            ${lblCountTemplate}
Search angle by filter Dashboard            Dashboard           ${lblCountDashboard}
Search angle by filter Is Private           IsPrivate           ${lblCountIsPrivate}
Search angle by filter Is Validated         IsValidated         ${lblCountIsValidated}
Search angle by filter Is Starred           IsStarred           ${lblCountIsStarred}
Search angle by filter Created              Created             ${lblCountCreated}
Search angle by filter Can Validate         CanValidate         ${lblCountCanValidate}
Search angle by filter Can Manage           CanManage           ${lblCountCanManage}
Search angle by filter Model                Model               ${lblCountModel}