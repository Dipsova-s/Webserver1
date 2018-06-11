*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Force Tags          allangles_i

*** Test Cases ***
Run Angle
    Run Keyword And Ignore Error    Log    %{PROCESSOR_IDENTIFIER}
    Run Keyword And Ignore Error    Log    %{PROCESSOR_LEVEL}
    Search Filter By Query String    ${QueryString}
    Write All Angles in Search Result to Test File    20
