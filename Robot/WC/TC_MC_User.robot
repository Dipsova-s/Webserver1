*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go To All Users Page With Admin User
Suite Teardown      Logout MC Then Close Browser
Test Teardown       Go To All Users Page
Force Tags          acc_mc  


*** Test Cases ***
Test CRUD User
    [Documentation]     This test performs the Crud Operation Adding and Deleting the User
    Add User
    Delete User    ${username}